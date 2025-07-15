import { API_CONFIG } from '@/config/api'
import { authService } from './auth.service'

const API_URL = API_CONFIG.baseUrl

const getAuthHeaders = () => {
  const token = authService.getToken()
  return {
    'Authorization': `Bearer ${token}`
  }
}

export interface CLOSuggestDto {
  prompt: string
}

export interface CLOCheckDto {
  prompt: string
}

export interface CLOSuggestResult {
  fileName: string
  markdown: string
  excel: string
  markdownContent: string
  cloList: any[]
  markdownContentType: string
  excelContentType: string
  error?: string
}

export interface CLOEvaluation {
  STT: string
  "Nội dung CLO": string
  "I/R/M": string
  "Nhận xét/Justification": string
}

export interface CLOCheckResult {
  syllabusFileName: string
  cloFileName: string
  markdown: string
  excel: string
  markdownContent: string
  evaluationTable: CLOEvaluation[]
  markdownContentType: string
  excelContentType: string
  error?: string
}

export const suggestCLO = async (formData: FormData): Promise<CLOSuggestResult> => {
  try {
    const response = await fetch(`${API_URL}/data/suggest-clo`, {
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

export const checkCLO = async (formData: FormData): Promise<CLOCheckResult> => {
  try {
    const response = await fetch(`${API_URL}/data/check-clo`, {
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