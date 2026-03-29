"""信息智能拆解萃取模块

从采集的文章中提取：
- 量化数据：营收、融资、市值、产能、订单、人员规模、汇率收支等
- 经营异动：股权变更、高管调整、业务关停/扩张、海外站点变动、合作并购
- 重大事件：合规处罚、纠纷诉讼、品牌负面、政策关联、上市/退市、舆情危机
"""

import re
import json
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
import asyncio

from app.models import (
    Article, ExtractedInfo, QuantitativeData, BusinessEvent, EventType
)
from app.config import settings


class BaseExtractor(ABC):
    """提取器基类"""

    def __init__(self):
        pass

    @abstractmethod
    async def extract(self, article: Article) -> ExtractedInfo:
        """从文章中提取信息"""
        pass


class LLMExtractor(BaseExtractor):
    """基于大语言模型的提取器"""

    EXTRACTION_PROMPT = """你是一个专业的财经信息提取助手。请从以下文章中提取关键信息。

文章标题：{title}
文章内容：{content}

请提取以下信息并以JSON格式返回：

1. 公司名称（文章关注的主要企业）
2. 量化数据（营收、融资、市值、产能、订单、人员规模等数值数据）
3. 经营异动事件（股权变更、高管调整、业务关停/扩张、合作并购等）
4. 重大事件（合规处罚、纠纷诉讼、品牌负面、上市/退市等）
5. 关键实体（涉及的人物、公司、机构等）
6. 事件摘要（100字以内）

返回格式示例：
{{
    "company_name": "公司名称",
    "quantitative_data": [
        {{
            "metric_name": "营收",
            "value": 100,
            "unit": "亿元",
            "change_type": "增长",
            "change_percentage": 20.5,
            "period": "2024年Q1"
        }}
    ],
    "business_events": [
        {{
            "event_type": "高管调整",
            "description": "XX接替YY担任CEO",
            "entities": ["XX", "YY"]
        }}
    ],
    "major_events": ["合规处罚: 因XX被罚款YY万元"],
    "entities": ["公司A", "人物B"],
    "summary": "文章摘要..."
}}
"""

    def __init__(self, api_key: str = None, base_url: str = None, model: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = base_url or settings.OPENAI_BASE_URL
        self.model = model or settings.LLM_MODEL

    async def extract(self, article: Article) -> ExtractedInfo:
        """使用LLM提取信息"""
        if not self.api_key:
            return await self._fallback_extract(article)

        try:
            import httpx

            prompt = self.EXTRACTION_PROMPT.format(
                title=article.title,
                content=article.content[:4000]  # 限制长度
            )

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url or 'https://api.openai.com/v1'}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "你是一个专业的财经信息提取助手。"},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.1,
                        "response_format": {"type": "json_object"}
                    },
                    timeout=60
                )

                result = response.json()
                content = result["choices"][0]["message"]["content"]
                data = json.loads(content)

                return self._build_extracted_info(article, data)

        except Exception as e:
            print(f"LLM extraction failed: {e}")
            return await self._fallback_extract(article)

    def _build_extracted_info(self, article: Article, data: Dict) -> ExtractedInfo:
        """构建提取结果"""
        quantitative_data = []
        for item in data.get("quantitative_data", []):
            try:
                quantitative_data.append(QuantitativeData(
                    metric_name=item.get("metric_name", ""),
                    value=float(item.get("value", 0)),
                    unit=item.get("unit", ""),
                    change_type=item.get("change_type"),
                    change_value=item.get("change_value"),
                    change_percentage=item.get("change_percentage"),
                    period=item.get("period")
                ))
            except (ValueError, TypeError):
                continue

        business_events = []
        for item in data.get("business_events", []):
            business_events.append(BusinessEvent(
                event_type=item.get("event_type", ""),
                description=item.get("description", ""),
                entities=item.get("entities", [])
            ))

        return ExtractedInfo(
            article_id=article.id,
            company_name=data.get("company_name", ""),
            event_date=article.published_at,
            quantitative_data=quantitative_data,
            business_events=business_events,
            major_events=data.get("major_events", []),
            entities=data.get("entities", []),
            summary=data.get("summary", "")
        )

    async def _fallback_extract(self, article: Article) -> ExtractedInfo:
        """回退到基于规则的提取"""
        rule_extractor = RuleBasedExtractor()
        return await rule_extractor.extract(article)


