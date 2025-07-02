"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getStudentCourseBySemester } from '@/services/statistic.service'
import { GraduationCap, BookOpen } from 'lucide-react'

interface StudentCoursesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  semesterId: string
  semesterName: string
  studentName: string
}

interface StudentCourse {
  id: string
  courseId: string
  courseName: string
  credits: number
  class: string
  continuousAssessmentScore: number
  examScore: number
  finalGrade: string
  relativeTerm: number
}

export function StudentCoursesModal({ 
  open, 
  onOpenChange, 
  studentId, 
  semesterId, 
  semesterName,
  studentName 
}: StudentCoursesModalProps) {
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && studentId && semesterId) {
      fetchStudentCourses()
    }
  }, [open, studentId, semesterId])

  const fetchStudentCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentCourseBySemester(semesterId, studentId)
      setCourses(data)
    } catch (err: any) {
      setError('Không thể tải danh sách môn học')
      console.error('Error fetching student courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const getGradeBadgeColor = (grade: string) => {
    if (!grade) return "secondary"
    if (grade === 'A+' || grade === 'A') return "success"
    if (grade === 'B+' || grade === 'B') return "primary" 
    if (grade === 'C+' || grade === 'C') return "warning"
    if (grade === 'D+' || grade === 'D') return "destructive"
    if (grade === 'F') return "destructive"
    return "secondary"
  }

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] min-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            Danh sách môn học
          </DialogTitle>
          <div className="text-center text-sm text-muted-foreground mt-2">
            <span className="font-medium text-blue-700">{studentName}</span> 
            <span className="mx-2">•</span> 
            <span className="font-medium text-blue-700">{semesterName}</span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg border border-red-200">
              <div className="font-medium">{error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Tổng số môn học: {courses.length}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tổng tín chỉ: {totalCredits}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white shadow-sm">
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-700">Mã môn học</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tên môn học</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Tín chỉ</TableHead>
                        <TableHead className="font-semibold text-gray-700">Lớp</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Kỳ TĐ</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Điểm QT</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Điểm thi</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Điểm cuối</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course, index) => (
                        <TableRow 
                          key={course.id}
                          className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                        >
                          <TableCell className="font-mono font-medium text-blue-700">{course.courseId}</TableCell>
                          <TableCell className="font-medium max-w-xs">{course.courseName}</TableCell>
                          <TableCell className="text-center font-medium">{course.credits}</TableCell>
                          <TableCell className="font-medium">{course.class}</TableCell>
                          <TableCell className="text-center">{course.relativeTerm}</TableCell>
                          <TableCell className="text-center">
                            {course.continuousAssessmentScore ? (
                              <span className="font-medium">{course.continuousAssessmentScore.toFixed(1)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {course.examScore ? (
                              <span className="font-medium">{course.examScore.toFixed(1)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {course.finalGrade ? (
                              <Badge 
                                variant={getGradeBadgeColor(course.finalGrade) as any}
                                className="font-medium"
                              >
                                {course.finalGrade}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {courses.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="font-medium text-lg">Không có dữ liệu môn học</div>
                  <div className="text-sm mt-1">Chưa có môn học nào cho kỳ này</div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}