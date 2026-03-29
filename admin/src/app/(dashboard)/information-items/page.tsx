'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Eye, Download } from 'lucide-react'
import {
  EVENT_TYPE_LABELS,
  SENTIMENT_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  type InformationItem,
  type EventType,
  type SentimentType,
} from '@/types'
import { formatDate } from '@/lib/utils'

// 模拟数据
const mockItems: InformationItem[] = [
  {
    id: 'item_1',
    company_name: '某科技公司',
    event_time: '2024-01-15T08:00:00Z',
    core_event: '完成B轮融资5000万美元',
    summary:
      '某科技公司宣布完成B轮融资，融资金额达5000万美元，由知名投资机构领投。',
    source_url: 'https://example.com/news/1',
    tags: ['投融资', '科技', '融资'],
    event_type: 'financing',
    sentiment: 'positive',
    confidence: 0.95,
    created_at: '2024-01-15T10:30:00Z',
    key_data: {
      融资金额: '5000万美元',
      融资轮次: 'B轮',
      领投机构: '知名投资机构',
    },
  },
  {
    id: 'item_2',
    company_name: '某制造企业',
    event_time: '2024-01-14T14:00:00Z',
    core_event: 'Q4营收同比增长15%',
    summary:
      '某制造企业发布Q4财报，营收达10亿元，同比增长15%，超出市场预期。',
    source_url: 'https://example.com/news/2',
    tags: ['数据变动', '财报', '营收'],
    event_type: 'data_change',
    sentiment: 'positive',
    confidence: 0.88,
    created_at: '2024-01-14T16:00:00Z',
    key_data: {
      Q4营收: '10亿元',
      同比增长: '15%',
      超出预期: '2%',
    },
  },
  {
    id: 'item_3',
    company_name: '某零售公司',
    event_time: '2024-01-14T10:00:00Z',
    core_event: '海外门店关闭引发消费者投诉',
    summary:
      '某零售公司海外门店突然关闭，引发大量消费者投诉，品牌形象受损。',
    source_url: 'https://example.com/news/3',
    tags: ['品牌舆情', '门店关闭', '投诉'],
    event_type: 'brand_sentiment',
    sentiment: 'negative',
    confidence: 0.92,
    created_at: '2024-01-14T12:00:00Z',
    key_data: {
      影响范围: '海外市场',
      投诉数量: '约500件',
      品牌影响: '负面',
    },
  },
  {
    id: 'item_4',
    company_name: '某互联网企业',
    event_time: '2024-01-13T16:00:00Z',
    core_event: 'CEO宣布离职',
    summary:
      '某互联网企业CEO宣布因个人原因离职，董事会已启动新CEO选拔程序。',
    source_url: 'https://example.com/news/4',
    tags: ['人事调整', '高管变动', 'CEO'],
    event_type: 'personnel',
    sentiment: 'neutral',
    confidence: 0.85,
    created_at: '2024-01-13T18:00:00Z',
    key_data: {
      变动类型: 'CEO离职',
      原因: '个人原因',
      后续安排: '启动选拔程序',
    },
  },
]

export default function InformationItemsPage() {
  const [items] = useState<InformationItem[]>(mockItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [sentimentFilter, setSentimentFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<InformationItem | null>(null)

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.core_event.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEventType =
      eventTypeFilter === 'all' || item.event_type === eventTypeFilter
    const matchesSentiment =
      sentimentFilter === 'all' || item.sentiment === sentimentFilter
    return matchesSearch && matchesEventType && matchesSentiment
  })

  const getSentimentBadgeVariant = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return 'success'
      case 'negative':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">信息项管理</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出数据
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
          <CardDescription>按条件筛选信息项</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索企业名称或事件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={eventTypeFilter}
              onValueChange={setEventTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="事件类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sentimentFilter}
              onValueChange={setSentimentFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="情感倾向" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部情感</SelectItem>
                {Object.entries(SENTIMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">表格视图</TabsTrigger>
          <TabsTrigger value="cards">卡片视图</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>企业名称</TableHead>
                    <TableHead>核心事件</TableHead>
                    <TableHead>事件类型</TableHead>
                    <TableHead>情感</TableHead>
                    <TableHead>置信度</TableHead>
                    <TableHead>事件时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.company_name}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {item.core_event}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {EVENT_TYPE_LABELS[item.event_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSentimentBadgeVariant(item.sentiment)}>
                          {SENTIMENT_TYPE_LABELS[item.sentiment]}
                        </Badge>
                      </TableCell>
                      <TableCell>{(item.confidence * 100).toFixed(0)}%</TableCell>
                      <TableCell>{formatDate(item.event_time)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cards">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.company_name}</CardTitle>
                    <Badge variant={getSentimentBadgeVariant(item.sentiment)}>
                      {SENTIMENT_TYPE_LABELS[item.sentiment]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {EVENT_TYPE_LABELS[item.event_type]} | {formatDate(item.event_time)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{item.core_event}</p>
                  <div className="flex gap-1 flex-wrap">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 详情对话框 */}
      {selectedItem && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedItem.company_name} - 详情</CardTitle>
            <CardDescription>
              {EVENT_TYPE_LABELS[selectedItem.event_type]} | 置信度: {(selectedItem.confidence * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">核心事件</h4>
                <p>{selectedItem.core_event}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">摘要</h4>
                <p className="text-muted-foreground">{selectedItem.summary}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">关键数据</h4>
                <div className="grid gap-2">
                  {Object.entries(selectedItem.key_data || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">标签</h4>
                <div className="flex gap-1 flex-wrap">
                  {selectedItem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">来源</h4>
                <a
                  href={selectedItem.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {selectedItem.source_url}
                </a>
              </div>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                关闭详情
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}