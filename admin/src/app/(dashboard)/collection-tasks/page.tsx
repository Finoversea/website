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
import { Plus, Pencil, Trash2, Play, Pause } from 'lucide-react'
import { SOURCE_TYPE_LABELS, type CollectionTask, type SourceType } from '@/types'
import { formatDate } from '@/lib/utils'

// 模拟数据
const mockTasks: CollectionTask[] = [
  {
    id: 'task_1',
    name: '科技新闻采集',
    source_type: 'news_portal',
    target_url: 'https://example.com/tech-news',
    keywords: ['AI', '云计算', '大数据'],
    companies: ['某科技公司', '某互联网企业'],
    schedule: '0 * * * *',
    enabled: true,
    last_run: '2024-01-15T10:30:00Z',
    next_run: '2024-01-15T11:00:00Z',
  },
  {
    id: 'task_2',
    name: '社交媒体监控',
    source_type: 'social_media',
    target_url: 'https://social.example.com/search',
    keywords: ['海外市场', '出海'],
    companies: ['某科技公司'],
    schedule: '*/30 * * * *',
    enabled: true,
    last_run: '2024-01-15T10:25:00Z',
    next_run: '2024-01-15T10:55:00Z',
  },
  {
    id: 'task_3',
    name: '财经数据采集',
    source_type: 'financial_media',
    target_url: 'https://finance.example.com',
    keywords: ['财报', '营收', '市值'],
    companies: ['某制造企业', '某零售公司'],
    schedule: '0 9 * * *',
    enabled: false,
    last_run: '2024-01-14T09:00:00Z',
    next_run: undefined,
  },
]

export default function CollectionTasksPage() {
  const [tasks, setTasks] = useState<CollectionTask[]>(mockTasks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<CollectionTask | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    source_type: 'news_portal' as SourceType,
    target_url: '',
    keywords: '',
    companies: '',
    schedule: '0 * * * *',
    enabled: true,
  })

  const handleOpenDialog = (task?: CollectionTask) => {
    if (task) {
      setEditingTask(task)
      setFormData({
        name: task.name,
        source_type: task.source_type,
        target_url: task.target_url,
        keywords: task.keywords.join(','),
        companies: task.companies.join(','),
        schedule: task.schedule,
        enabled: task.enabled,
      })
    } else {
      setEditingTask(null)
      setFormData({
        name: '',
        source_type: 'news_portal',
        target_url: '',
        keywords: '',
        companies: '',
        schedule: '0 * * * *',
        enabled: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveTask = () => {
    const newTask: CollectionTask = {
      id: editingTask?.id || `task_${Date.now()}`,
      name: formData.name,
      source_type: formData.source_type,
      target_url: formData.target_url,
      keywords: formData.keywords.split(',').filter(Boolean),
      companies: formData.companies.split(',').filter(Boolean),
      schedule: formData.schedule,
      enabled: formData.enabled,
    }

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? newTask : t)))
    } else {
      setTasks([...tasks, newTask])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const handleToggleEnabled = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, enabled: !t.enabled } : t))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">采集任务管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              新建任务
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? '编辑采集任务' : '新建采集任务'}
              </DialogTitle>
              <DialogDescription>
                配置数据采集任务的参数和调度规则
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">任务名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="输入任务名称"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source_type">来源类型</Label>
                <Select
                  value={formData.source_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, source_type: value as SourceType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择来源类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target_url">目标URL</Label>
                <Input
                  id="target_url"
                  value={formData.target_url}
                  onChange={(e) =>
                    setFormData({ ...formData, target_url: e.target.value })
                  }
                  placeholder="https://example.com"
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
                  placeholder="AI, 云计算, 大数据"
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
                <Label htmlFor="schedule">调度周期（Cron表达式）</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  placeholder="0 * * * *"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enabled: checked as boolean })
                  }
                />
                <Label htmlFor="enabled">启用任务</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveTask}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>任务列表</CardTitle>
          <CardDescription>所有配置的采集任务及其状态</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务名称</TableHead>
                <TableHead>来源类型</TableHead>
                <TableHead>关键词</TableHead>
                <TableHead>调度周期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>上次运行</TableHead>
                <TableHead>下次运行</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {SOURCE_TYPE_LABELS[task.source_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {task.keywords.join(', ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 rounded">
                      {task.schedule}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.enabled ? 'success' : 'secondary'}>
                      {task.enabled ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.last_run)}</TableCell>
                  <TableCell>{formatDate(task.next_run)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleEnabled(task.id!)}
                      >
                        {task.enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id!)}
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