"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CLOPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">CLO Management</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                CLO Suggest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tạo chuẩn đầu ra học phần (CLO) từ đề cương môn học sử dụng AI
              </p>
              <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                <li>• Upload file đề cương môn học</li>
                <li>• Nhập prompt hướng dẫn</li>
                <li>• Tự động tạo danh sách CLO</li>
                <li>• Xuất file Markdown và Excel</li>
              </ul>
              <Link href="/clo/suggest">
                <Button className="w-full gap-2">
                  Bắt đầu tạo CLO
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                CLO Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Đánh giá và kiểm tra CLO hiện có dựa trên đề cương môn học
              </p>
              <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                <li>• Upload đề cương và file CLO</li>
                <li>• Nhập tiêu chí đánh giá</li>
                <li>• Phân tích độ phù hợp</li>
                <li>• Báo cáo đánh giá chi tiết</li>
              </ul>
              <Link href="/clo/check">
                <Button variant="outline" className="w-full gap-2">
                  Kiểm tra CLO
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">CLO Suggest</h4>
                <p className="text-sm text-muted-foreground">
                  Sử dụng tính năng này khi bạn có đề cương môn học và muốn tự động tạo ra danh sách CLO phù hợp. 
                  Hệ thống sẽ phân tích nội dung đề cương và đề xuất các CLO dựa trên mục tiêu học tập.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">CLO Check</h4>
                <p className="text-sm text-muted-foreground">
                  Sử dụng tính năng này khi bạn đã có sẵn danh sách CLO và muốn kiểm tra độ phù hợp với đề cương môn học. 
                  Hệ thống sẽ đánh giá và đưa ra nhận xét chi tiết.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 