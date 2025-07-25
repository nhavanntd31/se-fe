import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, User, FileText, BarChart4, ChevronDown, Upload, Bell, TrendingUp, ClipboardList, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import Logo from "@/public/assets/images/logo2.png"
import { UserProfile } from "@/components/auth/user-profile"
import { NotificationPanel } from "./notification-panel"
import { getNotifications } from "@/services/notification.service"
import { Badge } from "@/components/ui/badge"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  showOnlyPLOCLO?: boolean;
}

export function Sidebar({ className, showOnlyPLOCLO = false }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setIsExpanded(pathname.startsWith('/department') || pathname.startsWith('/major') || pathname.startsWith('/class'))
  }, [pathname])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getNotifications({ offset: 1, limit: 1 })
        setUnreadCount(response.meta.totalUnread)
      } catch (error) {
        console.error('Failed to fetch notification count:', error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (path: string) => pathname.startsWith(path)



  return (
    
    <div className={cn("pb-12 border-r min-h-screen w-64 flex flex-col", className)}>
    
      <div className="space-y-4 py-4 flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-2 flex items-center"
        >
          <Image src={Logo}  alt="Logo" className="mr-2" />
          {/* <h2 className="text-xl font-bold tracking-tight">SCEE</h2> */}
        </motion.div>
        <div className="mt-auto">
          <UserProfile />
        </div>

        {!showOnlyPLOCLO && <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
            Trường SEEE
          </h2>
          <div className="space-y-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant={isExpanded ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <LayoutDashboard className="h-4 w-4" />
                <Link href="/">
                  Dashboard
                </Link>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-auto"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>
              
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href="/department">
                    <Button variant={isActive('/department') ? "secondary" : "ghost"} className="w-full justify-start pl-8">
                      Khoa
                    </Button>
                  </Link>
                  <Link href="/major">
                    <Button variant={isActive('/major') ? "secondary" : "ghost"} className="w-full justify-start pl-8">
                      Ngành
                    </Button>
                  </Link>
                  <Link href="/class">
                    <Button variant={isActive('/class') ? "secondary" : "ghost"} className="w-full justify-start pl-8">
                      Lớp
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/trajectory">
                <Button variant={isActive('/trajectory') ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  CPA Trajectory
                </Button>
              </Link>
            </motion.div>
   
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/student">
              <Button variant={isActive('/student-info') ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                Thông tin sinh viên
              </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant={showNotifications ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-4 w-4" />
                Thông báo
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-white bg-blue-500 text-xs px-1.5 py-0.5 h-5 min-w-5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </motion.div>
          </div>
        </div>}

        {!showOnlyPLOCLO && <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
            TOOLS
          </h2>
          <div className="space-y-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/upload">
                <Button variant={isActive('/upload') ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </Button>
              </Link>
            </motion.div>
  
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/prediction">
                <Button variant={isActive('/prediction') ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Thử mô hình
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>}

        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
            PLO/CLO
          </h2>
          <div className="space-y-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/plo">
                <Button variant={isActive('/plo') ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <ClipboardList className="h-4 w-4" />
                  PLO Analysis
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/clo">
                <Button variant={isActive('/clo') ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <CheckCircle className="h-4 w-4" />
                  CLO Management
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false)
          const fetchUnreadCount = async () => {
            try {
              const response = await getNotifications({ offset: 1, limit: 1 })
              setUnreadCount(response.meta.totalUnread)
            } catch (error) {
              console.error('Failed to fetch notification count:', error)
            }
          }
          fetchUnreadCount()
        }}
      />
    </div>
  )
}
