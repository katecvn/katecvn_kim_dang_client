import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '@/utils/axios'
import { toast } from 'sonner'

const GoogleDriveCallback = () => {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const schoolId = localStorage.getItem('currentSchoolId')

    if (!code || !schoolId) {
      console.error('Thiếu mã xác thực hoặc schoolId')
      return
    }

    const completeAuth = async () => {
      try {
        await api.get('/google-drive/auth/callback', {
          params: { code, schoolId },
        })

        // Đánh dấu hoàn tất để trang cha biết
        localStorage.setItem('googleAuthDone', 'true')

        // Đóng popup sau 1-2s
        setTimeout(() => {
          window.close()
        }, 1000)
      } catch (error) {
        console.error('Xác thực thất bại', error)
      }
    }

    completeAuth()
  }, [])

  return (
    <div className="p-4 text-center">
      <p>Đang xác thực tài khoản Google...</p>
    </div>
  )
}

export default GoogleDriveCallback
