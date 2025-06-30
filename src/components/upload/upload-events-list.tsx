"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Check, X, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { getListUploadEvent } from '@/services/statistic.service'
import { Label } from '@radix-ui/react-dropdown-menu'

interface UploadEvent {
  id: string
  createdAt: string
  isImportSuccess: boolean
  importStartedAt: string | null
  importCompletedAt: string | null
  importFailedMessage: string | null
  isStatisticSuccess: boolean
  statisticStartedAt: string | null
  statisticCompletedAt: string | null
  statisticFailedMessage: string | null
  isPredictSuccess: boolean
  predictStartedAt: string | null
  predictCompletedAt: string | null
  predictFailedMessage: string | null
}

interface UploadEventsListProps {
  refreshTrigger: number
}

export function UploadEventsList({ refreshTrigger }: UploadEventsListProps) {
  const [events, setEvents] = useState<UploadEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [refreshTrigger])

  const fetchEvents = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getListUploadEvent({ limit: 20 })
      setEvents(response.data || [])
    } catch (err: any) {
      setError('Không thể tải danh sách upload events')
      console.error('Error fetching upload events:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusIcon = (isSuccess: boolean | null, isCompleted: boolean, failedMessage: string | null) => {
    if (failedMessage) {
      return <X className="h-4 w-4 text-red-500" />
    }
    if (isCompleted && isSuccess) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (isCompleted && !isSuccess) {
      return <X className="h-4 w-4 text-red-500" />
    }
    return <Clock className="h-4 w-4 text-yellow-500" />
  }

  const getDateRange = (startDate: string | null, endDate: string | null) => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    if (startDate) {
      return `Bắt đầu: ${formatDate(startDate)}`
    }
    return 'Chưa bắt đầu'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">{error}</div>
    )
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có upload event nào
        </div>
      ) : (
        events.map((event, index) => {
          const isExpanded = expandedEvents.has(event.id)
          const importCompleted = !!(event.importCompletedAt || event.importFailedMessage)
          const statisticCompleted = !!(event.statisticCompletedAt || event.statisticFailedMessage)
          const predictCompleted = !!(event.predictCompletedAt || event.predictFailedMessage)

          return (
            <div key={event.id} className="border rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpanded(event.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center">
                      <Label className="text-sm text-gray-600">
                        {index + 1}
                      </Label>
                    </div>
                    <span className="font-medium">
                      Upload <span className="text-blue-600">{event.id.slice(0, 8)}...</span> at {formatDate(event.createdAt)}
                    </span>
                  </div>
                </div> 
                <div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pl-6 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.isImportSuccess, importCompleted, event.importFailedMessage)}
                      <div className="flex-1">
                        <div className="font-medium">Import data to database</div>
                        <div className="text-sm text-gray-600">
                          {getDateRange(event.importStartedAt, event.importCompletedAt)}
                        </div>
                        {event.importFailedMessage && (
                          <div className="text-sm text-red-500 mt-1">
                            Lỗi: {event.importFailedMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.isStatisticSuccess, statisticCompleted, event.statisticFailedMessage)}
                      <div className="flex-1">
                        <div className="font-medium">Statistic data</div>
                        <div className="text-sm text-gray-600">
                          {getDateRange(event.statisticStartedAt, event.statisticCompletedAt)}
                        </div>
                        {event.statisticFailedMessage && (
                          <div className="text-sm text-red-500 mt-1">
                            Lỗi: {event.statisticFailedMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.isPredictSuccess, predictCompleted, event.predictFailedMessage)}
                      <div className="flex-1">
                        <div className="font-medium">Predict data</div>
                        <div className="text-sm text-gray-600">
                          {getDateRange(event.predictStartedAt, event.predictCompletedAt)}
                        </div>
                        {event.predictFailedMessage && (
                          <div className="text-sm text-red-500 mt-1">
                            Lỗi: {event.predictFailedMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })
      )}
    </div>
  )
} 