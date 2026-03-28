"""基础标签归档模块

自动打上：数据变动 / 人事重大调整 / 合规风险 / 投融资 / 品牌舆情 分类标签，方便检索回看。
"""

import asyncio
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Set, Tuple
from collections import defaultdict
from pathlib import Path

from app.models import (
    Article, ExtractedInfo, InformationItem, Tag, ArticleTag, ArchiveEntry, EventType
)
from app.config import settings


class TagCategory:
    """标签分类"""
    EVENT_TYPE = "event_type"        # 事件类型
    INDUSTRY = "industry"            # 行业
    REGION = "region"                # 地区
    COMPANY = "company"              # 公司
    SENTIMENT = "sentiment"          # 情感
    CUSTOM = "custom"                # 自定义


class TaggingEngine:
    """标签引擎"""

    # 预定义标签
    PREDEFINED_TAGS = {
        # 事件类型标签
        "data_change": Tag(name="数据变动", category=TagCategory.EVENT_TYPE),
        "personnel": Tag(name="人事重大调整", category=TagCategory.EVENT_TYPE),
        "compliance": Tag(name="合规风险", category=TagCategory.EVENT_TYPE),
        "financing": Tag(name="投融资", category=TagCategory.EVENT_TYPE),
        "brand_sentiment": Tag(name="品牌舆情", category=TagCategory.EVENT_TYPE),
        "operations": Tag(name="经营异动", category=TagCategory.EVENT_TYPE),
        "major_event": Tag(name="重大事件", category=TagCategory.EVENT_TYPE),

        # 情感标签
        "positive": Tag(name="正面", category=TagCategory.SENTIMENT),
        "negative": Tag(name="负面", category=TagCategory.SENTIMENT),
        "neutral": Tag(name="中性", category=TagCategory.SENTIMENT),

        # 行业标签
        "tech": Tag(name="科技", category=TagCategory.INDUSTRY),
        "finance": Tag(name="金融", category=TagCategory.INDUSTRY),
        "manufacturing": Tag(name="制造", category=TagCategory.INDUSTRY),
        "retail": Tag(name="零售", category=TagCategory.INDUSTRY),
        "healthcare": Tag(name="医疗", category=TagCategory.INDUSTRY),

        # 地区标签
        "overseas": Tag(name="海外", category=TagCategory.REGION),
        "domestic": Tag(name="国内", category=TagCategory.REGION),
        "us": Tag(name="美国", category=TagCategory.REGION),
        "eu": Tag(name="欧洲", category=TagCategory.REGION),
        "sea": Tag(name="东南亚", category=TagCategory.REGION),
    }

    # 行业关键词映射
    INDUSTRY_KEYWORDS = {
        "tech": ["科技", "互联网", "软件", "AI", "人工智能", "芯片", "云计算", "数据"],
        "finance": ["银行", "证券", "保险", "基金", "金融", "投资", "理财"],
        "manufacturing": ["制造", "工厂", "产能", "生产线", "工业"],
        "retail": ["零售", "电商", "门店", "消费", "购物"],
        "healthcare": ["医疗", "医药", "健康", "医院", "制药"],
    }

    # 地区关键词映射
    REGION_KEYWORDS = {
        "us": ["美国", "USA", "U.S.", "纽约", "硅谷", "华尔街"],
        "eu": ["欧洲", "欧盟", "EU", "德国", "法国", "英国"],
        "sea": ["东南亚", "新加坡", "马来西亚", "泰国", "印尼", "越南"],
        "overseas": ["海外", "出海", "国际", "跨境", "global"],
    }

    def __init__(self, confidence_threshold: float = None):
        self.confidence_threshold = confidence_threshold or settings.TAG_CONFIDENCE_THRESHOLD
        self._custom_tags: Dict[str, Tag] = {}

    def register_custom_tag(self, tag: Tag):
        """注册自定义标签"""
        self._custom_tags[tag.name] = tag

    async def tag_item(self, item: InformationItem) -> List[ArticleTag]:
        """为信息项打标签"""
        tags = []

        # 事件类型标签
        event_type_tag = self._get_event_type_tag(item.event_type)
        if event_type_tag:
            tags.append(ArticleTag(
                article_id=item.id,
                tag_id=event_type_tag.name,
                confidence=1.0,
                tagged_by="auto"
            ))

        # 情感标签
        sentiment_tag = self._get_sentiment_tag(item.sentiment)
        if sentiment_tag:
            tags.append(ArticleTag(
                article_id=item.id,
                tag_id=sentiment_tag.name,
                confidence=0.9,
                tagged_by="auto"
            ))

        # 行业标签（基于文本分析）
        industry_tags = await self._detect_industry_tags(item)
        tags.extend(industry_tags)

        # 地区标签（基于文本分析）
        region_tags = await self._detect_region_tags(item)
        tags.extend(region_tags)

        # 公司标签
        if item.company_name:
            tags.append(ArticleTag(
                article_id=item.id,
                tag_id=f"company:{item.company_name}",
                confidence=1.0,
                tagged_by="auto"
            ))

        return tags

    def _get_event_type_tag(self, event_type: EventType) -> Optional[Tag]:
        """获取事件类型标签"""
        return self.PREDEFINED_TAGS.get(event_type.value)

    def _get_sentiment_tag(self, sentiment) -> Optional[Tag]:
        """获取情感标签"""
        sentiment_map = {
            "positive": "positive",
            "negative": "negative",
            "neutral": "neutral"
        }
        return self.PREDEFINED_TAGS.get(sentiment_map.get(sentiment.value if hasattr(sentiment, 'value') else sentiment))

    async def _detect_industry_tags(self, item: InformationItem) -> List[ArticleTag]:
        """检测行业标签"""
        tags = []
        text = f"{item.core_event} {item.summary}"

        for industry, keywords in self.INDUSTRY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw.lower() in text.lower())
            if matches > 0:
                confidence = min(matches / len(keywords) * 2, 1.0)
                if confidence >= self.confidence_threshold:
                    tags.append(ArticleTag(
                        article_id=item.id,
                        tag_id=industry,
                        confidence=confidence,
                        tagged_by="auto"
                    ))

        return tags

    async def _detect_region_tags(self, item: InformationItem) -> List[ArticleTag]:
        """检测地区标签"""
        tags = []
        text = f"{item.core_event} {item.summary}"

        for region, keywords in self.REGION_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw.lower() in text.lower())
            if matches > 0:
                confidence = min(matches / len(keywords) * 2, 1.0)
                if confidence >= self.confidence_threshold:
                    tags.append(ArticleTag(
                        article_id=item.id,
                        tag_id=region,
                        confidence=confidence,
                        tagged_by="auto"
                    ))

        return tags


