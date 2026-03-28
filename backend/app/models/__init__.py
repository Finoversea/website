"""FinOversea Data Models

核心数据模型定义
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class EventType(str, Enum):
    """事件类型"""
    DATA_CHANGE = "data_change"        # 数据变动
    PERSONNEL = "personnel"            # 人事重大调整
    COMPLIANCE = "compliance"          # 合规风险
    FINANCING = "financing"            # 投融资
    BRAND_SENTIMENT = "brand_sentiment" # 品牌舆情
    OPERATIONS = "operations"          # 经营异动
    MAJOR_EVENT = "major_event"        # 重大事件


class SourceType(str, Enum):
    """信息来源类型"""
    NEWS_PORTAL = "news_portal"        # 新闻门户
    SOCIAL_MEDIA = "social_media"      # 社交平台
    FINANCIAL_MEDIA = "financial_media" # 财经媒体
    INDUSTRY_SITE = "industry_site"    # 行业站点
    ANNOUNCEMENT = "announcement"      # 公告披露
    COMMUNITY = "community"            # 社区论坛


class SentimentType(str, Enum):
    """情感类型"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


# ==================== 采集相关模型 ====================

class Article(BaseModel):
    """文章/资讯模型"""
    id: Optional[str] = None
    title: str
    content: str
    summary: Optional[str] = None
    source_type: SourceType
    source_name: str
    source_url: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    collected_at: datetime = Field(default_factory=datetime.utcnow)
    language: str = "zh"
    raw_html: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CollectionTask(BaseModel):
    """采集任务"""
    id: Optional[str] = None
    name: str
    source_type: SourceType
    target_url: str
    keywords: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)  # 关注的企业列表
    schedule: str = "0 * * * *"  # 每小时
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None


# ==================== 提取相关模型 ====================

class QuantitativeData(BaseModel):
    """量化数据"""
    metric_name: str  # 指标名称：营收、融资、市值等
    value: float
    unit: str  # 单位：亿元、万美元、%等
    change_type: Optional[str] = None  # 变化类型：增长、下降、持平
    change_value: Optional[float] = None  # 变化值
    change_percentage: Optional[float] = None  # 变化百分比
    period: Optional[str] = None  # 时间段：Q1、2024年等


class BusinessEvent(BaseModel):
    """经营异动事件"""
    event_type: str  # 股权变更、高管调整、业务关停等
    description: str
    entities: List[str] = Field(default_factory=list)  # 涉及主体
    details: Dict[str, Any] = Field(default_factory=dict)


class ExtractedInfo(BaseModel):
    """提取的信息"""
    article_id: str
    company_name: str
    event_date: Optional[datetime] = None

    # 量化数据
    quantitative_data: List[QuantitativeData] = Field(default_factory=list)

    # 经营异动
    business_events: List[BusinessEvent] = Field(default_factory=list)

    # 重大事件
    major_events: List[str] = Field(default_factory=list)

    # 关键实体
    entities: List[str] = Field(default_factory=list)

    # 摘要
    summary: Optional[str] = None

    extracted_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== 推送相关模型 ====================

class InformationItem(BaseModel):
    """标准化信息项"""
    id: Optional[str] = None
    company_name: str
    event_time: datetime
    core_event: str
    key_data: Dict[str, Any] = Field(default_factory=dict)
    summary: str
    source_url: str
    tags: List[str] = Field(default_factory=list)
    event_type: EventType
    sentiment: SentimentType = SentimentType.NEUTRAL
    confidence: float = 1.0

    created_at: datetime = Field(default_factory=datetime.utcnow)


class PushNotification(BaseModel):
    """推送通知"""
    id: Optional[str] = None
    user_id: str
    items: List[InformationItem]
    push_type: str  # realtime, daily, weekly
    status: str = "pending"
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None


class Subscription(BaseModel):
    """用户订阅"""
    id: Optional[str] = None
    user_id: str
    companies: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    event_types: List[EventType] = Field(default_factory=list)
    push_channels: List[str] = Field(default_factory=list)  # email, webhook, app
    push_frequency: str = "realtime"  # realtime, daily, weekly
    enabled: bool = True


# ==================== 标签相关模型 ====================

class Tag(BaseModel):
    """标签"""
    id: Optional[str] = None
    name: str
    category: str  # 事件类型、行业、地区等
    description: Optional[str] = None
    parent_id: Optional[str] = None


class ArticleTag(BaseModel):
    """文章标签关联"""
    article_id: str
    tag_id: str
    confidence: float = 1.0
    tagged_at: datetime = Field(default_factory=datetime.utcnow)
    tagged_by: str = "auto"  # auto, manual


class ArchiveEntry(BaseModel):
    """归档条目"""
    id: Optional[str] = None
    company_name: str
    date_range_start: datetime
    date_range_end: datetime
    item_count: int
    tags: List[str] = Field(default_factory=list)
    storage_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== API响应模型 ====================

class APIResponse(BaseModel):
    """通用API响应"""
    success: bool = True
    message: str = ""
    data: Optional[Any] = None
    error: Optional[str] = None


class PaginatedResponse(BaseModel):
    """分页响应"""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int