class RuleBasedExtractor(BaseExtractor):
    """基于规则的提取器"""

    # 量化数据正则模式
    MONEY_PATTERNS = [
        r'(\d+(?:\.\d+)?)\s*(亿|万|千万|百万|亿元|万元|美元|欧元)',
        r'(\d+(?:\.\d+)?)\s*(billion|million|B|M)',
    ]

    # 变化模式
    CHANGE_PATTERNS = [
        r'(增长|上升|提高|增加)\s*(\d+(?:\.\d+)?)\s*%',
        r'(下降|减少|下跌|下滑)\s*(\d+(?:\.\d+)?)\s*%',
        r'同比(增长|下降)\s*(\d+(?:\.\d+)?)\s*%',
    ]

    # 经营事件关键词
    BUSINESS_EVENT_KEYWORDS = {
        "股权变更": ["股权", "股份", "股东", "持股", "转让", "收购"],
        "高管调整": ["CEO", "CFO", "总裁", "总经理", "董事长", "任命", "接任", "离职"],
        "业务关停": ["关停", "关闭", "停止", "终止", "裁撤"],
        "业务扩张": ["扩张", "拓展", "开设", "新建", "布局"],
        "合作并购": ["合作", "并购", "收购", "合并", "战略投资"],
    }

    # 重大事件关键词
    MAJOR_EVENT_KEYWORDS = {
        EventType.COMPLIANCE: ["处罚", "罚款", "违规", "合规", "监管"],
        EventType.FINANCING: ["融资", "投资", "IPO", "上市", "募资"],
        EventType.BRAND_SENTIMENT: ["负面", "投诉", "舆情", "危机", "争议"],
    }

    async def extract(self, article: Article) -> ExtractedInfo:
        """基于规则提取信息"""
        text = f"{article.title}\n{article.content}"

        # 提取公司名称
        company_name = self._extract_company_name(text)

        # 提取量化数据
        quantitative_data = self._extract_quantitative_data(text)

        # 提取经营事件
        business_events = self._extract_business_events(text)

        # 提取重大事件
        major_events = self._extract_major_events(text)

        # 提取实体
        entities = self._extract_entities(text)

        # 生成摘要
        summary = self._generate_summary(article)

        return ExtractedInfo(
            article_id=article.id,
            company_name=company_name,
            event_date=article.published_at,
            quantitative_data=quantitative_data,
            business_events=business_events,
            major_events=major_events,
            entities=entities,
            summary=summary
        )

    def _extract_company_name(self, text: str) -> str:
        """提取公司名称"""
        # 常见公司名称模式
        patterns = [
            r'([\u4e00-\u9fa5]{2,10}(?:公司|集团|科技|有限|股份))',
            r'([\u4e00-\u9fa5]{2,10}(?:Inc|Corp|Ltd|LLC))',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)

        return ""

    def _extract_quantitative_data(self, text: str) -> List[QuantitativeData]:
        """提取量化数据"""
        results = []

        for pattern in self.MONEY_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for value, unit in matches[:5]:  # 限制数量
                try:
                    results.append(QuantitativeData(
                        metric_name="金额",
                        value=float(value),
                        unit=unit
                    ))
                except ValueError:
                    continue

        # 提取百分比变化
        for pattern in self.CHANGE_PATTERNS:
            matches = re.findall(pattern, text)
            for change_type, value in matches[:3]:
                try:
                    results.append(QuantitativeData(
                        metric_name="变化率",
                        value=float(value),
                        unit="%",
                        change_type=change_type
                    ))
                except ValueError:
                    continue

        return results

    def _extract_business_events(self, text: str) -> List[BusinessEvent]:
        """提取经营事件"""
        events = []

        for event_type, keywords in self.BUSINESS_EVENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    # 提取相关句子
                    sentences = re.split(r'[。！？\n]', text)
                    for sentence in sentences:
                        if keyword in sentence:
                            events.append(BusinessEvent(
                                event_type=event_type,
                                description=sentence.strip()[:200],
                                entities=[]
                            ))
                            break

        return events[:5]  # 限制数量

    def _extract_major_events(self, text: str) -> List[str]:
        """提取重大事件"""
        events = []

        for event_type, keywords in self.MAJOR_EVENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    sentences = re.split(r'[。！？\n]', text)
                    for sentence in sentences:
                        if keyword in sentence:
                            events.append(f"{event_type.value}: {sentence.strip()[:100]}")
                            break

        return events[:3]

    def _extract_entities(self, text: str) -> List[str]:
        """提取实体"""
        # 简单实现：提取可能的实体
        entities = []

        # 提取人名（简单模式）
        person_pattern = r'[\u4e00-\u9fa5]{2,4}(?:先生|女士|总|董|长)'
        persons = re.findall(person_pattern, text)
        entities.extend(persons[:5])

        # 提取机构
        org_pattern = r'[\u4e00-\u9fa5]{2,10}(?:公司|集团|银行|证券|基金)'
        orgs = re.findall(org_pattern, text)
        entities.extend(orgs[:5])

        return list(set(entities))

    def _generate_summary(self, article: Article) -> str:
        """生成摘要"""
        # 简单实现：取前200字符
        content = article.content[:300]
        # 按句号截断
        if '。' in content:
            content = content[:content.rfind('。') + 1]
        return content


class ExtractionPipeline:
    """提取流水线"""

    def __init__(self, use_llm: bool = True):
        self.use_llm = use_llm
        self._extractors: List[BaseExtractor] = []

        if use_llm and settings.OPENAI_API_KEY:
            self._extractors.append(LLMExtractor())
        else:
            self._extractors.append(RuleBasedExtractor())

    async def process(self, article: Article) -> ExtractedInfo:
        """处理文章"""
        for extractor in self._extractors:
            try:
                result = await extractor.extract(article)
                return result
            except Exception as e:
                print(f"Extractor failed: {e}")
                continue

        # 返回空结果
        return ExtractedInfo(
            article_id=article.id,
            company_name=""
        )

    async def process_batch(self, articles: List[Article]) -> List[ExtractedInfo]:
        """批量处理文章"""
        tasks = [self.process(article) for article in articles]
        return await asyncio.gather(*tasks)