import { API_CONFIG } from '@/config/api'
import { authService } from './auth.service'

const API_URL = API_CONFIG.basePythonUrl

const getAuthHeaders = () => {
  const token = authService.getToken()
  return {
    'Authorization': `Bearer ${token}`
  }
}

export interface StudentPredictionResponse {
  total_students: number
  successful_predictions: number
  failed_predictions: number
  predictions: Array<{
    student_id: number
    total_semesters: number
    predicted_next_gpa: number
    predicted_next_cpa: number
    predicted_next_gpa_normalized: number
    predicted_next_cpa_normalized: number
  }>
}

export const predictStudents = async (formData: FormData): Promise<StudentPredictionResponse> => {
  try {
    const response = await fetch(`${API_URL}/predict-students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout()
    }
    throw error
  }
} 