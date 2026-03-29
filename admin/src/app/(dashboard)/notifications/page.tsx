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
import { Search, Eye, RefreshCw, Send } from 'lucide-react'
import type { PushNotification, InformationItem } from '@/types'
import { formatDate } from '@/lib/utils'

// 模拟数据
const mockNotifications: PushNotification[] = [
  {
    id: 'notif_1',
    user_id: 'user_1',
    items: [],
    push_type: 'realtime',
    status: 'sent',
    sent_at: '2024-01-15T10:35:00Z',
    read_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'notif_2',
    user_id: 'user_2',
    items: [],
    push_type: 'daily',
    status: 'sent',
    sent_at: '2024-01-15T09:00:00Z',
    read_at: null,
  },
  {
    id: 'notif_3',
    user_id: 'user_3',
    items: [],
    push_type: 'weekly',
    status: 'pending',
    sent_at: null,
    read_at: null,
  },
  {
    id: 'notif_4',
    user_id: 'user_1',
    items: [],
    push_type: 'realtime',
    status: 'failed',
    sent_at: null,
    read_at: null,
  },
]

const PUSH_TYPE_LABELS: Record<string, string> = {
  realtime: '实时推送',
  daily: '每日推送',
  weekly: '每周推送',
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  sent: { label: '已发送', variant: 'success' },
  pending: { label: '待发送', variant: 'warning' },
  failed: { label: '发送失败', variant: 'destructive' },
  read: { label: '已读', variant: 'secondary' },
}

export default function NotificationsPage() {
  const [notifications] = useState<PushNotification[]>(mockNotifications)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null)

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.user_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">推送通知管理</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新状态
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            批量推送
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
          <CardDescription>按条件筛选推送通知</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="sent">已发送</SelectItem>
                <SelectItem value="pending">待发送</SelectItem>
                <SelectItem value="failed">发送失败</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">通知列表</TabsTrigger>
          <TabsTrigger value="stats">推送统计</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>通知ID</TableHead>
                    <TableHead>用户ID</TableHead>
                    <TableHead>推送类型</TableHead>
                    <TableHead>信息项数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发送时间</TableHead>
                    <TableHead>阅读时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-medium">{notif.id}</TableCell>
                      <TableCell>{notif.user_id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {PUSH_TYPE_LABELS[notif.push_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{notif.items?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_LABELS[notif.status]?.variant || 'secondary'}>
                          {STATUS_LABELS[notif.status]?.label || notif.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(notif.sent_at)}</TableCell>
                      <TableCell>{formatDate(notif.read_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedNotification(notif)}
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
        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">今日推送</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">推送次数</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">成功率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">推送成功率</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">已读率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75.2%</div>
                <p className="text-xs text-muted-foreground">用户阅读率</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">待发送</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">待处理队列</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>推送类型分布</CardTitle>
              <CardDescription>各推送类型的统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>实时推送</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">120次</span>
                    <Badge variant="success">77%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>每日推送</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">28次</span>
                    <Badge variant="secondary">18%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>每周推送</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">8次</span>
                    <Badge variant="outline">5%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedNotification && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>通知详情 - {selectedNotification.id}</CardTitle>
            <CardDescription>
              用户: {selectedNotification.user_id} | 类型: {PUSH_TYPE_LABELS[selectedNotification.push_type]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">状态</h4>
                <Badge variant={STATUS_LABELS[selectedNotification.status]?.variant || 'secondary'}>
                  {STATUS_LABELS[selectedNotification.status]?.label || selectedNotification.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-1">发送时间</h4>
                <p className="text-muted-foreground">
                  {formatDate(selectedNotification.sent_at) || '未发送'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">阅读时间</h4>
                <p className="text-muted-foreground">
                  {formatDate(selectedNotification.read_at) || '未阅读'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">包含信息项</h4>
                <p className="text-muted-foreground">
                  {selectedNotification.items?.length || 0} 条信息
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                关闭详情
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}