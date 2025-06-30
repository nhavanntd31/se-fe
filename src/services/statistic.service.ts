import axios from 'axios';
import { authService } from './auth.service';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.baseUrl;

export interface GetStatisticInfoDto {
  semesterId?: string;
  departmentId?: string;
  majorId?: string;
  classId?: string;
}

export interface GetCPATrajectoryDto {
  departmentId?: string;
  majorId?: string;
  classId?: string;
  startSemester: string;
  endSemester: string;
  thresholdRates: number[];
  studentIds?: string[];
}

export interface GetStudentsBySemesterRangeDto {
  departmentId?: string;
  majorId?: string;
  classId?: string;
  startSemester: string;
  endSemester: string;
  keyword?: string;
  offset?: number;
  limit?: number;
}

export interface CPATrajectoryResponse {
  averageCPA: { semester: string; cpa: number | null }[];
  medianCPA: { semester: string; cpa: number | null }[];
  thresholdStudents: {
    threshHold: number;
    cpaTrajectory: { semester: string; cpa: number | null }[][];
  }[];
  specificStudents: {
    studentId: string;
    studentName: string;
    cpaTrajectory: { semester: string; cpa: number | null }[];
  }[];
  semesters: string[];
  totalStudents: number;
}

export interface StudentsBySemesterRangeResponse {
  data: {
    studentId: string;
    studentName: string;
    class: string;
    major: string;
    department: string;
    processes: {
      semester: string;
      gpa: number;
      cpa: number;
      registeredCredits: number;
      debtCredits: number;
      warningLevel: number;
    }[];
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  semesters: string[];
  totalStudents: number;
}

export interface StatisticResponse {
  averageCPA: { averageCPA: number; semester: string }[];
  averageGPA: number;
  totalStudents: number;
  totalStudentIn: number;
  totalStudentOut: number;
  studentGraduationOnTimeRate: number;
  studentUngraduationRate: number;
  studentGraduationLateRate: number;
  studentInWarningRate: number;
  studentGraduationNumber: number | null;
  studentUngraduationNumber: number;
  studentGraduationLateNumber: number;
  studentInWarningNumber: number;
  studentWarningOneRate: number;
  studentWarningTwoRate: number;
  studentWarningThreeRate: number;
  studentExcellentRate: number;
  studentVeryGoodRate: number;
  studentGoodRate: number;
  studentMediumRate: number;
  studentBadRate: number;
}

const getAuthHeaders = () => {
  const token = authService.getToken();
  console.log(token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getStatistic = async (params: GetStatisticInfoDto) => {
  try {
    const response = await axios.get(`${API_URL}/data/statistic`, { 
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getSemesters = async () => {
  try {
    const response = await axios.get(`${API_URL}/data/semester`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/data/department`, {
      headers: getAuthHeaders()
    });
    console.log("response", response);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getMajors = async () => {
  try {
    const response = await axios.get(`${API_URL}/data/major`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}/data/class`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getStudentInfo = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/data/student/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getStudentCourseBySemester = async (semesterId: string, studentId: string) => {
  try {
    const response = await axios.get(`${API_URL}/data/student-course`, {
      params: { semesterId, studentId },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getListUploadEvent = async (params: { offset?: number; limit?: number } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/data/upload-event`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getCPATrajectory = async (params: GetCPATrajectoryDto): Promise<CPATrajectoryResponse> => {
  try {
    const response = await axios.post(`${API_URL}/data/cpa-trajectory`, params, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const getStudentsBySemesterRange = async (params: GetStudentsBySemesterRangeDto): Promise<StudentsBySemesterRangeResponse> => {
  try {
    const response = await axios.get(`${API_URL}/data/students-by-semester-range`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const generateStudentPDFReport = async (studentId: string) => {
  try {
    const response = await axios.get(`${API_URL}/data/generate-student-pdf-report/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
}; 