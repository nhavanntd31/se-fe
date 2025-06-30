"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/services/auth.service'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const authCheck = () => {
      const publicPaths = ['/login']
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
      
      if (!authService.isAuthenticated() && !isPublicPath) {
        setAuthorized(false)
        router.push('/login')
      } else {
        setAuthorized(true)
      }
    }

    authCheck()
  }, [pathname, router])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
} 