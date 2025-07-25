"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Settings, Download, Loader2, CheckCircle2, XCircle, FileDown, Files, X, CrossIcon, MinusIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useState, useRef } from "react"
import { analyzePLO, PLOResult, PLOAnalysisResponse } from "@/services/plo.service"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

const defaultPrompt = `# Phân tích chuẩn đầu ra chương trình đào tạo (PLO) theo khung phân loại Bloom hai chiều

## Bước 1: Phân tích từng PLO
Với mỗi PLO được cung cấp, hãy:
1. **Đánh giá tính đúng quy định**: PLO có rõ ràng, cụ thể, đo lường được và định hướng năng lực không? Có đúng cấu trúc không?
2. **Xác định nhóm thuộc tính PLO** theo 6 nhóm phổ biến:
   - Kiến thức chuyên môn
   - Kỹ năng nghề nghiệp
   - Năng lực giải quyết vấn đề
   - Năng lực giao tiếp & làm việc nhóm
   - Năng lực học tập suốt đời
   - Năng lực đạo đức & trách nhiệm xã hội
3. **Ánh xạ PLO vào Thang Bloom hai chiều**:
   - Chiều tiến trình nhận thức: [Remember, Understand, Apply, Analyze, Evaluate, Create]
   - Chiều loại kiến thức: [Factual Knowledge, Conceptual Knowledge, Procedural Knowledge, Meta-Cognitive Knowledge]

**Lưu ý**: Tránh các động từ không đo lường được như: Hiểu, Biết, Nắm được, Nhận thấy, Chấp nhận, Có kiến thức về, Nhận thức được, Có ý thức về, Học được, Nhận biết, Hình thành giá trị, Chấp nhận, Làm quen với.

## Bước 2: Trình bày kết quả
- Viết phân tích chi tiết dưới dạng đoạn văn cho từng PLO, nêu rõ:
  - PLO có phù hợp và hiệu lực không?
  - PLO thuộc nhóm năng lực nào?
  - Lý do lựa chọn mức độ nhận thức và loại kiến thức tương ứng.
- Mỗi phân tích PLO phải bắt đầu bằng tiêu đề: \`### Phân tích: <PLO_ID>\`
- Tổng hợp tất cả các PLO vào một bảng ánh xạ Bloom ở cuối dưới dạng bảng Markdown:

| Mã PLO | Mô tả rút gọn | Nhóm Năng lực | Tiến trình nhận thức | Loại kiến thức |
|--------|---------------|---------------|----------------------|----------------|
| PLO1   | Mô tả ngắn gọn | | | |

## Yêu cầu định dạng:
- Đầu ra sử dụng Markdown, có tiêu đề rõ ràng cho từng phần.
- Phân tích từng PLO theo thứ tự cung cấp, gắn nhãn rõ ràng (PLO01, PLO02, …).
- Trình bày bảng gọn gàng, dễ đọc.
- Chỉ trình bày kết quả phân tích, không diễn giải thêm.`;


