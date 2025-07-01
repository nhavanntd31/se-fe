"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Settings, Download, Loader2, CheckCircle2, XCircle, FileDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef } from "react"
import { analyzePLO } from "@/services/plo.service"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PLOPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "fail">("idle")
  const [analysisResult, setAnalysisResult] = useState<{
    analyze: string
    bloom: string
    analyzeContentType: string
    bloomContentType: string
    analyzeContent?: string
    bloomTable?: any[]
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  
  const excelFileRef = useRef<HTMLInputElement>(null)
  const paramFileRef = useRef<HTMLInputElement>(null)

  const handleAnalyzePLO = async () => {
    const excelFile = excelFileRef.current?.files?.[0]
    
    if (!excelFile) {
      setErrorMessage('Vui lòng chọn file Excel')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus("analyzing")
    setErrorMessage("")
    
    try {
      const formData = new FormData()
      formData.append('excel', excelFile)
      
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
    if (excelFileRef.current) excelFileRef.current.value = ''
    if (paramFileRef.current) paramFileRef.current.value = ''
    setErrorMessage("")
    setAnalysisResult(null)
  }

  const handleDownloadAnalyze = () => {
    if (!analysisResult) return
    
    const byteCharacters = atob(analysisResult.analyze)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: analysisResult.analyzeContentType })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plo-analysis.md'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  const handleDownloadBloom = () => {
    if (!analysisResult) return
    
    const byteCharacters = atob(analysisResult.bloom)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: analysisResult.bloomContentType })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bloom-table.xlsx'
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
  "system_instruction": "Bạn là chuyên gia kiểm định chất lượng giáo dục đại học...",
  "prompt": "..."
}`

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">PLO Analysis</h2>
        </div>

        <Card >
          <CardHeader>
            <CardTitle>Phân tích chuẩn đầu ra chương trình đào tạo (PLO)</CardTitle>
          </CardHeader>
          <CardContent >
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="excelFile" className="text-sm font-medium">Excel File</label>
                  <Input 
                    id="excelFile" 
                    ref={excelFileRef} 
                    type="file" 
                    accept=".xlsx,.xls" 
                    className="col-span-4" 
                    required
                  />
                </div>
                
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
                  <label htmlFor="paramFile" className="text-sm font-medium">Parameter File</label>
                  <Input 
                    id="paramFile" 
                    ref={paramFileRef} 
                    type="file" 
                    accept=".json" 
                    className="col-span-4"
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
                    rows={8}
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
                onClick={handleAnalyzePLO}
                disabled={isAnalyzing}
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
          <>
            <Card>
              <CardHeader>
                <CardTitle>Kết quả phân tích</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button onClick={handleDownloadAnalyze} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Analysis (MD)
                  </Button>
                  <Button onClick={handleDownloadBloom} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Bloom Table (Excel)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {analysisResult.analyzeContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết phân tích PLO</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: analysisResult.analyzeContent
                          .replace(/### /g, '<h3 class="text-lg font-semibold mt-4 mb-2">')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>') 
                      }}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {analysisResult.bloomTable && analysisResult.bloomTable.length > 0 && (
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
                        {analysisResult.bloomTable.map((row: any[], index: number) => (
                          <TableRow key={index}>
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
                <div className="text-center text-green-700 font-medium">Phân tích PLO thành công!</div>
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