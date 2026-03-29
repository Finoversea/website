"""全域媒体采集汇聚模块

覆盖海外新闻门户、社交平台、财经媒体、行业站点、公告披露、社区论坛，
7×24小时全网自动化实时爬取企业相关舆情与公开资讯。
"""

import asyncio
import re
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional, Dict, Any, AsyncGenerator
from urllib.parse import urljoin, urlparse
import hashlib

import httpx
from bs4 import BeautifulSoup
import feedparser

from app.models import Article, SourceType, CollectionTask
from app.config import settings


class BaseCollector(ABC):
    """采集器基类"""

    def __init__(self, task: CollectionTask):
        self.task = task
        self.client = httpx.AsyncClient(
            timeout=settings.COLLECTOR_TIMEOUT,
            follow_redirects=True,
            headers={"User-Agent": settings.COLLECTOR_USER_AGENT}
        )

    @abstractmethod
    async def collect(self) -> AsyncGenerator[Article, None]:
        """采集文章"""
        pass

    async def close(self):
        """关闭连接"""
        await self.client.aclose()

    def _generate_id(self, url: str, title: str) -> str:
        """生成文章ID"""
        content = f"{url}:{title}"
        return hashlib.md5(content.encode()).hexdigest()[:16]


class NewsPortalCollector(BaseCollector):
    """新闻门户采集器"""

    async def collect(self) -> AsyncGenerator[Article, None]:
        """从新闻门户采集文章"""
        try:
            response = await self.client.get(self.task.target_url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")

            # 查找文章链接（需要根据具体网站配置选择器）
            article_links = self._extract_article_links(soup)

            for link in article_links[:20]:  # 限制每次采集数量
                try:
                    article = await self._fetch_article(link)
                    if article and self._match_keywords(article):
                        yield article
                except Exception as e:
                    print(f"Error fetching article {link}: {e}")
                    continue

        except Exception as e:
            print(f"Error collecting from {self.task.target_url}: {e}")

    def _extract_article_links(self, soup: BeautifulSoup) -> List[str]:
        """提取文章链接"""
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("http"):
                links.append(href)
            elif href.startswith("/"):
                links.append(urljoin(self.task.target_url, href))
        return list(set(links))

    async def _fetch_article(self, url: str) -> Optional[Article]:
        """获取文章详情"""
        try:
            response = await self.client.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")

            # 提取标题
            title = self._extract_title(soup)
            if not title:
                return None

            # 提取内容
            content = self._extract_content(soup)
            if not content:
                return None

            return Article(
                id=self._generate_id(url, title),
                title=title,
                content=content,
                source_type=SourceType.NEWS_PORTAL,
                source_name=urlparse(url).netloc,
                source_url=url,
                collected_at=datetime.utcnow(),
                raw_html=response.text
            )

        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """提取标题"""
        # 尝试常见的标题选择器
        selectors = ["h1", ".title", ".article-title", "#title", "meta[property='og:title']"]
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == "meta":
                    return element.get("content", "").strip()
                return element.get_text(strip=True)
        return None

    def _extract_content(self, soup: BeautifulSoup) -> Optional[str]:
        """提取正文内容"""
        # 移除脚本和样式
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        # 尝试常见的正文选择器
        selectors = ["article", ".content", ".article-content", ".post-content", "#content"]
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                paragraphs = element.find_all("p")
                if paragraphs:
                    return "\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))

        # 回退：提取所有段落
        paragraphs = soup.find_all("p")
        return "\n".join(p.get_text(strip=True) for p in paragraphs[:10] if p.get_text(strip=True))

    def _match_keywords(self, article: Article) -> bool:
        """检查是否匹配关键词"""
        if not self.task.keywords and not self.task.companies:
            return True

        text = f"{article.title} {article.content}".lower()

        for keyword in self.task.keywords:
            if keyword.lower() in text:
                return True

        for company in self.task.companies:
            if company.lower() in text:
                return True

        return False


class RSSCollector(BaseCollector):
    """RSS/Atom Feed 采集器"""

    async def collect(self) -> AsyncGenerator[Article, None]:
        """从RSS Feed采集文章"""
        try:
            response = await self.client.get(self.task.target_url)
            feed = feedparser.parse(response.text)

            for entry in feed.entries[:50]:
                article = self._parse_entry(entry)
                if article and self._match_keywords(article):
                    yield article

        except Exception as e:
            print(f"Error collecting RSS from {self.task.target_url}: {e}")

    def _parse_entry(self, entry) -> Optional[Article]:
        """解析RSS条目"""
        try:
            title = entry.get("title", "")
            content = entry.get("summary", "") or entry.get("content", [{}])[0].get("value", "")
            url = entry.get("link", "")

            if not title or not url:
                return None

            published = entry.get("published_parsed")
            published_at = datetime(*published[:6]) if published else None

            return Article(
                id=self._generate_id(url, title),
                title=title,
                content=content,
                source_type=SourceType.NEWS_PORTAL,
                source_name=urlparse(url).netloc,
                source_url=url,
                author=entry.get("author"),
                published_at=published_at,
                collected_at=datetime.utcnow()
            )

        except Exception as e:
            print(f"Error parsing RSS entry: {e}")
            return None

    def _match_keywords(self, article: Article) -> bool:
        """检查是否匹配关键词"""
        if not self.task.keywords and not self.task.companies:
            return True

        text = f"{article.title} {article.content}".lower()

        for keyword in self.task.keywords:
            if keyword.lower() in text:
                return True

        for company in self.task.companies:
            if company.lower() in text:
                return True

        return False


class SocialMediaCollector(BaseCollector):
    """社交媒体采集器（Twitter/X, LinkedIn等）"""

    async def collect(self) -> AsyncGenerator[Article, None]:
        """从社交媒体采集内容"""
        # 注意：实际实现需要API密钥或爬虫策略
        # 这里提供基础框架

        # TODO: 实现具体平台的采集逻辑
        # - Twitter/X API
        # - LinkedIn API
        # - Reddit API
        # - 微博等

        yield  # 占位符


class FinancialMediaCollector(NewsPortalCollector):
    """财经媒体采集器"""

    # 常见财经媒体列表
    KNOWN_SOURCES = [
        "reuters.com",
        "bloomberg.com",
        "ft.com",
        "wsj.com",
        "cnbc.com",
        "finance.yahoo.com",
        "marketwatch.com",
        # 中文财经媒体
        "caixin.com",
        "yicai.com",
        "21jingji.com",
        "finance.sina.com.cn",
    ]

    async def collect(self) -> AsyncGenerator[Article, None]:
        """从财经媒体采集"""
        async for article in super().collect():
            article.source_type = SourceType.FINANCIAL_MEDIA
            yield article


class AnnouncementCollector(BaseCollector):
    """公告披露采集器"""

    async def collect(self) -> AsyncGenerator[Article, None]:
        """从公告披露网站采集"""
        # TODO: 实现公告网站的采集逻辑
        # - 上市公司公告
        # - 监管机构公告
        # - 政府公告
        yield


class CollectorFactory:
    """采集器工厂"""

    @staticmethod
    def create(task: CollectionTask) -> BaseCollector:
        """根据任务类型创建采集器"""
        collectors = {
            SourceType.NEWS_PORTAL: NewsPortalCollector,
            SourceType.SOCIAL_MEDIA: SocialMediaCollector,
            SourceType.FINANCIAL_MEDIA: FinancialMediaCollector,
            SourceType.INDUSTRY_SITE: NewsPortalCollector,
            SourceType.ANNOUNCEMENT: AnnouncementCollector,
            SourceType.COMMUNITY: NewsPortalCollector,
        }

        collector_class = collectors.get(task.source_type, NewsPortalCollector)
        return collector_class(task)


class CollectionManager:
    """采集管理器"""

    def __init__(self, max_concurrent: int = None):
        self.max_concurrent = max_concurrent or settings.COLLECTOR_MAX_CONCURRENT
        self._collectors: Dict[str, BaseCollector] = {}

    async def run_task(self, task: CollectionTask) -> List[Article]:
        """执行采集任务"""
        collector = CollectorFactory.create(task)
        self._collectors[task.id] = collector

        articles = []
        try:
            async for article in collector.collect():
                articles.append(article)
        finally:
            await collector.close()
            del self._collectors[task.id]

        return articles

    async def run_tasks(self, tasks: List[CollectionTask]) -> Dict[str, List[Article]]:
        """批量执行采集任务"""
        semaphore = asyncio.Semaphore(self.max_concurrent)

        async def run_with_limit(task):
            async with semaphore:
                return task.id, await self.run_task(task)

        results = await asyncio.gather(*[run_with_limit(t) for t in tasks])
        return dict(results)

    async def stop_all(self):
        """停止所有采集任务"""
        for collector in self._collectors.values():
            await collector.close()
        self._collectors.clear()