export default function PLOPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "fail">("idle")
  const [analysisResult, setAnalysisResult] = useState<PLOAnalysisResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [showParameterFileBlock, setShowParameterFileBlock] = useState(false)
  
  const paramFileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null, index: number) => {
    if (!file) return
    
    const newFiles = [...selectedFiles]
    newFiles[index] = file
    setSelectedFiles(newFiles)
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
  }

  const handleAnalyzePLO = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 file Excel')
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
      
      selectedFiles.forEach(file => {
        formData.append('excel', file)
      })
      
      formData.append('prompt', prompt)
      
      const paramFile = paramFileRef.current?.files?.[0]
      if (paramFile) {
        formData.append('param', paramFile)
      }

      const response = await analyzePLO(formData)
      setAnalysisResult(response)
      setAnalysisStatus("success")
    } catch (error) {
      console.error('Analysis failed:', error)
      setErrorMessage('Phân tích PLO thất bại. Vui lòng thử lại.')
      setAnalysisStatus("fail")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedFiles([])
    setPrompt("")
    if (paramFileRef.current) paramFileRef.current.value = ''
    setErrorMessage("")
    setAnalysisResult(null)
  }

  const handleDownloadAnalyze = (result: PLOResult) => {
    if (!result.analyze) return
    
    const byteCharacters = atob(result.analyze)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: result.analyzeContentType })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}-analysis.md`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const handleDownloadBloom = (result: PLOResult) => {
    if (!result.bloom) return
    
    const byteCharacters = atob(result.bloom)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: result.bloomContentType })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}-bloom-table.xlsx`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const handleCloseStatusModal = () => setAnalysisStatus("idle")

  const handleDownloadExampleExcel = () => {
    const link = document.createElement('a')
    link.href = '/plo_input.xlsx'
    link.download = 'plo_input.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadExampleParam = () => {
    const link = document.createElement('a')
    link.href = '/plo_param.json'
    link.download = 'plo_param.json'
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

  const canAddMoreFiles = selectedFiles.length < 5

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar showOnlyPLOCLO={true} />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">PLO Analysis</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Phân tích chuẩn đầu ra chương trình đào tạo (PLO)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    placeholder="Nhập prompt để hướng dẫn phân tích PLO..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Excel Files (Max 5)</label>
                  
                  {Array.from({ length: Math.max(1, selectedFiles.length + (canAddMoreFiles ? 1 : 0)) }, (_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {selectedFiles[index] ? (
                        <>
                          <div className="flex-1 px-3 py-2 border rounded-md bg-green-50 border-green-200">
                            <span className="text-sm text-green-700 font-medium">
                              {selectedFiles[index].name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isAnalyzing}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept=".xlsx,.xls" 
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleFileSelect(file, index)
                                e.target.value = ''
                              }
                            }}
                            disabled={isAnalyzing || (index >= selectedFiles.length && !canAddMoreFiles)}
                            className="cursor-pointer file:cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <Files className="h-4 w-4 inline mr-2" />
                    Đã chọn {selectedFiles.length} file: {selectedFiles.map(f => f.name).join(', ')}
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Excel File Example:
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadExampleExcel}
                      className="gap-1 text-xs h-7"
                    >
                      <FileDown className="h-3 w-3" />
                      Download Example
                    </Button>
                  </div>
                  <div className="text-gray-600">
                    File Excel chứa 2 cột: ID và PLO<br/>
                    - Cột A: Mã PLO (PLO01, PLO02, ...)<br/>
                    - Cột B: Mô tả PLO chi tiết
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="text-sm font-medium">
                    Parameter File
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
                      rows={8}
                    />
                  </div>
                </div>}
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
                onClick={handleAnalyzePLO}
                disabled={isAnalyzing || selectedFiles.length === 0 || !prompt.trim()}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Analyze PLO
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Kết quả phân tích</span>
                <span className="text-sm font-normal text-gray-600">
                  {analysisResult.successfulFiles}/{analysisResult.totalFiles} files thành công
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full max-w-6xl mx-auto" opts={{ loop: true }}>
                <CarouselContent>
                  {analysisResult.results.map((result, index) => (
                    <CarouselItem key={index}>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <CarouselPrevious className="relative top-0 left-0 translate-x-0 translate-y-0" />
                            <h3 className="text-lg font-semibold">{result.fileName}</h3>
                            <CarouselNext className="relative top-0 right-0 translate-x-0 translate-y-0" />
                          </div>
                          {result.error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                              Lỗi: {result.error}
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-4 justify-center mb-6">
                                <Button onClick={() => handleDownloadAnalyze(result)} className="gap-2">
                                  <Download className="h-4 w-4" />
                                  Download MD
                                </Button>
                                <Button onClick={() => handleDownloadBloom(result)} className="gap-2">
                                  <Download className="h-4 w-4" />
                                  Download Bloom
                                </Button>
                              </div>
                              {result.analyzeContent && (
                                <Card className="mb-6 ">
                                  <CardHeader>
                                    <CardTitle>Chi tiết phân tích PLO</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ScrollArea className="h-96 w-full rounded-md border p-4">
                                      <div 
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ 
                                          __html: result.analyzeContent
                                            .replace(/### /g, '<h3 class="text-lg font-semibold mt-4 mb-2">')
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br/>') 
                                        }}
                                      />
                                    </ScrollArea>
                                  </CardContent>
                                </Card>
                              )}
                              {result.bloomTable && result.bloomTable.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Bảng ánh xạ Bloom</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="rounded-md border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Mã PLO</TableHead>
                                            <TableHead>Mô tả rút gọn</TableHead>
                                            <TableHead>Nhóm Năng lực</TableHead>
                                            <TableHead>Tiến trình nhận thức</TableHead>
                                            <TableHead>Loại kiến thức</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {result.bloomTable.map((row: any[], rowIndex: number) => (
                                            <TableRow key={rowIndex}>
                                              <TableCell className="font-medium">{row[0]}</TableCell>
                                              <TableCell>{row[1]}</TableCell>
                                              <TableCell>{row[2]}</TableCell>
                                              <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  row[3] === 'Apply' ? 'bg-blue-100 text-blue-800' :
                                                  row[3] === 'Create' ? 'bg-green-100 text-green-800' :
                                                  row[3] === 'Analyze' ? 'bg-purple-100 text-purple-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {row[3]}
                                                </span>
                                              </TableCell>
                                              <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  row[4] === 'Procedural Knowledge' ? 'bg-orange-100 text-orange-800' :
                                                  row[4] === 'Conceptual Knowledge' ? 'bg-indigo-100 text-indigo-800' :
                                                  row[4] === 'Meta-Cognitive Knowledge' ? 'bg-pink-100 text-pink-800' :
                                                  row[4] === 'Factual Knowledge' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {row[4]}
                                                </span>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </CardContent>
          </Card>
        )}

        <Dialog open={analysisStatus !== "idle"} onOpenChange={handleCloseStatusModal}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-xs">
            <DialogHeader>
              <DialogTitle>PLO Analysis</DialogTitle>
            </DialogHeader>
            {analysisStatus === "analyzing" && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <div className="text-center text-muted-foreground">Đang phân tích PLO, vui lòng chờ...</div>
              </>
            )}
            {analysisStatus === "success" && (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <div className="text-center text-green-700 font-medium">
                  Phân tích PLO thành công!<br/>
                  <span className="text-sm">
                    {analysisResult?.successfulFiles}/{analysisResult?.totalFiles} files
                  </span>
                </div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
            {analysisStatus === "fail" && (
              <>
                <XCircle className="h-10 w-10 text-red-600 mx-auto" />
                <div className="text-center text-red-700 font-medium">Phân tích PLO thất bại!</div>
                <Button className="mt-2 w-full" onClick={handleCloseStatusModal}>Đóng</Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 