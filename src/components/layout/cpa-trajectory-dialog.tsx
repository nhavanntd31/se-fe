"use client"
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CPATrajectoryChart } from "@/components/charts/cpa-trajectory-chart";
import { 
  getSemesters, 
  getDepartments, 
  getMajors, 
  getClasses, 
  getCPATrajectory, 
  getStudentsBySemesterRange,
  type GetCPATrajectoryDto,
  type CPATrajectoryResponse,
  type StudentsBySemesterRangeResponse
} from "@/services/statistic.service";
import { Loader2 } from "lucide-react";

interface CPATrajectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SemesterOption {
  id: string;
  name: string;
}

interface FilterOption {
  id: string;
  name: string;
}

interface Student {
  studentId: string;
  studentName: string;
  class: string;
}

const DEFAULT_DEPARTMENT = "all";
const DEFAULT_MAJOR = "all";
const DEFAULT_CLASS = "all";

export function CPATrajectoryDialog({ open, onOpenChange }: CPATrajectoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<CPATrajectoryResponse | null>(null);
  
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [departments, setDepartments] = useState<FilterOption[]>([]);
  const [majors, setMajors] = useState<FilterOption[]>([]);
  const [classes, setClasses] = useState<FilterOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>(DEFAULT_DEPARTMENT);
  const [selectedMajor, setSelectedMajor] = useState<string>(DEFAULT_MAJOR);
  const [selectedClass, setSelectedClass] = useState<string>(DEFAULT_CLASS);
  const [startSemester, setStartSemester] = useState<string>("");
  const [endSemester, setEndSemester] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [thresholdRates, setThresholdRates] = useState<number[]>([5, 10, 15]);

  const thresholdOptions = [5, 10, 15, 20, 25, 30];

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  useEffect(() => {
    if (startSemester && endSemester) {
      loadStudents();
    }
  }, [startSemester, endSemester, selectedDepartment, selectedMajor, selectedClass]);

  const loadInitialData = async () => {
    try {
      const [semestersData, departmentsData, majorsData, classesData] = await Promise.all([
        getSemesters(),
        getDepartments(),
        getMajors(),
        getClasses()
      ]);
      
      setSemesters(semestersData);
      setDepartments(departmentsData);
      setMajors(majorsData);
      setClasses(classesData);
      
      if (semestersData.length >= 2) {
        setStartSemester(semestersData[0].id);
        setEndSemester(semestersData[1].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadStudents = async () => {
    if (!startSemester || !endSemester) return;
    
    try {
      const params: any = {
        startSemester,
        endSemester,
        limit: 50
      };
      
      if (selectedDepartment !== DEFAULT_DEPARTMENT) params.departmentId = selectedDepartment;
      if (selectedMajor !== DEFAULT_MAJOR) params.majorId = selectedMajor;
      if (selectedClass !== DEFAULT_CLASS) params.classId = selectedClass;
      
      const data = await getStudentsBySemesterRange(params);
      setStudents(data.data.map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        class: s.class || ''
      })));
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  };

  const getValidEndSemesters = () => {
    if (!startSemester) return semesters;
    
    const startIndex = semesters.findIndex(s => s.id === startSemester);
    if (startIndex === -1) return semesters;
    
    return semesters.slice(startIndex + 1);
  };

  const handleThresholdChange = (threshold: number, checked: boolean) => {
    if (checked) {
      setThresholdRates(prev => [...prev, threshold].sort((a, b) => a - b));
    } else {
      setThresholdRates(prev => prev.filter(t => t !== threshold));
    }
  };

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleGenerateChart = async () => {
    if (!startSemester || !endSemester || thresholdRates.length === 0) {
      alert('Please select start semester, end semester, and at least one threshold rate');
      return;
    }

    setLoading(true);
    try {
      const params: GetCPATrajectoryDto = {
        startSemester,
        endSemester,
        thresholdRates,
        studentIds: selectedStudents.length > 0 ? selectedStudents : undefined
      };
      
      if (selectedDepartment !== DEFAULT_DEPARTMENT) params.departmentId = selectedDepartment;
      if (selectedMajor !== DEFAULT_MAJOR) params.majorId = selectedMajor;
      if (selectedClass !== DEFAULT_CLASS) params.classId = selectedClass;
      
      const data = await getCPATrajectory(params);
      setChartData(data);
    } catch (error) {
      console.error('Error generating chart:', error);
      alert('Error generating chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    if (value !== DEFAULT_DEPARTMENT) {
      setSelectedMajor(DEFAULT_MAJOR);
      setSelectedClass(DEFAULT_CLASS);
    }
  };

  const handleMajorChange = (value: string) => {
    setSelectedMajor(value);
    if (value !== DEFAULT_MAJOR) {
      setSelectedClass(DEFAULT_CLASS);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>CPA Trajectory Comparison</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_DEPARTMENT}>All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Major</label>
                  <Select value={selectedMajor} onValueChange={handleMajorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_MAJOR}>All Majors</SelectItem>
                      {majors.map(major => (
                        <SelectItem key={major.id} value={major.id}>{major.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_CLASS}>All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Semester Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Semester</label>
                  <Select value={startSemester} onValueChange={setStartSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(semester => (
                        <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Semester</label>
                  <Select value={endSemester} onValueChange={setEndSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {getValidEndSemesters().map(semester => (
                        <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Threshold Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {thresholdOptions.map(threshold => (
                    <div key={threshold} className="flex items-center space-x-2">
                      <Checkbox
                        id={`threshold-${threshold}`}
                        checked={thresholdRates.includes(threshold)}
                        onCheckedChange={(checked) => handleThresholdChange(threshold, checked as boolean)}
                      />
                      <label htmlFor={`threshold-${threshold}`} className="text-sm">
                        {threshold}%
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Students ({students.length})
                  {selectedStudents.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedStudents.length} selected
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedStudents(students.map(s => s.studentId))}
                    disabled={students.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                    disabled={selectedStudents.length === 0}
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {students.map(student => (
                      <div key={student.studentId} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`student-${student.studentId}`}
                          checked={selectedStudents.includes(student.studentId)}
                          onCheckedChange={(checked) => handleStudentToggle(student.studentId, checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor={`student-${student.studentId}`} className="text-xs cursor-pointer flex-1">
                          <div className="font-medium">{student.studentId} - {student.studentName}</div>
                          <div className="text-gray-500 text-xs">{student.class}</div>
                        </label>
                      </div>
                    ))}
                    {students.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8">
                        Please select semester range and filters to load students
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Button 
              onClick={handleGenerateChart} 
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Chart
            </Button>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>CPA Trajectory Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData ? (
                  <CPATrajectoryChart data={chartData} />
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-gray-500">
                    Select parameters and click "Generate Chart" to view the trajectory
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 