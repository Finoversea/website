# FinOversea

轻量化企业海外舆情事件洞察推送产品

## 产品定位

聚焦多媒体全域数据源采集，自动化抓取出海企业公开事件，提炼关键数据与重大突发事件，标准化生成实时信息流精准推送。

## 核心能力

### 1. 全域媒体采集汇聚

覆盖海外新闻门户、社交平台、财经媒体、行业站点、公告披露、社区论坛，7×24小时全网自动化实时爬取企业相关舆情与公开资讯。

**支持来源类型**:
- 新闻门户 (News Portal)
- 社交媒体 (Social Media)
- 财经媒体 (Financial Media)
- 行业站点 (Industry Site)
- 公告披露 (Announcement)
- 社区论坛 (Community)

### 2. 信息智能拆解萃取

从采集内容中自动提取:

- **量化数据**: 营收、融资、市值、产能、订单、人员规模、汇率收支等
- **经营异动**: 股权变更、高管调整、业务关停/扩张、海外站点变动、合作并购
- **重大事件**: 合规处罚、纠纷诉讼、品牌负面、政策关联、上市/退市、舆情危机

### 3. 标准化整合推送流

统一结构化排版，按以下格式封装:
- 企业名称
- 发生时间
- 核心事件
- 关键量化数据
- 摘要

**推送方式**:
- 实时推送
- 定时日报/周报
- 定向订阅
- 关键词筛选
- 企业分组

### 4. 基础标签归档

自动分类标签:
- 数据变动
- 人事重大调整
- 合规风险
- 投融资
- 品牌舆情

## 项目结构

```
finoversea/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py           # 配置管理
│   │   ├── models/             # 数据模型
│   │   ├── collectors/         # 采集模块
│   │   ├── extractors/         # 提取模块
│   │   ├── push/               # 推送模块
│   │   ├── tagging/            # 标签归档模块
│   │   └── api/                # API接口
│   ├── tests/
│   ├── scripts/
│   └── requirements.txt
├── docs/
├── config/
└── README.md
```

## 快速开始

### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 配置环境变量

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/finoversea

# Redis
REDIS_URL=redis://localhost:6379/0

# LLM (用于信息提取)
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### 启动服务

```bash
cd backend
uvicorn app.api:app --reload --port 8000
```

### API文档

启动后访问: http://localhost:8000/docs

## API 端点

### 采集
- `POST /api/v1/collect/tasks` - 创建采集任务
- `POST /api/v1/collect/run/{task_id}` - 执行采集任务

### 提取
- `POST /api/v1/extract` - 从文章提取信息
- `POST /api/v1/extract/batch` - 批量提取

### 推送
- `POST /api/v1/push/format` - 格式化信息项
- `POST /api/v1/push/send` - 发送推送
- `POST /api/v1/subscriptions` - 创建订阅

### 标签
- `POST /api/v1/tags/process` - 处理标签
- `GET /api/v1/tags/search` - 按标签搜索
- `POST /api/v1/archive/daily` - 创建每日归档

## 技术栈

- Python 3.10+
- FastAPI
- SQLAlchemy (异步)
- PostgreSQL
- Redis
- Celery (任务队列)
- OpenAI API (LLM)

## License

MIT