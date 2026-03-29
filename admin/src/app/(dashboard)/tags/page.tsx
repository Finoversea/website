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
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import type { Tag as TagType } from '@/types'

// 模拟数据
const mockTags: TagType[] = [
  {
    id: 'tag_1',
    name: '投融资',
    category: '事件类型',
    description: '企业融资、投资相关事件',
    parent_id: null,
  },
  {
    id: 'tag_2',
    name: '融资',
    category: '事件类型',
    description: '企业融资事件',
    parent_id: 'tag_1',
  },
  {
    id: 'tag_3',
    name: '科技',
    category: '行业',
    description: '科技行业相关',
    parent_id: null,
  },
  {
    id: 'tag_4',
    name: '财报',
    category: '事件类型',
    description: '企业财报发布',
    parent_id: null,
  },
  {
    id: 'tag_5',
    name: '品牌舆情',
    category: '事件类型',
    description: '品牌相关舆情事件',
    parent_id: null,
  },
  {
    id: 'tag_6',
    name: '海外市场',
    category: '地区',
    description: '海外市场相关',
    parent_id: null,
  },
]

const TAG_CATEGORIES = ['事件类型', '行业', '地区', '企业', '其他']

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>(mockTags)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '事件类型',
    description: '',
    parent_id: '',
  })

  const handleOpenDialog = (tag?: TagType) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({
        name: tag.name,
        category: tag.category,
        description: tag.description || '',
        parent_id: tag.parent_id || '',
      })
    } else {
      setEditingTag(null)
      setFormData({
        name: '',
        category: '事件类型',
        description: '',
        parent_id: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveTag = () => {
    const newTag: TagType = {
      id: editingTag?.id || `tag_${Date.now()}`,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      parent_id: formData.parent_id || null,
    }

    if (editingTag) {
      setTags(tags.map((t) => (t.id === editingTag.id ? newTag : t)))
    } else {
      setTags([...tags, newTag])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((t) => t.id !== tagId))
  }

  const getParentTagName = (parentId: string | null | undefined) => {
    if (!parentId) return '-'
    const parent = tags.find((t) => t.id === parentId)
    return parent?.name || '-'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">标签管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              新建标签
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingTag ? '编辑标签' : '新建标签'}</DialogTitle>
              <DialogDescription>配置标签名称和分类</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">标签名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="输入标签名称"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="输入描述"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent_id">父标签</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父标签（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {tags
                      .filter((t) => !t.parent_id && t.id !== editingTag?.id)
                      .map((t) => (
                        <SelectItem key={t.id!} value={t.id!}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveTag}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
          <CardDescription>所有配置的标签及其分类</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标签名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>父标签</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {tag.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tag.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {tag.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tag.parent_id ? (
                      <Badge variant="outline">
                        {getParentTagName(tag.parent_id)}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTag(tag.id!)}
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