import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useEffect } from 'react'

const NotificationPage = () => {
  useEffect(() => {
    document.title = 'Thiết lập thông báo'
  }, [])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Thiết lập thông báo
          </h2>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <Alert className="border border-yellow-500 text-yellow-500">
            <AlertDescription>Tính năng đang được phát triển</AlertDescription>
          </Alert>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default NotificationPage
