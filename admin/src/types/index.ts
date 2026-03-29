// 事件类型
export type EventType =
  | 'data_change'
  | 'personnel'
  | 'compliance'
  | 'financing'
  | 'brand_sentiment'
  | 'operations'
  | 'major_event'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  data_change: '数据变动',
  personnel: '人事重大调整',
  compliance: '合规风险',
  financing: '投融资',
  brand_sentiment: '品牌舆情',
  operations: '经营异动',
  major_event: '重大事件',
}

// 信息来源类型
export type SourceType =
  | 'news_portal'
  | 'social_media'
  | 'financial_media'
  | 'industry_site'
  | 'announcement'
  | 'community'

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  news_portal: '新闻门户',
  social_media: '社交平台',
  financial_media: '财经媒体',
  industry_site: '行业站点',
  announcement: '公告披露',
  community: '社区论坛',
}

// 情感类型
export type SentimentType = 'positive' | 'negative' | 'neutral'

export const SENTIMENT_TYPE_LABELS: Record<SentimentType, string> = {
  positive: '正面',
  negative: '负面',
  neutral: '中性',
}

// 文章/资讯模型
export interface Article {
  id?: string
  title: string
  content: string
  summary?: string
  source_type: SourceType
  source_name: string
  source_url: string
  author?: string
  published_at?: string
  collected_at: string
  language: string
  raw_html?: string
  metadata?: Record<string, unknown>
}

// 采集任务
export interface CollectionTask {
  id?: string
  name: string
  source_type: SourceType
  target_url: string
  keywords: string[]
  companies: string[]
  schedule: string
  enabled: boolean
  last_run?: string
  next_run?: string
}

// 量化数据
export interface QuantitativeData {
  metric_name: string
  value: number
  unit: string
  change_type?: string
  change_value?: number
  change_percentage?: number
  period?: string
}

// 经营异动事件
export interface BusinessEvent {
  event_type: string
  description: string
  entities: string[]
  details?: Record<string, unknown>
}

// 提取的信息
export interface ExtractedInfo {
  article_id: string
  company_name: string
  event_date?: string
  quantitative_data: QuantitativeData[]
  business_events: BusinessEvent[]
  major_events: string[]
  entities: string[]
  summary?: string
  extracted_at: string
}

// 标准化信息项
export interface InformationItem {
  id?: string
  company_name: string
  event_time: string
  core_event: string
  key_data?: Record<string, unknown>
  summary: string
  source_url: string
  tags: string[]
  event_type: EventType
  sentiment: SentimentType
  confidence: number
  created_at: string
}

// 推送通知
export interface PushNotification {
  id?: string
  user_id: string
  items: InformationItem[]
  push_type: string
  status: string
  sent_at?: string
  read_at?: string
}

// 用户订阅
export interface Subscription {
  id?: string
  user_id: string
  companies: string[]
  keywords: string[]
  event_types: EventType[]
  push_channels: string[]
  push_frequency: string
  enabled: boolean
}

// 标签
export interface Tag {
  id?: string
  name: string
  category: string
  description?: string
  parent_id?: string
}

// 文章标签关联
export interface ArticleTag {
  article_id: string
  tag_id: string
  confidence: number
  tagged_at: string
  tagged_by: string
}

// 归档条目
export interface ArchiveEntry {
  id?: string
  company_name: string
  date_range_start: string
  date_range_end: string
  item_count: number
  tags: string[]
  storage_path: string
  created_at: string
}