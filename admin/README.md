# FinOversea 管理端

数据展示规则管理端 - 基于 Next.js 的管理后台

## 功能模块

- **仪表盘**: 系统概览，展示关键指标和最近活动
- **采集任务管理**: 创建、编辑、启用/禁用数据采集任务
- **信息项管理**: 查看、筛选、导出提取的信息项数据
- **订阅管理**: 配置用户订阅规则和推送方式
- **标签管理**: 管理标签分类和层级关系
- **推送通知**: 监控推送状态和统计数据
- **系统设置**: API配置、刷新频率、推送参数等

## 技术栈

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI 组件库
- Axios

## 快速开始

### 安装依赖

```bash
cd admin
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run start
```

## 目录结构

```
admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # 管理页面
│   │   │   ├── page.tsx           # 仪表盘
│   │   │   ├── collection-tasks/  # 采集任务
│   │   │   ├── information-items/ # 信息项
│   │   │   ├── subscriptions/     # 订阅
│   │   │   ├── tags/              # 标签
│   │   │   ├── notifications/     # 推送通知
│   │   │   └── settings/          # 设置
│   │   ├── globals.css      # 全局样式
│   │   └── layout.tsx       # 根布局
│   ├── components/
│   │   ├── ui/              # UI组件
│   │   └── layout/          # 布局组件
│   ├── lib/
│   │   ├── api.ts           # API客户端
│   │   └── utils.ts         # 工具函数
│   └── types/
│       └── index.ts         # 类型定义
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API对接

管理端对接后端 FastAPI 服务，主要API端点：

- `POST /api/v1/collect/tasks` - 创建采集任务
- `GET /api/v1/information-items` - 获取信息项列表
- `POST /api/v1/subscriptions` - 创建订阅
- `GET /api/v1/tags` - 获取标签列表
- `GET /api/v1/push/notifications` - 获取推送通知

详细API文档请参考后端 `/docs` 端点。