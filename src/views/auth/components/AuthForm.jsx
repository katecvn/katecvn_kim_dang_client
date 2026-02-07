import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/custom/PasswordInput'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAuthUserRolePermissions,
  login,
  redirectToGoogle,
  callbackGoogle,
} from '@/stores/AuthSlice'
import { useEffect } from 'react'
import { loginSchema } from '../schema'
import { IconBrandGoogle } from '@tabler/icons-react'
import { toast } from 'sonner'

const AuthForm = ({ className, ...props }) => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.auth.loading)
  const [searchParams] = useSearchParams()

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap()
      await dispatch(getAuthUserRolePermissions()).unwrap()
      navigate('/dashboard')
    } catch (error) {
      form.reset()
      console.log('Submit error: ', error)
    }
  }

  useEffect(() => {
    document.title = 'Đăng nhập'
  }, [])

  // Handle Google OAuth callback with code/state
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && state) {
      const handleGoogleCallback = async () => {
        try {
          await dispatch(callbackGoogle({ code, state })).unwrap()
          await dispatch(getAuthUserRolePermissions()).unwrap()
          navigate('/dashboard')
        } catch (error) {
          console.log('Google callback error: ', error)
        }
      }

      handleGoogleCallback()
    }
  }, [searchParams, dispatch, navigate])

  // Handle Google OAuth callback with accessToken (direct token)
  useEffect(() => {
    const accessToken = searchParams.get('accessToken')

    if (accessToken) {
      const handleDirectTokenCallback = async () => {
        try {
          // Save token to localStorage
          localStorage.setItem('accessToken', accessToken)

          // Fetch user permissions
          await dispatch(getAuthUserRolePermissions()).unwrap()

          // Show success message
          toast.success('Đăng nhập thành công')

          // Navigate to dashboard
          navigate('/dashboard')
        } catch (error) {
          console.log('Direct token callback error: ', error)
          // Clear invalid token
          localStorage.removeItem('accessToken')
        }
      }

      handleDirectTokenCallback()
    }
  }, [searchParams, dispatch, navigate])

  const handleRedirectToGoogle = async () => {
    try {
      await dispatch(redirectToGoogle()).unwrap()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-2 space-y-1">
                  <FormLabel>Tài khoản</FormLabel>
                  <FormControl>
                    <Input
                      tabIndex={1}
                      autoFocus
                      autoComplete="off"
                      placeholder="Nhập tài khoản"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-2 space-y-1">
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput
                      tabIndex={2}
                      autoComplete="new-password"
                      placeholder="Nhập mật khẩu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-2" loading={loading}>
              Đăng nhập
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                loading={loading}
                onClick={handleRedirectToGoogle}
                leftSection={<IconBrandGoogle className="h-4 w-4" />}
              >
                Google
              </Button>
            </div>

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
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:opacity-75"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AuthForm
