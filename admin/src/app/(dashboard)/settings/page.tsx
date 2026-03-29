'use client'

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
import { Save, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">系统设置</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API配置</CardTitle>
            <CardDescription>配置后端API连接参数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="api_url">API地址</Label>
                <Input
                  id="api_url"
                  defaultValue="http://localhost:8000"
                  placeholder="http://localhost:8000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api_timeout">请求超时（秒）</Label>
                <Input
                  id="api_timeout"
                  type="number"
                  defaultValue="30"
                  placeholder="30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api_key">API密钥（可选）</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="输入API密钥"
                />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>数据刷新设置</CardTitle>
            <CardDescription>配置数据自动刷新频率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="refresh_interval">刷新频率</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="选择刷新频率" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">每10秒</SelectItem>
                    <SelectItem value="30">每30秒</SelectItem>
                    <SelectItem value="60">每1分钟</SelectItem>
                    <SelectItem value="300">每5分钟</SelectItem>
                    <SelectItem value="0">不自动刷新</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                立即刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>推送设置</CardTitle>
            <CardDescription>配置推送相关参数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_retry">最大重试次数</Label>
                <Input
                  id="max_retry"
                  type="number"
                  defaultValue="3"
                  placeholder="3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch_size">批量推送数量</Label>
                <Input
                  id="batch_size"
                  type="number"
                  defaultValue="100"
                  placeholder="100"
                />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>显示设置</CardTitle>
            <CardDescription>配置界面显示选项</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="language">语言</Label>
                <Select defaultValue="zh-CN">
                  <SelectTrigger>
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">中文</SelectItem>
                    <SelectItem value="en-US">英文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="theme">主题</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}