class ArchiveManager:
    """归档管理器"""

    def __init__(self, storage_path: str = None):
        self.storage_path = Path(storage_path or "./archives")
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def archive_items(
        self,
        items: List[InformationItem],
        company_name: str = None,
        date_range: Tuple[datetime, datetime] = None
    ) -> ArchiveEntry:
        """归档信息项"""
        # 按公司分组
        by_company: Dict[str, List[InformationItem]] = defaultdict(list)
        for item in items:
            by_company[item.company_name].append(item)

        # 确定日期范围
        if not date_range:
            dates = [i.event_time for i in items if i.event_time]
            if dates:
                date_range = (min(dates), max(dates))
            else:
                date_range = (datetime.utcnow(), datetime.utcnow())

        # 创建归档条目
        archive_entries = []
        for company, company_items in by_company.items():
            if company_name and company != company_name:
                continue

            entry = await self._create_archive_entry(company, company_items, date_range)
            archive_entries.append(entry)

        # 返回第一个归档条目（或合并）
        return archive_entries[0] if archive_entries else None

    async def _create_archive_entry(
        self,
        company_name: str,
        items: List[InformationItem],
        date_range: Tuple[datetime, datetime]
    ) -> ArchiveEntry:
        """创建归档条目"""
        # 生成存储路径
        year_month = date_range[0].strftime("%Y-%m")
        storage_dir = self.storage_path / year_month / company_name
        storage_dir.mkdir(parents=True, exist_ok=True)

        # 保存为JSON文件
        filename = f"{date_range[0].strftime('%Y%m%d')}_{date_range[1].strftime('%Y%m%d')}.json"
        storage_file = storage_dir / filename

        # 收集所有标签
        all_tags = set()
        for item in items:
            all_tags.update(item.tags)

        # 序列化数据
        data = {
            "company_name": company_name,
            "date_range": {
                "start": date_range[0].isoformat(),
                "end": date_range[1].isoformat()
            },
            "item_count": len(items),
            "tags": list(all_tags),
            "items": [
                {
                    "event_time": item.event_time.isoformat(),
                    "core_event": item.core_event,
                    "summary": item.summary,
                    "key_data": item.key_data,
                    "source_url": item.source_url,
                    "tags": item.tags,
                    "event_type": item.event_type.value
                }
                for item in items
            ]
        }

        with open(storage_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return ArchiveEntry(
            company_name=company_name,
            date_range_start=date_range[0],
            date_range_end=date_range[1],
            item_count=len(items),
            tags=list(all_tags),
            storage_path=str(storage_file)
        )

    async def query_archive(
        self,
        company_name: str = None,
        tags: List[str] = None,
        date_range: Tuple[datetime, datetime] = None,
        limit: int = 100
    ) -> List[InformationItem]:
        """查询归档数据"""
        results = []

        # 遍历存储目录
        for year_month_dir in self.storage_path.iterdir():
            if not year_month_dir.is_dir():
                continue

            for company_dir in year_month_dir.iterdir():
                if not company_dir.is_dir():
                    continue

                if company_name and company_dir.name != company_name:
                    continue

                for archive_file in company_dir.glob("*.json"):
                    items = self._load_archive_file(archive_file)

                    # 过滤标签
                    if tags:
                        items = [i for i in items if any(t in i.tags for t in tags)]

                    # 过滤日期
                    if date_range:
                        items = [i for i in items if date_range[0] <= i.event_time <= date_range[1]]

                    results.extend(items)

                    if len(results) >= limit:
                        return results[:limit]

        return results

    def _load_archive_file(self, file_path: Path) -> List[InformationItem]:
        """加载归档文件"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        items = []
        for item_data in data.get("items", []):
            items.append(InformationItem(
                company_name=data["company_name"],
                event_time=datetime.fromisoformat(item_data["event_time"]),
                core_event=item_data["core_event"],
                key_data=item_data.get("key_data", {}),
                summary=item_data["summary"],
                source_url=item_data["source_url"],
                tags=item_data["tags"],
                event_type=EventType(item_data["event_type"])
            ))

        return items


class TaggingService:
    """标签服务"""

    def __init__(self):
        self.tagging_engine = TaggingEngine()
        self.archive_manager = ArchiveManager()

    async def process_item(self, item: InformationItem) -> List[ArticleTag]:
        """处理信息项：打标签并归档"""
        # 打标签
        tags = await self.tagging_engine.tag_item(item)

        # 更新item的tags
        item.tags = list(set(t.tag_id for t in tags))

        return tags

    async def process_batch(self, items: List[InformationItem]) -> Dict[str, List[ArticleTag]]:
        """批量处理信息项"""
        results = {}
        for item in items:
            results[item.id or item.company_name] = await self.process_item(item)
        return results

    async def create_daily_archive(self, items: List[InformationItem]) -> List[ArchiveEntry]:
        """创建每日归档"""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        date_range = (today, today + timedelta(days=1))

        return await self.archive_manager.archive_items(items, date_range=date_range)

    async def search_by_tags(
        self,
        tags: List[str],
        date_range: Tuple[datetime, datetime] = None,
        limit: int = 100
    ) -> List[InformationItem]:
        """按标签搜索"""
        return await self.archive_manager.query_archive(
            tags=tags,
            date_range=date_range,
            limit=limit
        )