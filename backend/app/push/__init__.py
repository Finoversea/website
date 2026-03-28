"""标准化整合推送流模块

统一结构化排版，剔除无效冗余信息，按【企业名称 + 发生时间 + 核心事件 + 关键量化数据 + 摘要】封装；
支持实时推送、定时日报/周报，定向订阅、关键词筛选、企业分组。
"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
import json

from app.models import (
    InformationItem, ExtractedInfo, Article, EventType, SentimentType,
    PushNotification, Subscription
)
from app.config import settings


@dataclass
class FormattedItem:
    """格式化后的信息项"""
    company_name: str
    event_time: str
    core_event: str
    key_data: str
    summary: str
    source_url: str
    tags: List[str]


class ItemFormatter:
    """信息项格式化器"""

    @staticmethod
    def format(info: ExtractedInfo, article: Article) -> InformationItem:
        """将提取的信息格式化为标准化信息项"""
        # 确定核心事件
        core_event = ItemFormatter._determine_core_event(info)

        # 格式化关键数据
        key_data = ItemFormatter._format_key_data(info)

        # 生成摘要
        summary = info.summary or ItemFormatter._generate_summary(info, article)

        # 确定事件类型
        event_type = ItemFormatter._determine_event_type(info)

        # 情感分析
        sentiment = ItemFormatter._analyze_sentiment(info, article)

        # 生成标签
        tags = ItemFormatter._generate_tags(info, event_type)

        return InformationItem(
            company_name=info.company_name,
            event_time=info.event_date or article.published_at or article.collected_at,
            core_event=core_event,
            key_data=key_data,
            summary=summary,
            source_url=article.source_url,
            tags=tags,
            event_type=event_type,
            sentiment=sentiment
        )

    @staticmethod
    def _determine_core_event(info: ExtractedInfo) -> str:
        """确定核心事件描述"""
        # 优先使用重大事件
        if info.major_events:
            return info.major_events[0]

        # 其次使用经营事件
        if info.business_events:
            event = info.business_events[0]
            return f"{event.event_type}: {event.description}"

        # 最后使用量化数据
        if info.quantitative_data:
            data = info.quantitative_data[0]
            change = f"{data.change_type}" if data.change_type else ""
            return f"{data.metric_name}{change}{data.value}{data.unit}"

        return "资讯更新"

    @staticmethod
    def _format_key_data(info: ExtractedInfo) -> Dict[str, Any]:
        """格式化关键数据"""
        key_data = {}

        for data in info.quantitative_data:
            key = data.metric_name
            value_str = f"{data.value}{data.unit}"
            if data.change_percentage:
                value_str += f" ({data.change_type}{data.change_percentage}%)"
            key_data[key] = value_str

        return key_data

    @staticmethod
    def _generate_summary(info: ExtractedInfo, article: Article) -> str:
        """生成摘要"""
        if info.summary:
            return info.summary

        # 从文章内容提取前200字
        content = article.content[:300]
        if '。' in content:
            content = content[:content.rfind('。') + 1]
        return content

    @staticmethod
    def _determine_event_type(info: ExtractedInfo) -> EventType:
        """确定事件类型"""
        if info.major_events:
            major = info.major_events[0].lower()
            if any(kw in major for kw in ["处罚", "违规", "合规"]):
                return EventType.COMPLIANCE
            if any(kw in major for kw in ["融资", "投资", "ipo", "上市"]):
                return EventType.FINANCING
            if any(kw in major for kw in ["负面", "投诉", "危机"]):
                return EventType.BRAND_SENTIMENT

        if info.business_events:
            event_type = info.business_events[0].event_type
            if event_type == "股权变更":
                return EventType.OPERATIONS
            if event_type == "高管调整":
                return EventType.PERSONNEL

        if info.quantitative_data:
            return EventType.DATA_CHANGE

        return EventType.MAJOR_EVENT

    @staticmethod
    def _analyze_sentiment(info: ExtractedInfo, article: Article) -> SentimentType:
        """简单情感分析"""
        text = f"{article.title} {info.summary or ''}".lower()

        negative_words = ["下跌", "下降", "亏损", "裁员", "处罚", "违规", "负面", "危机", "关停"]
        positive_words = ["增长", "上升", "盈利", "融资", "上市", "扩张", "创新"]

        neg_count = sum(1 for word in negative_words if word in text)
        pos_count = sum(1 for word in positive_words if word in text)

        if neg_count > pos_count:
            return SentimentType.NEGATIVE
        elif pos_count > neg_count:
            return SentimentType.POSITIVE
        return SentimentType.NEUTRAL

    @staticmethod
    def _generate_tags(info: ExtractedInfo, event_type: EventType) -> List[str]:
        """生成标签"""
        tags = [event_type.value]

        if info.quantitative_data:
            tags.append("数据变动")
        if info.business_events:
            tags.append("经营异动")

        # 添加实体标签
        for entity in info.entities[:3]:
            tags.append(entity)

        return tags


class BasePushChannel(ABC):
    """推送渠道基类"""

    @abstractmethod
    async def push(self, notification: PushNotification) -> bool:
        """发送推送"""
        pass


class EmailPushChannel(BasePushChannel):
    """邮件推送渠道"""

    def __init__(self, smtp_host: str, smtp_port: int, username: str, password: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password

    async def push(self, notification: PushNotification) -> bool:
        """发送邮件"""
        # TODO: 实现邮件发送
        print(f"Sending email to {notification.user_id}")
        return True


class WebhookPushChannel(BasePushChannel):
    """Webhook推送渠道"""

    def __init__(self):
        import httpx
        self.client = httpx.AsyncClient(timeout=30)

    async def push(self, notification: PushNotification) -> bool:
        """发送Webhook"""
        # TODO: 从用户配置获取webhook URL
        webhook_url = await self._get_webhook_url(notification.user_id)
        if not webhook_url:
            return False

        try:
            payload = {
                "user_id": notification.user_id,
                "push_type": notification.push_type,
                "items": [
                    {
                        "company_name": item.company_name,
                        "event_time": item.event_time.isoformat(),
                        "core_event": item.core_event,
                        "summary": item.summary,
                        "tags": item.tags,
                        "source_url": item.source_url
                    }
                    for item in notification.items
                ]
            }

            response = await self.client.post(webhook_url, json=payload)
            return response.status_code == 200

        except Exception as e:
            print(f"Webhook push failed: {e}")
            return False

    async def _get_webhook_url(self, user_id: str) -> Optional[str]:
        """获取用户的webhook URL"""
        # TODO: 从数据库或配置获取
        return None


class AppPushChannel(BasePushChannel):
    """应用内推送渠道"""

    async def push(self, notification: PushNotification) -> bool:
        """发送应用内推送"""
        # TODO: 实现应用内推送（如WebSocket、Firebase等）
        print(f"Sending app notification to {notification.user_id}")
        return True


class PushManager:
    """推送管理器"""

    def __init__(self):
        self._channels: Dict[str, BasePushChannel] = {}
        self._queue: asyncio.Queue = None

    def register_channel(self, channel_type: str, channel: BasePushChannel):
        """注册推送渠道"""
        self._channels[channel_type] = channel

    async def push_to_user(
        self,
        user_id: str,
        items: List[InformationItem],
        push_type: str = "realtime"
    ) -> bool:
        """向用户推送信息"""
        notification = PushNotification(
            user_id=user_id,
            items=items,
            push_type=push_type,
            status="sending"
        )

        # TODO: 获取用户的推送渠道配置
        channels = ["app"]  # 默认使用应用内推送

        success = False
        for channel_type in channels:
            channel = self._channels.get(channel_type)
            if channel:
                try:
                    if await channel.push(notification):
                        success = True
                        break
                except Exception as e:
                    print(f"Push via {channel_type} failed: {e}")

        notification.status = "sent" if success else "failed"
        notification.sent_at = datetime.utcnow()

        return success

    async def push_to_subscribers(
        self,
        item: InformationItem,
        subscriptions: List[Subscription]
    ) -> Dict[str, bool]:
        """向订阅者推送信息"""
        results = {}

        for sub in subscriptions:
            # 检查是否匹配订阅条件
            if not self._matches_subscription(item, sub):
                continue

            # 推送给订阅者
            success = await self.push_to_user(
                sub.user_id,
                [item],
                sub.push_frequency
            )
            results[sub.user_id] = success

        return results

    def _matches_subscription(self, item: InformationItem, sub: Subscription) -> bool:
        """检查信息是否匹配订阅条件"""
        # 检查企业
        if sub.companies and item.company_name not in sub.companies:
            return False

        # 检查事件类型
        if sub.event_types and item.event_type not in sub.event_types:
            return False

        # 检查关键词
        if sub.keywords:
            text = f"{item.core_event} {item.summary}".lower()
            if not any(kw.lower() in text for kw in sub.keywords):
                return False

        return True


class ReportGenerator:
    """报告生成器"""

    @staticmethod
    def generate_daily_report(items: List[InformationItem], date: datetime = None) -> str:
        """生成日报"""
        date = date or datetime.utcnow()
        report = f"# 舆情日报 - {date.strftime('%Y年%m月%d日')}\n\n"

        # 按企业分组
        by_company: Dict[str, List[InformationItem]] = {}
        for item in items:
            if item.company_name not in by_company:
                by_company[item.company_name] = []
            by_company[item.company_name].append(item)

        for company, company_items in by_company.items():
            report += f"## {company}\n\n"
            for item in company_items:
                report += f"- **{item.event_time.strftime('%H:%M')}** {item.core_event}\n"
                if item.summary:
                    report += f"  {item.summary[:100]}...\n"
                report += f"  [来源]({item.source_url})\n\n"

        return report

    @staticmethod
    def generate_weekly_report(items: List[InformationItem], week_start: datetime = None) -> str:
        """生成周报"""
        week_start = week_start or datetime.utcnow() - timedelta(days=7)
        week_end = week_start + timedelta(days=6)

        report = f"# 舆情周报 - {week_start.strftime('%Y年%m月%d日')} 至 {week_end.strftime('%Y年%m月%d日')}\n\n"

        # 统计摘要
        report += "## 本周概览\n\n"
        report += f"- 监控企业: {len(set(i.company_name for i in items))} 家\n"
        report += f"- 信息条数: {len(items)} 条\n"

        by_type: Dict[EventType, int] = {}
        for item in items:
            by_type[item.event_type] = by_type.get(item.event_type, 0) + 1

        report += "- 事件分布:\n"
        for event_type, count in sorted(by_type.items(), key=lambda x: -x[1]):
            report += f"  - {event_type.value}: {count} 条\n"

        report += "\n## 详细信息\n\n"

        # 按日期分组
        by_date: Dict[str, List[InformationItem]] = {}
        for item in items:
            date_str = item.event_time.strftime('%Y-%m-%d')
            if date_str not in by_date:
                by_date[date_str] = []
            by_date[date_str].append(item)

        for date_str in sorted(by_date.keys(), reverse=True):
            report += f"### {date_str}\n\n"
            for item in by_date[date_str][:10]:  # 每天最多10条
                report += f"- **{item.company_name}**: {item.core_event}\n"
            report += "\n"

        return report