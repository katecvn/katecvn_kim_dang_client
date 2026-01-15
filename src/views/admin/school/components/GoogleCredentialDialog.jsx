import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import api from '@/utils/axios.jsx'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateGoogleCredentialSchema } from '../schema'
import InputCredentialField from './InputCredentialField'

const GoogleCredentialDialog = ({
  school,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const [loading, setLoading] = useState(false)
  const form = useForm({
    resolver: zodResolver(updateGoogleCredentialSchema),
    defaultValues: {
      client_id: '',
      client_secret: '',
      project_id: '',
      auth_uri: '',
      token_uri: '',
      redirect_uris: '',
      driveFolderId: '',
    },
    mode: 'onChange',
  })

  const handleGetGoogleDriveCredential = async () => {
    try {
      const res = await api.get('/google-drive', {
        params: { schoolId: school.id },
      })
      return res.data
    } catch (error) {
      console.log('Get google drive credential error:', error)
      return
    }
  }

  const handleGetAndSetGoogleDriveCredential = async () => {
    const data = await handleGetGoogleDriveCredential()
    if (data?.data?.credentials?.web) {
      const web = data.data.credentials.web
      form.reset({
        client_id: web.client_id || '',
        client_secret: web.client_secret || '',
        project_id: web.project_id || '',
        auth_uri: web.auth_uri || '',
        token_uri: web.token_uri || '',
        redirect_uris: web.redirect_uris?.join(', ') || '',
        driveFolderId: data.data.driveFolderId || '',
      })
    }
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const payload = {
        schoolId: school.id,
        credentials: {
          web: {
            client_id: values.client_id,
            client_secret: values.client_secret,
            project_id: values.project_id,
            auth_uri: values.auth_uri,
            token_uri: values.token_uri,
            redirect_uris: values.redirect_uris.split(',').map((s) => s.trim()),
          },
        },
        driveFolderId: values.driveFolderId,
      }

      await api.post('/google-drive', payload)
      toast.success('Cập nhật thành công')
      onOpenChange(false)
    } catch (error) {
      console.log('Update credential error:', error)
      toast.error('Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && school?.id) {
      handleGetAndSetGoogleDriveCredential()
    }
  }, [open, school])

  const handleAuthenticateGoogleCredential = async () => {
    try {
      const res = await api.get('/google-drive/auth/redirect', {
        params: { schoolId: school.id },
      })

      const redirectUrl = res.data?.data
      if (redirectUrl) {
        // Ghi schoolId để callback dùng
        localStorage.setItem('currentSchoolId', school.id)

        // Xóa flag cũ nếu có
        localStorage.removeItem('googleAuthDone')

        // Mở popup (kích thước nhỏ)
        const popup = window.open(
          redirectUrl,
          'GoogleAuthPopup',
          'width=500,height=600',
        )

        // Theo dõi flag từ localStorage (bị thay đổi ở popup)
        const timer = setInterval(() => {
          const done = localStorage.getItem('googleAuthDone')
          if (done === 'true') {
            clearInterval(timer)
            localStorage.removeItem('googleAuthDone')
            popup?.close()
            toast.success('Xác thực thành công')
            window.location.reload()
          }
        }, 1000)
      } else {
        console.error('Không có URL xác thực')
      }
    } catch (error) {
      console.log('Get google drive credential error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Cập nhật thông tin
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Quản lý thông tin xác thực Cloud giáo án – {school.name}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin xác thực để kết nối Cloud giáo án cho trường.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="update-google-credential"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <InputCredentialField
                control={form.control}
                name="client_id"
                label="Client ID"
              />
              <InputCredentialField
                control={form.control}
                name="client_secret"
                label="Client Secret"
              />
              <InputCredentialField
                control={form.control}
                name="project_id"
                label="Project ID"
              />
              <InputCredentialField
                control={form.control}
                name="auth_uri"
                label="Auth URI"
              />
              <InputCredentialField
                control={form.control}
                name="token_uri"
                label="Token URI"
              />
              <InputCredentialField
                control={form.control}
                name="redirect_uris"
                label="Redirect URIs (cách nhau bằng ,)"
              />
              <InputCredentialField
                control={form.control}
                name="driveFolderId"
                label="Drive Folder ID"
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleAuthenticateGoogleCredential}
            disabled={!form.formState.isValid}
          >
            Xác thực
          </Button>
          <Button
            form="update-google-credential"
            loading={loading}
            disabled={!form.formState.isValid}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GoogleCredentialDialog
