"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line-chart"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { getStudentInfo, generateStudentPDFReport } from "@/services/statistic.service"
import { StudentCoursesModal } from "@/components/modals/student-courses-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function StudentPage() {
  const [studentId, setStudentId] = useState("")
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<{
    semesterId: string
    semesterName: string
  } | null>(null)
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success" | "fail">("idle")

  const handleSearch = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getStudentInfo(studentId)
      setStudent(data)
    } catch (e) {
      setStudent(null)
      setError("Không tìm thấy sinh viên")
    }
    setLoading(false)
  }

  const chartData = student
    ? student.studentProcesses
        .slice()
        .reverse()
        .map((item: any) => ({
          semester: item.semester,
          gpa: item.gpa,
          cpa: item.cpa,
        }))
    : []

  const firstProcess = student?.studentProcesses?.[0]
  const firstPrediction = student?.studentPredictions?.[0]

  const handleSemesterClick = (semesterId: string, semesterName: string) => {
    setSelectedSemester({
      semesterId: semesterId,
      semesterName: semesterName
    })
    setModalOpen(true)
  }

  const handleDownloadPDF = async () => {
    if (!student?.id) return
    setPdfStatus("loading")
    try {
      const res = await generateStudentPDFReport(student.id)
      const byteCharacters = atob(res.buffer)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: res.contentType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student-report-${student.id}.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
      setPdfStatus("success")
    } catch (e) {
      setPdfStatus("fail")
    }
  }

  const handleClosePdfModal = () => setPdfStatus("idle")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Thông tin sinh viên</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm sinh viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Nhập mã sinh viên"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="max-w-md"
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
              />
              <Button onClick={handleSearch} disabled={loading || !studentId}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Đang tìm..." : "Tìm kiếm"}
              </Button>
              {student && (
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất PDF
                </Button>
              )}
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </CardContent>
        </Card>

        {student && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">
                    Biểu đồ GPA/CPA qua các kỳ học
                  </CardTitle>
          
                </CardHeader>
                <CardContent>
                  <LineChart data={chartData} />
                  <div className="flex space-x-4 pt-5 text-sm">
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-blue-500" />
                      <span>GPA</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-pink-400" />
                      <span>CPA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Thông tin học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Tổng số tín chỉ đạt</TableCell>
                        <TableCell>
                          {firstProcess?.registeredCredits ?? "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Điểm trung bình tích lũy (CPA)</TableCell>
                        <TableCell>
                          {firstProcess?.cpa ?? "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mức cảnh cáo</TableCell>
                        <TableCell className={firstProcess?.warningLevel === 0 ? "text-green-500" : "text-red-500"}>
                          {firstProcess?.warningLevel === 0 ? "Không" : `Cảnh cáo ${firstProcess?.warningLevel}`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Tín chỉ nợ</TableCell>
                        <TableCell>
                          {firstProcess?.debtCredits ?? "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Dự đoán GPA/CPA kỳ tới</TableCell>
                        <TableCell>
                          {firstPrediction ? (
                            <div className="space-y-1">
                              <div>
                                <span className="font-medium">GPA: </span>
                                <span className="text-blue-600">{firstPrediction.nextSemesterGPA.toFixed(2)}</span>
                                <span className="mx-2">•</span>
                                <span className="font-medium">CPA: </span>
                                <span className="text-blue-600">{firstPrediction.nextSemesterCPA.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Kỳ {firstPrediction.semester.name} ({firstPrediction.nextSemesterCredit} TC)
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Dự đoán mức cảnh cáo kỳ tới</TableCell>
                        <TableCell>
                          {firstPrediction ? (
                            <div>
                              <span className={firstPrediction.nextSemesterWarningLevel === 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                {firstPrediction.nextSemesterWarningLevel === 0 ? "Không" : `Cảnh cáo ${firstPrediction.nextSemesterWarningLevel}`}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                Kỳ {firstPrediction.semester.name}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Chi tiết điểm các kỳ</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kỳ học</TableHead>
                      <TableHead>Số tín chỉ đăng ký</TableHead>
                      <TableHead>Số tín chỉ đạt</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>CPA</TableHead>
                      <TableHead>Xếp loại</TableHead>
                      <TableHead>Cảnh cáo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.studentProcesses.map((item: any, idx: number) => (
                      <TableRow 
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSemesterClick(item.semesterId, item.semester)}
                      >
                        <TableCell className="font-medium">{item.semester}</TableCell>
                        <TableCell>{item.registeredCredits}</TableCell>
                        <TableCell>{item.registeredCredits - item.debtCredits}</TableCell>
                        <TableCell>{item.gpa}</TableCell>
                        <TableCell>{item.cpa}</TableCell>
                        <TableCell>
                          {item.gpa >= 3.2
                            ? "Giỏi"
                            : item.gpa >= 2.5
                            ? "Khá"
                            : item.gpa >= 2
                            ? "Trung bình"
                            : "Yếu"}
                        </TableCell>
                        <TableCell>
                          {item.warningLevel === 0 ? "Không" : `Cảnh cáo ${item.warningLevel}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <StudentCoursesModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          studentId={student?.id || ""}
          semesterId={selectedSemester?.semesterId || ""}
          semesterName={selectedSemester?.semesterName || ""}
          studentName={student?.name || ""}
        />

        <Dialog open={pdfStatus !== "idle"} onOpenChange={handleClosePdfModal}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-xs">
            <DialogHeader>
              <DialogTitle>Student Report {student?.id}</DialogTitle>
            </DialogHeader>
            {pdfStatus === "loading" && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <div className="text-center text-muted-foreground">Đang tạo file PDF, vui lòng chờ...</div>
              </>
            )}
            {pdfStatus === "success" && (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <div className="text-center text-green-700 font-medium">Tạo và tải file PDF thành công!</div>
                <Button className="mt-2 w-full" onClick={handleClosePdfModal}>Đóng</Button>
              </>
            )}
            {pdfStatus === "fail" && (
              <>
                <XCircle className="h-10 w-10 text-red-600 mx-auto" />
                <div className="text-center text-red-700 font-medium">Tạo hoặc tải file PDF thất bại!</div>
                <Button className="mt-2 w-full" onClick={handleClosePdfModal}>Đóng</Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
