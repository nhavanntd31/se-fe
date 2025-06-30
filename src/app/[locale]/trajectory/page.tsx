"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CPATrajectoryChart } from "@/components/charts/cpa-trajectory-chart";
import { 
  getDepartments, 
  getMajors, 
  getClasses,
  getSemesters,
  getCPATrajectory,
  getStudentsBySemesterRange,
  CPATrajectoryResponse
} from "@/services/statistic.service";

const DEFAULT_DEPARTMENT = "all";
const DEFAULT_MAJOR = "all";
const DEFAULT_CLASS = "all";

interface Student {
  studentId: string;
  studentName: string;
  class: string;
}

export default function TrajectoryPage() {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [majors, setMajors] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedDepartment, setSelectedDepartment] = useState(DEFAULT_DEPARTMENT);
  const [selectedMajor, setSelectedMajor] = useState(DEFAULT_MAJOR);
  const [selectedClass, setSelectedClass] = useState(DEFAULT_CLASS);
  const [startSemester, setStartSemester] = useState("");
  const [endSemester, setEndSemester] = useState("");
  const [thresholdRates, setThresholdRates] = useState<number[]>([5, 10]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [trajectoryData, setTrajectoryData] = useState<CPATrajectoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [studentPage, setStudentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [hasMoreStudents, setHasMoreStudents] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentsData, semestersData] = await Promise.all([
          getDepartments(),
          getSemesters()
        ]);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        setSemesters(Array.isArray(semestersData) ? semestersData : []);
        if (Array.isArray(semestersData) && semestersData.length >= 2) {
          setStartSemester(semestersData[0].id);
          setEndSemester(semestersData[1].id);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setDepartments([]);
        setSemesters([]);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDepartment !== DEFAULT_DEPARTMENT) {
      const fetchMajors = async () => {
        try {
          const majorsData = await getMajors();
          setMajors(Array.isArray(majorsData) ? majorsData : []);
          setSelectedMajor(DEFAULT_MAJOR);
          setSelectedClass(DEFAULT_CLASS);
        } catch (error) {
          console.error('Failed to fetch majors:', error);
          setMajors([]);
        }
      };
      fetchMajors();
    } else {
      setMajors([]);
      setSelectedMajor(DEFAULT_MAJOR);
      setSelectedClass(DEFAULT_CLASS);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedMajor !== DEFAULT_MAJOR) {
      const fetchClasses = async () => {
        try {
          const classesData = await getClasses();
          setClasses(Array.isArray(classesData) ? classesData : []);
          setSelectedClass(DEFAULT_CLASS);
        } catch (error) {
          console.error('Failed to fetch classes:', error);
          setClasses([]);
        }
      };
      fetchClasses();
    } else {
      setClasses([]);
      setSelectedClass(DEFAULT_CLASS);
    }
  }, [selectedMajor]);

  const fetchStudents = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!startSemester || !endSemester) return;
    
    setLoadingStudents(true);
    try {
      const params: any = {
        startSemester,
        endSemester,
        offset: page,
        limit: 20,
        keyword: studentSearch || undefined
      };
      
      if (selectedDepartment !== DEFAULT_DEPARTMENT) params.departmentId = selectedDepartment;
      if (selectedMajor !== DEFAULT_MAJOR) params.majorId = selectedMajor;
      if (selectedClass !== DEFAULT_CLASS) params.classId = selectedClass;
      
      const studentsData = await getStudentsBySemesterRange(params);
      const newStudents = studentsData.data.map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        class: s.class || ''
      }));
      
      if (reset) {
        setStudents(newStudents);
      } else {
        setStudents(prev => [...prev, ...newStudents]);
      }
      
      setTotalStudents(studentsData.totalStudents);
      setHasMoreStudents(studentsData.meta.page < studentsData.meta.totalPages);
      setStudentPage(page);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      if (reset) {
        setStudents([]);
        setTotalStudents(0);
        setHasMoreStudents(false);
      }
    } finally {
      setLoadingStudents(false);
    }
  }, [startSemester, endSemester, selectedDepartment, selectedMajor, selectedClass, studentSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStudents(1, true);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fetchStudents]);

  const loadMoreStudents = () => {
    if (!loadingStudents && hasMoreStudents) {
      fetchStudents(studentPage + 1, false);
    }
  };

  const handleThresholdChange = (rate: number, checked: boolean) => {
    setThresholdRates(prev => 
      checked ? [...prev, rate].sort((a, b) => a - b) : prev.filter(r => r !== rate)
    );
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents(students.map(s => s.studentId));
  };

  const handleClearAllStudents = () => {
    setSelectedStudents([]);
  };

  const handleAnalyze = async () => {
    if (!startSemester || !endSemester) return;
    
    setIsLoading(true);
    try {
      const params: any = {
        startSemester,
        endSemester,
        thresholdRates,
        studentIds: selectedStudents
      };
      
      if (selectedDepartment !== DEFAULT_DEPARTMENT) params.departmentId = selectedDepartment;
      if (selectedMajor !== DEFAULT_MAJOR) params.majorId = selectedMajor;
      if (selectedClass !== DEFAULT_CLASS) params.classId = selectedClass;
      
      const data = await getCPATrajectory(params);
      setTrajectoryData(data);
    } catch (error) {
      console.error('Failed to fetch trajectory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidSemesterRange = () => {
    if (!startSemester || !endSemester) return false;
    const startIndex = semesters.findIndex(s => s.id === startSemester);
    const endIndex = semesters.findIndex(s => s.id === endSemester);
    return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">CPA Trajectory Analysis</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Analysis Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_DEPARTMENT}>Tất cả khoa</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Major</label>
                <Select value={selectedMajor} onValueChange={setSelectedMajor} disabled={selectedDepartment === DEFAULT_DEPARTMENT}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_MAJOR}>Tất cả ngành</SelectItem>
                    {majors.map(major => (
                      <SelectItem key={major.id} value={major.id}>{major.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={selectedMajor === DEFAULT_MAJOR}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_CLASS}>Tất cả lớp</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Semester</label>
                  <Select value={startSemester} onValueChange={setStartSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kì bắt đầu" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(semester => (
                        <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Semester</label>
                  <Select value={endSemester} onValueChange={setEndSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kì kết thúc" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(semester => (
                        <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {!isValidSemesterRange() && startSemester && endSemester && (
                <p className="text-sm text-red-500">End semester must be after start semester</p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Threshold Rates</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15, 20, 25, 30].map(rate => (
                    <div key={rate} className="flex items-center space-x-2">
                      <Checkbox
                        checked={thresholdRates.includes(rate)}
                        onCheckedChange={(checked) => handleThresholdChange(rate, checked as boolean)}
                      />
                      <span className="text-sm">{rate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Students ({totalStudents} total, {selectedStudents.length} selected)
                </label>
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllStudents}
                    disabled={students.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearAllStudents}
                    disabled={selectedStudents.length === 0}
                  >
                    Clear All
                  </Button>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {students.map(student => (
                      <div key={student.studentId} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={selectedStudents.includes(student.studentId)}
                          onCheckedChange={() => handleStudentToggle(student.studentId)}
                          className="mt-1"
                        />
                        <div className="flex-1 text-xs cursor-pointer" onClick={() => handleStudentToggle(student.studentId)}>
                          <div className="font-medium">{student.studentId} - {student.studentName}</div>
                          <div className="text-gray-500">{student.class}</div>
                        </div>
                      </div>
                    ))}
                    
                    {hasMoreStudents && (
                      <div className="text-center py-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={loadMoreStudents}
                          disabled={loadingStudents}
                        >
                          {loadingStudents ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                    
                    {students.length === 0 && !loadingStudents && (
                      <div className="text-center text-gray-500 text-sm py-8">
                        Please select semester range and filters to load students
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={!isValidSemesterRange() || thresholdRates.length === 0 || isLoading}
                className="w-full"
              >
                {isLoading ? "Analyzing..." : "Analyze Trajectory"}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>CPA Trajectory Chart</CardTitle>
            </CardHeader>
            <CardContent>
              {trajectoryData ? (
                <CPATrajectoryChart data={trajectoryData} />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                  Configure analysis parameters and click "Analyze Trajectory" to view chart
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 