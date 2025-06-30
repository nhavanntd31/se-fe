"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { authService } from "@/services/auth.service"
import { API_CONFIG } from "@/config/api"
import { UploadEventsList } from "@/components/upload/upload-events-list"

export default function UploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [refreshEvents, setRefreshEvents] = useState(0)
  const studentCourseRef = useRef<HTMLInputElement>(null)
  const studentProcessRef = useRef<HTMLInputElement>(null)

  const handleUploadCsv = async () => {
    const studentCourseFile = studentCourseRef.current?.files?.[0]
    const studentProcessFile = studentProcessRef.current?.files?.[0]

    if (!studentCourseFile || !studentProcessFile) {
      alert('Vui lòng chọn cả 2 file CSV')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('studentCourseCsv', studentCourseFile)
      formData.append('studentProcessCsv', studentProcessFile)

      const token = authService.getToken()
      const response = await fetch(`${API_CONFIG.baseUrl}/data/upload-csv?semester=20241`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        if (studentCourseRef.current) studentCourseRef.current.value = ''
        if (studentProcessRef.current) studentProcessRef.current.value = ''
        setIsModalOpen(false)
        setIsSuccessModalOpen(true)
        setRefreshEvents(prev => prev + 1)
      } else {
        alert('Upload thất bại!')
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi upload!')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    if (studentCourseRef.current) studentCourseRef.current.value = ''
    if (studentProcessRef.current) studentProcessRef.current.value = ''
    setIsModalOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Upload Data</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV Files</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload CSV Files
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[820px]">
                <DialogHeader>
                  <DialogTitle>Upload CSV Files</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="studentCourse" className="text-right text-sm font-medium">Student Course</label>
                    <Input id="studentCourse" ref={studentCourseRef} type="file" accept=".csv" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="studentProcess" className="text-right text-sm font-medium">Student Process</label>
                    <Input
                      id="studentProcess"
                      ref={studentProcessRef}
                      type="file"
                      accept=".csv"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUploadCsv}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadEventsList refreshTrigger={refreshEvents} />
          </CardContent>
        </Card>

        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-green-600">Upload thành công!</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Upload dữ liệu thành công, cơ sở dữ liệu sẽ bắt đầu cập nhập, sẽ có thông báo khi hoàn thành.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsSuccessModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 