import { Link, useLocation } from 'react-router-dom'
import { Home, Package, ShoppingCart, Receipt, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const MobileNavigation = ({ onCategoryClick }) => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  // Poll for cart count changes
  useEffect(() => {
    const interval = setInterval(() => {
      const count = window.__invoiceDialog?.selectedProductsCount || 0
      setCartCount(count)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    {
      label: 'Danh mục',
      icon: Home,
      path: '/category',
      isCenter: false,
      isToggleSidebar: true
    },
    {
      label: 'Đơn hàng',
      icon: Package,
      path: '/invoice',
      isCenter: false
    },
    {
      label: 'Giỏ hàng',
      icon: ShoppingCart,
      path: '/invoice',
      isCenter: true
    },
    {
      label: 'Đơn mua',
      icon: Receipt,
      path: '/purchase-order',
      isCenter: false
    },
    {
      label: 'Báo cáo',
      icon: TrendingUp,
      path: '/revenue',
      isCenter: false
    }
  ]

  // Update activeNav when location changes
  useEffect(() => {
    const currentItem = navItems.find(item => !item.isToggleSidebar && location.pathname.startsWith(item.path))
    if (currentItem) {
      setActiveNav(currentItem.path)
      setIsSidebarOpen(false) // Close sidebar when navigating to other pages
    }
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/category') {
      return isSidebarOpen
    }
    return activeNav === path
  }

  const handleCategoryClick = () => {
    setIsSidebarOpen(!isSidebarOpen)
    setActiveNav(null) // Clear other active items
    onCategoryClick?.()
  }

  const handleNavClick = (path) => {
    setActiveNav(path)
    setIsSidebarOpen(false) // Close sidebar when navigating
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-xl border-t border-border/50" />

      <div className="relative flex h-16 items-center justify-around px-4 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <div key={item.path} className="flex-1 flex justify-center">
              {item.isCenter ? (
                // Center floating action button with badge
                <button
                  onClick={() => {
                    // If invoice dialog is open, switch to cart view
                    if (window.__invoiceDialog) {
                      window.__invoiceDialog.setMobileView('cart')
                    } else {
                      // Otherwise navigate normally
                      handleNavClick(item.path)
                      window.location.href = item.path
                    }
                  }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2"
                >
                  <div className="relative">
                    {/* Cart Badge */}
                    {cartCount > 0 && (
                      <div className="absolute -top-1 -right-1 z-10 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full border-2 border-background">
                        {cartCount}
                      </div>
                    )}

                    {/* Glow effect */}
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-xl transition-all duration-300",
                      active ? "bg-primary/50 scale-110" : "bg-primary/30 scale-100"
                    )} />

                    {/* Main button */}
                    <div className={cn(
                      "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg",
                      active
                        ? "bg-gradient-to-br from-primary to-primary/90 scale-110"
                        : "bg-gradient-to-br from-primary/90 to-primary/70 hover:scale-105"
                    )}>
                      <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                    </div>

                    {/* Label below */}
                    <span className={cn(
                      "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap transition-colors duration-200",
                      active ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                </button>
              ) : item.isToggleSidebar ? (
                // Category button - toggle sidebar
                <button
                  onClick={handleCategoryClick}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-2 min-w-[60px] relative"
                >
                  {/* Icon container */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary scale-105"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-[9px] font-medium transition-colors duration-200 leading-tight",
                    active ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </button>
              ) : (
                // Regular navigation items
                <Link
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-2 min-w-[60px] relative"
                >
                  {/* Icon container */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary scale-105"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-[9px] font-medium transition-colors duration-200 leading-tight",
                    active ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Safe area for iOS */}
      <div className="h-safe bg-background/95 backdrop-blur-xl" />
    </nav>
  )
}

export default MobileNavigation