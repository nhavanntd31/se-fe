"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/layout/stat-card";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { StudentTable } from "@/components/layout/student-table";
import { DateRangePicker } from "@/components/layout/date-range-picker";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getSemesters, getStatistic, GetStatisticInfoDto, StatisticResponse, getClasses } from "@/services/statistic.service";
import { CPAAnalysisCard } from "@/components/layout/cpa-analysis-card";

const DEFAULT_CLASS = "all";

export default function Class() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(DEFAULT_CLASS);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [statistics, setStatistics] = useState<StatisticResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompareClass, setSelectedCompareClass] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      const data = await getClasses();
      setClasses(data);
      if (data.length > 0 && selectedClass === DEFAULT_CLASS) {
        setSelectedClass(data[0].id);
      }
    };
    const fetchSemesters = async () => {
      const data = await getSemesters();
      setSemesters(data);
      if (data.length > 0) setSelectedSemester(data[0].id);
    };
    fetchClasses();
    fetchSemesters();
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (selectedSemester) {
        const params: GetStatisticInfoDto = {
          semesterId: selectedSemester,
        };
        
        if (selectedClass !== DEFAULT_CLASS) {
          params.classId = selectedClass;
        }
        
        const data = await getStatistic(params);
        setStatistics(data);
      }
    };
    fetchStatistics();
  }, [selectedSemester, selectedClass]);

  const handleOpenDialog = (className: string) => {
    setSelectedCompareClass(className);
    setIsDialogOpen(true);
  };

  const getClassPickerItems = () => {
    return [
      { label: "Tất cả lớp", value: DEFAULT_CLASS },
      ...classes.map(cls => ({ label: cls.name, value: cls.id }))
    ];
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Lớp</h2>
          <div className="flex items-center space-x-2">
            <DateRangePicker
              items={getClassPickerItems()}
              value={selectedClass}
              onChange={setSelectedClass}
            />
            <DateRangePicker
              items={semesters.map(sem => ({ label: sem.name, value: sem.id }))}
              value={selectedSemester}
              onChange={setSelectedSemester}
            />
          </div>
        </div>
        <div className="grid ga p-4 md:grid-cols-2 lg:grid-cols-2">
          <CPAAnalysisCard 
            statistics={statistics}
            title="Thống kê mỗi kì"
            scope={selectedClass === DEFAULT_CLASS ? "Trường" : "Lớp"}
          />
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
        
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      So sánh với
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {classes.map((cls) => (
                      <DropdownMenuItem 
                        key={cls.id} 
                        onClick={() => handleOpenDialog(cls.name)}
                      >
                        {cls.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Tổng số lượng sinh viên"
                  value={statistics?.totalStudents?.toString() || "0"}
                  description="Lớp"
                  trend="up"
                  percentage="3.5%"
                  color="blue"
                />
                <StatCard
                  title="Số lượng sinh viên đầu vào"
                  value={statistics?.totalStudentIn?.toString() || "0"}
                  description="Lớp"
                  trend="down"
                  percentage="1.5%"
                  color="blue"
                />
                <StatCard
                  title="Số lượng sinh viên đầu ra"
                  value={statistics?.totalStudentOut?.toString() || "0"}
                  description="Lớp"
                  trend="up"
                  percentage="4.5%"
                  color="blue"
                />
                <StatCard
                  title="Tỉ lệ Giảng viên / Sinh viên"
                  value="3%"
                  description=""
                  trend="down"
                  percentage="1.5%"
                  color="blue"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Thống kê sinh viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">01</div>
                    <div>Tỉ lệ sinh viên tốt nghiệp đúng hạn</div>
                  </div>
                  <div className="font-medium">{statistics?.studentGraduationOnTimeRate?.toFixed(1)}%</div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${statistics?.studentGraduationOnTimeRate || 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">02</div>
                    <div>Tỉ lệ sinh viên chưa tốt nghiệp</div>
                  </div>
                  <div className="font-medium">{statistics?.studentUngraduationRate?.toFixed(1)}%</div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-green-400"
                    style={{ width: `${statistics?.studentUngraduationRate || 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">03</div>
                    <div>Tỉ lệ sinh viên bị cảnh cáo</div>
                  </div>
                  <div className="font-medium">{statistics?.studentInWarningRate?.toFixed(1)}%</div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-purple-400"
                    style={{ width: `${statistics?.studentInWarningRate || 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">04</div>
                    <div>Tỉ lệ sinh viên bỏ học/nghỉ học</div>
                  </div>
                  <div className="font-medium">{statistics?.studentGraduationLateRate?.toFixed(1)}%</div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-orange-400"
                    style={{ width: `${statistics?.studentGraduationLateRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-normal">
                Tỉ lệ sinh viên cảnh cáo
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PieChart data={[
                { name: "Cảnh cáo 1", value: statistics?.studentWarningOneRate || 0 },
                { name: "Cảnh cáo 2", value: statistics?.studentWarningTwoRate || 0 },
                { name: "Cảnh cáo 3", value: statistics?.studentWarningThreeRate || 0 }
              ]} />
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-cyan-500" />
                  <span className="text-xs">Cảnh cáo 1</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-pink-400" />
                  <span className="text-xs">Cảnh cáo 2</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-orange-400" />
                  <span className="text-xs">Cảnh cáo 3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
          <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-normal">
                Tỉ lệ học lực sinh viên
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart data={[
                  { name: "Xuất sắc", value: statistics?.studentExcellentRate || 0 },
                  { name: "Giỏi", value: statistics?.studentVeryGoodRate || 0 },
                  { name: "Khá", value: statistics?.studentGoodRate || 0 },
                  { name: "Trung bình", value: statistics?.studentMediumRate || 0 },
                  { name: "Yếu", value: statistics?.studentBadRate || 0 }
                ]} />
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Top lớp kết quả tốt</CardTitle>
              <DateRangePicker
                items={semesters.map(sem => ({ label: sem.name, value: sem.id }))}
                value={selectedSemester}
                onChange={setSelectedSemester}
              />
            </CardHeader>
            <CardContent>
              <StudentTable />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-full">
          <DialogHeader>
            <DialogTitle>So sánh với {selectedCompareClass}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lớp hiện tại</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Tổng số lượng sinh viên"
                  value={statistics?.totalStudents?.toString() || "0"}
                  description="Lớp"
                  trend="up"
                  percentage="3.5%"
                  color="blue"
                />
                <StatCard
                  title="Số lượng sinh viên đầu vào"
                  value={statistics?.totalStudentIn?.toString() || "0"}
                  description="Lớp"
                  trend="down"
                  percentage="1.5%"
                  color="blue"
                />
                <StatCard
                  title="Số lượng sinh viên đầu ra"
                  value={statistics?.totalStudentOut?.toString() || "0"}
                  description="Lớp"
                  trend="up"
                  percentage="4.5%"
                  color="blue"
                />
                <StatCard
                  title="Tỉ lệ Giảng viên / Sinh viên"
                  value="3%"
                  description=""
                  trend="down"
                  percentage="1.5%"
                  color="blue"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{selectedCompareClass}</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Tổng số lượng sinh viên"
                  value={statistics?.totalStudents?.toString() || "0"}
                  description="Lớp"
                  trend="up"
                  percentage="3.5%"
                  color="blue"
                />
                <StatCard
                  title="Số lượng sinh viên đầu vào"
                  value={statistics?.totalStudentIn?.toString() || "0"}
                  description="Lớp"
                  trend="down"
                  percentage="1.5%"
                  color="blue"
                />
                <StatCard
                  title="Số lượng sinh viên đầu ra"
                  value={statistics?.totalStudentOut?.toString() || "0"}
                  description="Lớp"
                  trend="up"
                  percentage="4.5%"
                  color="blue"
                />
                <StatCard
                  title="Tỉ lệ Giảng viên / Sinh viên"
                  value="3%"
                  description=""
                  trend="down"
                  percentage="1.5%"
                  color="blue"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 