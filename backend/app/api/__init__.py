"""FinOversea API

轻量化企业海外舆情事件洞察推送产品 API
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import (
    Article, CollectionTask, InformationItem, ExtractedInfo,
    Subscription, PushNotification, EventType, SourceType,
    APIResponse, PaginatedResponse
)
from app.collectors import CollectionManager, CollectorFactory
from app.extractors import ExtractionPipeline
from app.push import PushManager, ItemFormatter
from app.tagging import TaggingService


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="轻量化企业海外舆情事件洞察推送产品 API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service instances
collection_manager = CollectionManager()
extraction_pipeline = ExtractionPipeline(use_llm=True)
push_manager = PushManager()
tagging_service = TaggingService()


# ==================== 采集相关 API ====================

@app.post("/api/v1/collect/tasks", response_model=APIResponse)
async def create_collection_task(task: CollectionTask):
    """创建采集任务"""
    task.id = task.id or f"task_{datetime.utcnow().timestamp()}"
    # TODO: 保存到数据库
    return APIResponse(
        success=True,
        message="采集任务创建成功",
        data={"task_id": task.id}
    )


@app.post("/api/v1/collect/run/{task_id}", response_model=APIResponse)
async def run_collection_task(
    task_id: str,
    background_tasks: BackgroundTasks
):
    """执行采集任务"""
    # TODO: 从数据库获取任务
    # 模拟任务
    task = CollectionTask(
        id=task_id,
        name="测试采集",
        source_type=SourceType.NEWS_PORTAL,
        target_url="https://example.com/news",
        keywords=["科技"],
        companies=["测试公司"]
    )

    # 后台执行采集
    background_tasks.add_task(run_collection_background, task)

    return APIResponse(
        success=True,
        message="采集任务已启动"
    )


async def run_collection_background(task: CollectionTask):
    """后台采集任务"""
    articles = await collection_manager.run_task(task)
    print(f"Collected {len(articles)} articles")


# ==================== 提取相关 API ====================

@app.post("/api/v1/extract", response_model=APIResponse)
async def extract_information(article: Article):
    """从文章提取信息"""
    result = await extraction_pipeline.process(article)
    return APIResponse(
        success=True,
        data=result.model_dump()
    )


@app.post("/api/v1/extract/batch", response_model=APIResponse)
async def batch_extract_information(articles: List[Article]):
    """批量提取信息"""
    results = await extraction_pipeline.process_batch(articles)
    return APIResponse(
        success=True,
        data=[r.model_dump() for r in results]
    )


# ==================== 推送相关 API ====================

@app.post("/api/v1/push/format", response_model=APIResponse)
async def format_information_item(
    info: ExtractedInfo,
    article: Article
):
    """格式化信息项"""
    item = ItemFormatter.format(info, article)
    return APIResponse(
        success=True,
        data=item.model_dump()
    )


@app.post("/api/v1/push/send", response_model=APIResponse)
async def send_push_notification(
    user_id: str,
    items: List[InformationItem]
):
    """发送推送通知"""
    success = await push_manager.push_to_user(user_id, items)
    return APIResponse(
        success=success,
        message="推送成功" if success else "推送失败"
    )


@app.post("/api/v1/subscriptions", response_model=APIResponse)
async def create_subscription(subscription: Subscription):
    """创建订阅"""
    subscription.id = subscription.id or f"sub_{datetime.utcnow().timestamp()}"
    # TODO: 保存到数据库
    return APIResponse(
        success=True,
        message="订阅创建成功",
        data={"subscription_id": subscription.id}
    )


# ==================== 标签相关 API ====================

@app.post("/api/v1/tags/process", response_model=APIResponse)
async def process_tags(item: InformationItem):
    """处理信息项标签"""
    tags = await tagging_service.process_item(item)
    return APIResponse(
        success=True,
        data=[t.model_dump() for t in tags]
    )


@app.get("/api/v1/tags/search", response_model=APIResponse)
async def search_by_tags(
    tags: List[str] = Query(...),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(default=100, le=1000)
):
    """按标签搜索归档"""
    date_range = (start_date, end_date) if start_date and end_date else None
    items = await tagging_service.search_by_tags(tags, date_range, limit)
    return APIResponse(
        success=True,
        data=[i.model_dump() for i in items]
    )


@app.post("/api/v1/archive/daily", response_model=APIResponse)
async def create_daily_archive(items: List[InformationItem]):
    """创建每日归档"""
    entries = await tagging_service.create_daily_archive(items)
    return APIResponse(
        success=True,
        data=[e.model_dump() for e in entries]
    )


# ==================== 系统相关 API ====================

@app.get("/api/v1/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)