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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Bell } from 'lucide-react'
import { EVENT_TYPE_LABELS, type Subscription, type EventType } from '@/types'
import { formatDate } from '@/lib/utils'

// 模拟数据
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    user_id: 'user_1',
    companies: ['某科技公司', '某互联网企业'],
    keywords: ['融资', 'AI'],
    event_types: ['financing', 'data_change'],
    push_channels: ['email', 'webhook'],
    push_frequency: 'realtime',
    enabled: true,
  },
  {
    id: 'sub_2',
    user_id: 'user_2',
    companies: ['某制造企业'],
    keywords: ['财报', '营收'],
    event_types: ['data_change'],
    push_channels: ['email'],
    push_frequency: 'daily',
    enabled: true,
  },
  {
    id: 'sub_3',
    user_id: 'user_3',
    companies: ['某零售公司', '某科技公司'],
    keywords: [],
    event_types: ['brand_sentiment', 'compliance', 'major_event'],
    push_channels: ['app'],
    push_frequency: 'weekly',
    enabled: false,
  },
]

const PUSH_CHANNELS = [
  { value: 'email', label: '邮件' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'app', label: '应用内推送' },
]

const PUSH_FREQUENCIES = [
  { value: 'realtime', label: '实时推送' },
  { value: 'daily', label: '每日推送' },
  { value: 'weekly', label: '每周推送' },
]

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [formData, setFormData] = useState({
    user_id: '',
    companies: '',
    keywords: '',
    event_types: [] as EventType[],
    push_channels: [] as string[],
    push_frequency: 'realtime',
    enabled: true,
  })

  const handleOpenDialog = (subscription?: Subscription) => {
    if (subscription) {
      setEditingSubscription(subscription)
      setFormData({
        user_id: subscription.user_id,
        companies: subscription.companies.join(','),
        keywords: subscription.keywords.join(','),
        event_types: subscription.event_types,
        push_channels: subscription.push_channels,
        push_frequency: subscription.push_frequency,
        enabled: subscription.enabled,
      })
    } else {
      setEditingSubscription(null)
      setFormData({
        user_id: '',
        companies: '',
        keywords: '',
        event_types: [],
        push_channels: [],
        push_frequency: 'realtime',
        enabled: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveSubscription = () => {
    const newSubscription: Subscription = {
      id: editingSubscription?.id || `sub_${Date.now()}`,
      user_id: formData.user_id,
      companies: formData.companies.split(',').filter(Boolean),
      keywords: formData.keywords.split(',').filter(Boolean),
      event_types: formData.event_types,
      push_channels: formData.push_channels,
      push_frequency: formData.push_frequency,
      enabled: formData.enabled,
    }

    if (editingSubscription) {
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === editingSubscription.id ? newSubscription : s
        )
      )
    } else {
      setSubscriptions([...subscriptions, newSubscription])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteSubscription = (subId: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== subId))
  }

  const handleToggleEnabled = (subId: string) => {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === subId ? { ...s, enabled: !s.enabled } : s
      )
    )
  }

  const handleEventTypeChange = (eventType: EventType, checked: boolean) => {
    setFormData({
      ...formData,
      event_types: checked
        ? [...formData.event_types, eventType]
        : formData.event_types.filter((t) => t !== eventType),
    })
  }

  const handlePushChannelChange = (channel: string, checked: boolean) => {
    setFormData({
      ...formData,
      push_channels: checked
        ? [...formData.push_channels, channel]
        : formData.push_channels.filter((c) => c !== channel),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">订阅管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              新建订阅
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? '编辑订阅' : '新建订阅'}
              </DialogTitle>
              <DialogDescription>
                配置用户订阅规则和推送方式
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user_id">用户ID</Label>
                <Input
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                  placeholder="输入用户ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companies">关注企业（逗号分隔）</Label>
                <Input
                  id="companies"
                  value={formData.companies}
                  onChange={(e) =>
                    setFormData({ ...formData, companies: e.target.value })
                  }
                  placeholder="某科技公司, 某互联网企业"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="keywords">关键词（逗号分隔）</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder="融资, AI"
                />
              </div>
              <div className="grid gap-2">
                <Label>事件类型</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`event_${key}`}
                        checked={formData.event_types.includes(key as EventType)}
                        onCheckedChange={(checked) =>
                          handleEventTypeChange(key as EventType, checked as boolean)
                        }
                      />
                      <Label htmlFor={`event_${key}`} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>推送渠道</Label>
                <div className="flex gap-4">
                  {PUSH_CHANNELS.map((channel) => (
                    <div key={channel.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`channel_${channel.value}`}
                        checked={formData.push_channels.includes(channel.value)}
                        onCheckedChange={(checked) =>
                          handlePushChannelChange(channel.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={`channel_${channel.value}`} className="text-sm">
                        {channel.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="push_frequency">推送频率</Label>
                <Select
                  value={formData.push_frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, push_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择推送频率" />
                  </SelectTrigger>
                  <SelectContent>
                    {PUSH_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enabled: checked as boolean })
                  }
                />
                <Label htmlFor="enabled">启用订阅</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveSubscription}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>订阅列表</CardTitle>
          <CardDescription>所有配置的用户订阅规则</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户ID</TableHead>
                <TableHead>关注企业</TableHead>
                <TableHead>关键词</TableHead>
                <TableHead>事件类型</TableHead>
                <TableHead>推送渠道</TableHead>
                <TableHead>推送频率</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.user_id}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {sub.companies.join(', ') || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {sub.keywords.join(', ') || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {sub.event_types.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {EVENT_TYPE_LABELS[type]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {sub.push_channels.map((channel) => {
                        const label = PUSH_CHANNELS.find((c) => c.value === channel)?.label
                        return (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {PUSH_FREQUENCIES.find((f) => f.value === sub.push_frequency)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.enabled ? 'success' : 'secondary'}>
                      {sub.enabled ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleEnabled(sub.id!)}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(sub)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubscription(sub.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}