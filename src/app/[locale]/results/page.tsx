import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResultsPage() {
  const [tab, setTab] = useState('upload')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    setTab('result')
    setTimeout(() => {
      setResult('Kết quả mô hình: Thành công!')
      setLoading(false)
    }, 2000)
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full max-w-2xl mx-auto mt-10">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">UPLOAD CSV</TabsTrigger>
        <TabsTrigger value="result">KẾT QUẢ</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <div className="flex flex-col items-center gap-4 p-8 border rounded-lg mt-4">
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Đang tải lên...' : 'Upload'}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="result">
        <div className="flex flex-col items-center gap-4 p-8 border rounded-lg mt-4 min-h-[120px]">
          {loading && <div>Đang xử lý...</div>}
          {!loading && result && <div>{result}</div>}
          {!loading && !result && <div>Chưa có kết quả.</div>}
        </div>
      </TabsContent>
    </Tabs>
  )
} 