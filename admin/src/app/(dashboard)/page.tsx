'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">仪表盘</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">采集任务</CardTitle>
            <Badge variant="success">活跃</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">当前运行中任务数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">信息项</CardTitle>
            <Badge variant="default">今日</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">今日新增信息条数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订阅数</CardTitle>
            <Badge variant="secondary">总计</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">活跃订阅用户数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推送率</CardTitle>
            <Badge variant="success">正常</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">推送成功率</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近采集任务</CardTitle>
            <CardDescription>最近的采集任务执行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务名称</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">科技新闻采集</TableCell>
                  <TableCell>新闻门户</TableCell>
                  <TableCell><Badge variant="success">完成</Badge></TableCell>
                  <TableCell>2024-01-15 10:30</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">社交媒体监控</TableCell>
                  <TableCell>社交平台</TableCell>
                  <TableCell><Badge variant="warning">运行中</Badge></TableCell>
                  <TableCell>2024-01-15 10:25</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">财经数据采集</TableCell>
                  <TableCell>财经媒体</TableCell>
                  <TableCell><Badge variant="success">完成</Badge></TableCell>
                  <TableCell>2024-01-15 09:00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近信息项</CardTitle>
            <CardDescription>最新提取的信息项概览</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企业名称</TableHead>
                  <TableHead>事件类型</TableHead>
                  <TableHead>情感</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">某科技公司</TableCell>
                  <TableCell>投融资</TableCell>
                  <TableCell><Badge variant="success">正面</Badge></TableCell>
                  <TableCell>2024-01-15</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">某制造企业</TableCell>
                  <TableCell>数据变动</TableCell>
                  <TableCell><Badge variant="secondary">中性</Badge></TableCell>
                  <TableCell>2024-01-14</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">某零售公司</TableCell>
                  <TableCell>品牌舆情</TableCell>
                  <TableCell><Badge variant="destructive">负面</Badge></TableCell>
                  <TableCell>2024-01-14</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/collection-tasks">
          <Button>管理采集任务</Button>
        </Link>
        <Link href="/information-items">
          <Button variant="outline">查看信息项</Button>
        </Link>
      </div>
    </div>
  )
}