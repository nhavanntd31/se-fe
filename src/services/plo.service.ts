import { API_CONFIG } from '@/config/api'
import { authService } from './auth.service'

const API_URL = API_CONFIG.baseUrl

const getAuthHeaders = () => {
  const token = authService.getToken()
  return {
    'Authorization': `Bearer ${token}`
  }
}

export interface PLOAnalysisResponse {
  analyze: string
  bloom: string
  analyzeContentType: string
  bloomContentType: string
  analyzeContent?: string
  bloomTable?: any[]
}

export const analyzePLO = async (formData: FormData): Promise<PLOAnalysisResponse> => {
  try {
    const response = await fetch(`${API_URL}/data/analyze-plo`, {
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