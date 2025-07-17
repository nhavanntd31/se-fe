"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Settings, Download, Loader2, CheckCircle2, XCircle, FileDown, X, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { checkCLO, CLOCheckResult } from "@/services/clo.service"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"


const defaultPrompt = `Bạn là chuyên gia đánh giá chuẩn đầu ra học phần (CLO) theo OBE/Bloom.
Dựa trên đề cương học phần và danh sách CLO hiện có, hãy lập bảng nhận xét gồm 4 cột:
| # | Nội dung CLO | I/R/M | Nhận xét/Justification |
Yêu cầu:
- Xác định mức I/R/M thích hợp dựa trên phạm vi và độ sâu kiến thức trong syllabus.
- Nhận xét ngắn gọn (≤40 từ) về sự đầy đủ, động từ Bloom, và mức alignment.
- Nếu CLO mơ hồ hoặc thiếu căn cứ, đánh dấu ⚠️ trong cột Nhận xét.
- Không thêm CLO mới. Trả về bảng Markdown duy nhất, không giải thích ngoài bảng.`

export default function CLOCheckPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "fail">("idle")
  const [analysisResult, setAnalysisResult] = useState<CLOCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedSyllabusFile, setSelectedSyllabusFile] = useState<File | null>(null)
  const [selectedCLOFile, setSelectedCLOFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState(defaultPrompt)
  
  const paramFileRef = useRef<HTMLInputElement>(null)
  const syllabusFileRef = useRef<HTMLInputElement>(null)
  const cloFileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null, type: 'syllabus' | 'clo') => {
    if (!file) return
    if (type === 'syllabus') {
      setSelectedSyllabusFile(file)
    } else if (type === 'clo') {
      setSelectedCLOFile(file)
    }
  }

  const handleRemoveFile = (type: 'syllabus' | 'clo') => {
    if (type === 'syllabus') {
      setSelectedSyllabusFile(null)
      if (syllabusFileRef.current) syllabusFileRef.current.value = ''
    } else if (type === 'clo') {
      setSelectedCLOFile(null)
      if (cloFileRef.current) cloFileRef.current.value = ''
    }
  }

  const handleCheckCLO = async () => {
    if (!selectedSyllabusFile) {
      setErrorMessage('Vui lòng chọn file đề cương môn học')
      return
    }

    if (!selectedCLOFile) {
      setErrorMessage('Vui lòng chọn file CLO')
      return
    }

    if (!prompt.trim()) {
      setErrorMessage('Vui lòng nhập prompt')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus("analyzing")
    setErrorMessage("")
    
    try {
      const formData = new FormData()
      formData.append('syllabus', selectedSyllabusFile)
      formData.append('clo', selectedCLOFile)
      formData.append('prompt', prompt)
      
      const paramFile = paramFileRef.current?.files?.[0]
      if (paramFile) {
        formData.append('param', paramFile)
      }

      const response = await checkCLO(formData)
      setAnalysisResult(response)
      setAnalysisStatus("success")
    } catch (error) {
      console.error('CLO check failed:', error)
      setErrorMessage('Đánh giá CLO thất bại. Vui lòng thử lại.')
      setAnalysisStatus("fail")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedSyllabusFile(null)
    setSelectedCLOFile(null)
    setPrompt("")
    if (paramFileRef.current) paramFileRef.current.value = ''
    if (syllabusFileRef.current) syllabusFileRef.current.value = ''
    if (cloFileRef.current) cloFileRef.current.value = ''
    setErrorMessage("")
    setAnalysisResult(null)
  }

  const handleDownloadMarkdown = () => {
    if (!analysisResult?.markdown) return
    
    const byteCharacters = atob(analysisResult.markdown)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: analysisResult.markdownContentType })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${analysisResult.syllabusFileName.replace(/\.[^/.]+$/, "")}-clo-evaluation.md`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const handleDownloadExcel = () => {
    if (!analysisResult?.excel) return
    
    const byteCharacters = atob(analysisResult.excel)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: analysisResult.excelContentType })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${analysisResult.syllabusFileName.replace(/\.[^/.]+$/, "")}-clo-evaluation.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const handleCloseStatusModal = () => setAnalysisStatus("idle")

  const handleDownloadExampleParam = () => {
    const link = document.createElement('a')
    link.href = '/plo_param.json'
    link.download = 'clo_param.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exampleParamContent = `{
  "api_key": "sk-...",
  "model": "mistralai/mistral-small-3.2-24b-instruct:free",
  "temperature": 0.2,
  "system_instruction": "Bạn là chuyên gia kiểm định chất lượng giáo dục đại học..."
}`

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/clo')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">CLO Check</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đánh giá chuẩn đầu ra học phần (CLO) dựa trên đề cương môn học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    placeholder="Nhập prompt để hướng dẫn đánh giá CLO..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">File đề cương môn học</label>
                  <div className="flex items-center gap-2">
                    {selectedSyllabusFile ? (
                      <>
                        <div className="flex-1 px-3 py-2 border rounded-md bg-green-50 border-green-200">
                          <span className="text-sm text-green-700 font-medium">
                            {selectedSyllabusFile.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile('syllabus')}
                          disabled={isAnalyzing}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Input
                        ref={syllabusFileRef}
                        type="file"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'syllabus')}
                        disabled={isAnalyzing}
                        accept=".pdf,.doc,.docx,.txt,.md"
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">File CLO</label>
                  <div className="flex items-center gap-2">
                    {selectedCLOFile ? (
                      <>
                        <div className="flex-1 px-3 py-2 border rounded-md bg-green-50 border-green-200">
                          <span className="text-sm text-green-700 font-medium">
                            {selectedCLOFile.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile('clo')}
                          disabled={isAnalyzing}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Input
                        ref={cloFileRef}
                        type="file"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'clo')}
                        disabled={isAnalyzing}
                        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.md"
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="paramFile" className="text-sm font-medium">Parameter File (Tùy chọn)</label>
                    <Input 
                      id="paramFile" 
                      ref={paramFileRef} 
                      type="file" 
                      accept=".json" 
                      className="col-span-4"
                      disabled={isAnalyzing}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="font-medium mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Parameter File Example:
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadExampleParam}
                        className="gap-1 text-xs h-7"
                      >
                        <FileDown className="h-3 w-3" />
                        Download Example
                      </Button>
                    </div>
                    <Textarea
                      value={exampleParamContent}
                      readOnly
                      className="text-xs font-mono bg-white"
                      rows={6}
                    />
                  </div>
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
                onClick={handleCheckCLO}
                disabled={isAnalyzing || !selectedSyllabusFile || !selectedCLOFile || !prompt.trim()}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đánh giá CLO...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Đánh giá CLO
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysisResult && !analysisResult.error && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả đánh giá CLO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 justify-center mb-6">
                  <Button onClick={handleDownloadMarkdown} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Markdown
                  </Button>
                  <Button onClick={handleDownloadExcel} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Excel
                  </Button>
                </div>

                {analysisResult.markdownContent && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Báo cáo đánh giá</h3>
                    <ScrollArea className="h-96 w-full border rounded-md p-4">
                      <pre className="text-sm whitespace-pre-wrap">{analysisResult.markdownContent}</pre>
                    </ScrollArea>
                  </div>
                )}

                {analysisResult.evaluationTable && analysisResult.evaluationTable.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bảng đánh giá CLO</h3>
                    <ScrollArea className="h-96 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">STT</TableHead>
                            <TableHead className="w-96">Nội dung CLO</TableHead>
                            <TableHead className="w-20">I/R/M</TableHead>
                            <TableHead>Nhận xét/Justification</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisResult.evaluationTable.map((evaluation: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium align-top">{evaluation.STT}</TableCell>
                              <TableCell className="align-top">
                                <div className="text-sm whitespace-normal break-words max-w-96 leading-relaxed">
                                  {evaluation["Nội dung CLO"]}
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  evaluation["I/R/M"] === 'I' ? 'bg-blue-100 text-blue-800' :
                                  evaluation["I/R/M"] === 'R' ? 'bg-orange-100 text-orange-800' :
                                  evaluation["I/R/M"] === 'M' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {evaluation["I/R/M"]}
                                </span>
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="text-sm whitespace-normal break-words leading-relaxed">
                                  {evaluation["Nhận xét/Justification"]}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResult?.error && (
          <Card>
            <CardContent className="pt-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                Lỗi: {analysisResult.error}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={analysisStatus !== "idle"} onOpenChange={handleCloseStatusModal}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-xs">
            <DialogHeader>
              <DialogTitle>CLO Evaluation</DialogTitle>
            </DialogHeader>
            {analysisStatus === "analyzing" && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <div className="text-center text-muted-foreground">Đang đánh giá CLO, vui lòng chờ...</div>
              </>
            )}
            {analysisStatus === "success" && (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <div className="text-center text-green-700 font-medium">Đánh giá CLO thành công!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
            {analysisStatus === "fail" && (
              <>
                <XCircle className="h-10 w-10 text-red-600 mx-auto" />
                <div className="text-center text-red-700 font-medium">Đánh giá CLO thất bại!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 