import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StudentTable() {
  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Ngành/Khoa</TableHead>
          <TableHead>Điểm trung bình GPA/HK (%)</TableHead>
          <TableHead>Sinh viên cảnh cáo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Kỹ thuật Điện 2017</TableCell>
          <TableCell>80%</TableCell>
          <TableCell>2%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">ET - ETE 2021</TableCell>
          <TableCell>70%</TableCell>
          <TableCell>3%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Tự động hóa 2020</TableCell>
          <TableCell>68%</TableCell>
          <TableCell>5%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">ET - ETE 2022</TableCell>
          <TableCell>60%</TableCell>
          <TableCell>6%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
