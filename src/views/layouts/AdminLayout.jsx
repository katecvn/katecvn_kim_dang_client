import { Layout, LayoutBody, LayoutHeader } from '@/components/custom/Layout'
import { Outlet } from 'react-router-dom'
import ThemeSwitch from '@/components/ThemeSwitch'
import UserNav from '@/components/UserNav'
import Sidebar from '@/components/Sidebar'
import useIsCollapsed from '@/hooks/UseIsCollapsed'
import Notification from '@/components/custom/Notification'
import NotificationBell from '@/components/NotificationBell'

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed()

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <Notification />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-64'} h-full`}
      >
        <Layout>
          <LayoutHeader>
            <div className="ml-auto flex items-center space-x-4">
              <NotificationBell />
              <ThemeSwitch />
              <UserNav />
            </div>
          </LayoutHeader>

          <LayoutBody>
            <Outlet />
          </LayoutBody>
        </Layout>
      </main>
    </div>
  )
}

export default AdminLayout
