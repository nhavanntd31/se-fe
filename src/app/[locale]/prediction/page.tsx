"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Settings, Download, Loader2, CheckCircle2, XCircle, FileDown, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef } from "react"
import { predictStudents } from "@/services/student-prediction.service"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function PredictionPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "fail">("idle")
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")
  
  const courseFileRef = useRef<HTMLInputElement>(null)
  const performanceFileRef = useRef<HTMLInputElement>(null)

  const handlePredictStudents = async () => {
    const courseFile = courseFileRef.current?.files?.[0]
    const performanceFile = performanceFileRef.current?.files?.[0]
    
    if (!courseFile || !performanceFile) {
      setErrorMessage('Vui lòng chọn cả 2 file Excel')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus("analyzing")
    setErrorMessage("")
    
    try {
      const formData = new FormData()
      formData.append('course_file', courseFile)
      formData.append('performance_file', performanceFile)

      const response = await predictStudents(formData)
      setAnalysisResult(response)
      setAnalysisStatus("success")
    } catch (error) {
      console.error('Prediction failed:', error)
      setErrorMessage('Dự đoán thành tích học sinh thất bại. Vui lòng thử lại.')
      setAnalysisStatus("fail")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    if (courseFileRef.current) courseFileRef.current.value = ''
    if (performanceFileRef.current) performanceFileRef.current.value = ''
    setErrorMessage("")
    setAnalysisResult(null)
  }

  const handleCloseStatusModal = () => setAnalysisStatus("idle")

  const handleDownloadExampleCourse = () => {
    const link = document.createElement('a')
    link.href = '/test_course_data.csv'
    link.download = 'test_course_data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadExamplePerformance = () => {
    const link = document.createElement('a')
    link.href = '/test_performance_data.csv'
    link.download = 'test_performance_data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const courseExampleContent = `Semester,Course ID,Course Name,Credits,Class,Continuous Assessment Score,Exam Score,Final Grade,Relative Term,EncryptedID,student_id
20171,EM1170,Pháp luật đại cương,2,99512,7,3,D,1,124d69c6fe943f985926971b3055c8c435aa528ba2a8df20b564a8977ac7ee06,1
20171,SSH1110,Những NLCB của CNML I,2,99508,8,4.5,C,1,124d69c6fe943f985926971b3055c8c435aa528ba2a8df20b564a8977ac7ee06,1
20171,PE1010,Giáo dục thể chất A,0,99748,6,0,F,1,124d69c6fe943f985926971b3055c8c435aa528ba2a8df20b564a8977ac7ee06,1`

  const performanceExampleContent = `Semester,GPA,CPA,TC qua,Acc,Debt,Reg,Level,Warning,Missing,No count,Prog,Relative Term,EncryptedID,student_id
20171,1.29,1.29,10,10,4,14,Năm thứ nhất,Mức 0, , ,Kỹ thuật điện tử - viễn thông,1,124d69c6fe943f985926971b3055c8c435aa528ba2a8df20b564a8977ac7ee06,1
20172,0.95,1.14,9,19,6,25,Năm thứ nhất,Mức 0, , ,Kỹ thuật điện tử - viễn thông,2,124d69c6fe943f985926971b3055c8c435aa528ba2a8df20b564a8977ac7ee06,1
20181,1.29,1.21,12,31,15,46,Năm thứ hai,Mức 1, , ,Kỹ thuật điện tử - viễn thông,3,124d69c6fe943f985926971b3055c8c435aa528ba2a8df20b564a8977ac7ee06,1`

  const getGPALevel = (gpa: number) => {
    if (gpa >= 3.6) return { level: 'Xuất sắc', color: 'bg-green-100 text-green-800' }
    if (gpa >= 3.2) return { level: 'Giỏi', color: 'bg-blue-100 text-blue-800' }
    if (gpa >= 2.5) return { level: 'Khá', color: 'bg-yellow-100 text-yellow-800' }
    if (gpa >= 2.0) return { level: 'Trung bình', color: 'bg-orange-100 text-orange-800' }
    return { level: 'Yếu', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Student Performance Prediction</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dự đoán thành tích học sinh kỳ tiếp theo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="courseFile" className="text-sm font-medium">Course File</label>
                  <Input 
                    id="courseFile" 
                    ref={courseFileRef} 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    className="col-span-4" 
                    required
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Course File Example:
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadExampleCourse}
                      className="gap-1 text-xs h-7"
                    >
                      <FileDown className="h-3 w-3" />
                      Download Example
                    </Button>
                  </div>
                  <div className="text-gray-600 mb-2">
                    File chứa thông tin các môn học của sinh viên với các cột:
                  </div>
                  <Textarea
                    value={courseExampleContent}
                    readOnly
                    className="text-xs font-mono bg-white"
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="performanceFile" className="text-sm font-medium">Performance File</label>
                  <Input 
                    id="performanceFile" 
                    ref={performanceFileRef} 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    className="col-span-4"
                    required
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Performance File Example:
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadExamplePerformance}
                      className="gap-1 text-xs h-7"
                    >
                      <FileDown className="h-3 w-3" />
                      Download Example
                    </Button>
                  </div>
                  <div className="text-gray-600 mb-2">
                    File chứa thông tin thành tích học tập của sinh viên với các cột:
                  </div>
                  <Textarea
                    value={performanceExampleContent}
                    readOnly
                    className="text-xs font-mono bg-white"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mt-4">
                {errorMessage}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={isAnalyzing}
              >
                Clear
              </Button>
              <Button 
                onClick={handlePredictStudents}
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Predict Performance
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysisResult && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan kết quả dự đoán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.total_students}</div>
                    <div className="text-sm text-blue-600">Tổng sinh viên</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysisResult.successful_predictions}</div>
                    <div className="text-sm text-green-600">Dự đoán thành công</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{analysisResult.failed_predictions}</div>
                    <div className="text-sm text-red-600">Dự đoán thất bại</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.total_students > 0 ? 
                        ((analysisResult.successful_predictions / analysisResult.total_students) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-purple-600">Tỷ lệ thành công</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {analysisResult.predictions && analysisResult.predictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dự đoán thành tích kỳ tiếp theo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã SV</TableHead>
                          <TableHead>Số kỳ đã học</TableHead>
                          <TableHead>GPA dự đoán</TableHead>
                          <TableHead>CPA dự đoán</TableHead>
                          <TableHead>Mức độ GPA</TableHead>
                          <TableHead>Mức độ CPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analysisResult.predictions.map((prediction: any, index: number) => {
                          const gpaLevel = getGPALevel(prediction.predicted_next_gpa)
                          const cpaLevel = getGPALevel(prediction.predicted_next_cpa)
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{prediction.student_id}</TableCell>
                              <TableCell>{prediction.total_semesters}</TableCell>
                              <TableCell className="font-mono">
                                {prediction.predicted_next_gpa.toFixed(3)}
                              </TableCell>
                              <TableCell className="font-mono">
                                {prediction.predicted_next_cpa.toFixed(3)}
                              </TableCell>
                        
                              <TableCell>
                                <Badge className={gpaLevel.color}>
                                  {gpaLevel.level}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cpaLevel.color}>
                                  {cpaLevel.level}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Dialog open={analysisStatus !== "idle"} onOpenChange={handleCloseStatusModal}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-xs">
            <DialogHeader>
              <DialogTitle>Student Performance Prediction</DialogTitle>
            </DialogHeader>
            {analysisStatus === "analyzing" && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <div className="text-center text-muted-foreground">Đang dự đoán thành tích học sinh, vui lòng chờ...</div>
              </>
            )}
            {analysisStatus === "success" && (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <div className="text-center text-green-700 font-medium">Dự đoán thành công!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
            {analysisStatus === "fail" && (
              <>
                <XCircle className="h-10 w-10 text-red-600 mx-auto" />
                <div className="text-center text-red-700 font-medium">Dự đoán thất bại!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 