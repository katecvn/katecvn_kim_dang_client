import AuthForm from '@/views/auth/components/AuthForm'
import { Card } from '@/components/ui/card'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const isAuthenticated = !!localStorage.getItem('accessToken')
  const navigate = useNavigate()

  const checkAuthenticated = () => {
    if (isAuthenticated) {
      return navigate('/dashboard')
    }
  }

  useEffect(() => {
    checkAuthenticated()
  }, [])

  return (
    <>
      <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
          <Card className="p-6">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight">
                Đăng nhập
              </h1>
              <p className="text-sm text-muted-foreground">
                Nhập tài khoản và mật khẩu vào bên dưới <br />
                để tiếp tục truy cập hệ thống
              </p>
            </div>
            <AuthForm />
            <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
              <span>Liên hệ hotline: </span>
              <a
                href="callto:0889881010"
                className="underline underline-offset-4 hover:text-primary"
              >
                0889881010
              </a>
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}

export default LoginPage
