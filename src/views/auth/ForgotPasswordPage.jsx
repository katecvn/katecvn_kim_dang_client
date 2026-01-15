import { Button } from '@/components/custom/Button'
import { Card } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { forgotPasswordSchema } from './schema'
import { IconArrowLeft } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import api from '@/utils/axios'

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/forgot-password', {
        email: data.email,
      })

      toast.success(
        'Đã gửi mã OTP khôi phục mật khẩu. Vui lòng kiểm tra email của bạn.',
      )

      form.reset()
      return navigate('/reset-password')
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Khôi phục mật khẩu'
  }, [])

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
    <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <Card className="p-6">
          <div className="flex flex-col space-y-2 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Khôi phục mật khẩu
            </h1>
            <p className="text-sm text-muted-foreground">
              Điền địa chỉ email vào bên dưới để có thể khôi phục mật khẩu
            </p>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoFocus
                          autoComplete="off"
                          placeholder="Nhập địa chỉ email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button disabled={loading} className="mt-2">
                  Gửi yêu cầu khôi phục mật khẩu
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-sm text-muted-foreground">
                      Hoặc
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm font-medium text-primary hover:opacity-75"
                  >
                    <p className="flex items-center justify-center">
                      <IconArrowLeft className="mx-2 h-4 w-4" /> Quay lại trang
                      đăng nhập
                    </p>
                  </Link>
                </div>
              </div>
            </form>
          </FormProvider>

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
  )
}

export default ForgotPasswordPage
