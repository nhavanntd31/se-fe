"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Settings, Download, Loader2, CheckCircle2, XCircle, FileDown, X, ArrowLeft, CrossIcon, MinusIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { suggestCLO, CLOSuggestResult } from "@/services/clo.service"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"


const defaultPrompt = `Bạn là một chuyên gia thiết kế chương trình đào tạo đại học.
Cho đề cương học phần sau, hãy đề xuất **5 Chuẩn đầu ra học phần (CLO)**.
Yêu cầu: mỗi CLO cụ thể, đo lường được, có động từ Bloom, phủ kiến thức/kỹ năng/thái độ.
Ngôn ngữ: tiếng Việt.

## Ràng buộc chất lượng
- **Mỗi CLO** là **một câu** mô tả hành vi có thể **đánh giá** được, dùng **động từ Bloom** rõ ràng.  (Heading 2)
- Gắn nhãn **I/R/M** ngay cuối câu để thể hiện mức độ curriculum mapping.
  *I* = Introduce, *R* = Reinforce, *M* = Master.
- **Giải thích lý do** lựa chọn mức I/R/M: nêu rõ *phần, chương hoặc hoạt động* trong syllabus hỗ trợ người học đạt mức đó.  (Heading 3)
- **Cân bằng cấp độ tư duy Bloom** – ít nhất một CLO ở mức *Phân tích/Đánh giá/Sáng tạo*.
- **Không thêm nội dung ngoài syllabus**; nếu thiếu thông tin, ghi “(chưa đủ dữ liệu)” ở phần giải thích.

**BẮT BUỘC**: Trả về kết quả dưới dạng bảng Markdown với format chính xác:

| STT | Mã CLO | Nội dung | Mức độ tư duy | Giải thích |
|-----|--------|----------|---------------|-----------|
| 1   | CLO1   | Mô tả chi tiết CLO1 | I | Cơ sở từ chương/phần nào trong syllabus |
| 2   | CLO2   | Mô tả chi tiết CLO2 | R | Cơ sở từ chương/phần nào trong syllabus |
| 3   | CLO3   | Mô tả chi tiết CLO3 | M | Cơ sở từ chương/phần nào trong syllabus |

Lưu ý mức độ tư duy: 
- I (Introduce): Giới thiệu kiến thức cơ bản
- R (Reinforce): Củng cố và vận dụng
- M (Master): Thành thạo và sáng tạo

Cột "Giải thích" phải nêu rõ cơ sở từ syllabus (chương, phần, nội dung cụ thể) làm căn cứ cho CLO đó.

Chỉ trả về bảng markdown, không có text hay giải thích nào khác.`

export default function CLOSuggestPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "fail">("idle")
  const [analysisResult, setAnalysisResult] = useState<CLOSuggestResult | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedSyllabusFile, setSelectedSyllabusFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [showParameterFileBlock, setShowParameterFileBlock] = useState(false)
  
  const paramFileRef = useRef<HTMLInputElement>(null)
  const syllabusFileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null, type: 'syllabus') => {
    if (!file) return
    setSelectedSyllabusFile(file)
  }

  const handleRemoveFile = (type: 'syllabus') => {
    if (type === 'syllabus') {
      setSelectedSyllabusFile(null)
      if (syllabusFileRef.current) syllabusFileRef.current.value = ''
    }
  }

  const handleSuggestCLO = async () => {
    if (!selectedSyllabusFile) {
      setErrorMessage('Vui lòng chọn file đề cương môn học')
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
      formData.append('prompt', prompt)
      
      const paramFile = paramFileRef.current?.files?.[0]
      if (paramFile) {
        formData.append('param', paramFile)
      }

      const response = await suggestCLO(formData)
      setAnalysisResult(response)
      setAnalysisStatus("success")
    } catch (error) {
      console.error('CLO suggestion failed:', error)
      setErrorMessage('Tạo CLO thất bại. Vui lòng thử lại.')
      setAnalysisStatus("fail")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedSyllabusFile(null)
    setPrompt("")
    if (paramFileRef.current) paramFileRef.current.value = ''
    if (syllabusFileRef.current) syllabusFileRef.current.value = ''
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
    a.download = `${analysisResult.fileName.replace(/\.[^/.]+$/, "")}-clo-suggestion.md`
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
    a.download = `${analysisResult.fileName.replace(/\.[^/.]+$/, "")}-clo-list.xlsx`
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
      <Sidebar showOnlyPLOCLO={true} />
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
            <h2 className="text-3xl font-bold tracking-tight">CLO Suggest</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tạo chuẩn đầu ra học phần (CLO) từ đề cương môn học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    placeholder="Nhập prompt để hướng dẫn tạo CLO..."
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

                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <p className="text-sm font-medium">
                      Parameter File (Tùy chọn)
                      {showParameterFileBlock ?
                        <MinusIcon className="inline ms-1 h-4 w-4 cursor-pointer" onClick={() => setShowParameterFileBlock(false)} /> :
                        <CrossIcon className="inline ms-1 h-4 w-4 cursor-pointer" onClick={() => setShowParameterFileBlock(true)} />}
                    </p>
                  </div>
                  
                  {showParameterFileBlock && <div>
                    <Input 
                      id="paramFile" 
                      ref={paramFileRef} 
                      type="file" 
                      accept=".json" 
                      className="col-span-4"
                      disabled={isAnalyzing}
                    />

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
                  </div>}
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
                onClick={handleSuggestCLO}
                disabled={isAnalyzing || !selectedSyllabusFile || !prompt.trim()}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tạo CLO...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Tạo CLO
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysisResult && !analysisResult.error && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả tạo CLO</CardTitle>
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
                    <h3 className="text-lg font-semibold">Nội dung Markdown</h3>
                    <ScrollArea className="h-96 w-full border rounded-md p-4">
                      <pre className="text-sm whitespace-pre-wrap">{analysisResult.markdownContent}</pre>
                    </ScrollArea>
                  </div>
                )}

                {analysisResult.cloTable && analysisResult.cloTable.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Danh sách CLO</h3>
                    <ScrollArea className="h-96 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">STT</TableHead>
                            <TableHead className="w-24">Mã CLO</TableHead>
                            <TableHead className="w-1/3">Nội dung</TableHead>
                            <TableHead className="w-24">Mức độ tư duy</TableHead>
                            <TableHead className="w-1/3">Giải thích</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisResult.cloTable.map((clo: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="text-center">{clo.stt}</TableCell>
                              <TableCell className="font-medium">{clo.maCLO}</TableCell>
                              <TableCell className="whitespace-pre-wrap">{clo.noiDung}</TableCell>
                              <TableCell className="text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  clo.mucDoTuDuy === 'I' ? 'bg-blue-100 text-blue-800' :
                                  clo.mucDoTuDuy === 'R' ? 'bg-green-100 text-green-800' :
                                  clo.mucDoTuDuy === 'M' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {clo.mucDoTuDuy || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-pre-wrap text-sm text-gray-600">
                                {clo.giaiThich || 'N/A'}
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
              <DialogTitle>CLO Suggestion</DialogTitle>
            </DialogHeader>
            {analysisStatus === "analyzing" && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <div className="text-center text-muted-foreground">Đang tạo CLO, vui lòng chờ...</div>
              </>
            )}
            {analysisStatus === "success" && (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <div className="text-center text-green-700 font-medium">Tạo CLO thành công!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
            {analysisStatus === "fail" && (
              <>
                <XCircle className="h-10 w-10 text-red-600 mx-auto" />
                <div className="text-center text-red-700 font-medium">Tạo CLO thất bại!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 