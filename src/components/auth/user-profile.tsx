"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authService, User } from '@/services/auth.service'
import { ChangePasswordDialog } from './change-password-dialog'
import { User as UserIcon, LogOut, Key, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userInfo = await authService.getUserInfo()
          setUser(userInfo)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [router])

  const handleLogout = () => {
    authService.logout()
  }

  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="rounded-full bg-gray-300 h-8 w-8"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-20"></div>
            <div className="h-2 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="px-4 py-3 border-t mt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="ghost" className="w-full justify-start gap-2 p-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <UserIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <ChangePasswordDialog>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Key className="mr-2 h-4 w-4" />
              <span>Đổi mật khẩu</span>
            </DropdownMenuItem>
          </ChangePasswordDialog>
          <DropdownMenuSeparator />
          <DropdownMenuItem>  
            
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
          
        </DropdownMenuContent>
        
      </DropdownMenu>
    </div>
  )
} 