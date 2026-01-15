import { Button } from '@/components/custom/Button'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowLeft,
  IconClock,
  IconKey,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updateSInvoiceSettingSchema } from '../schema'
import { getSetting, updateSInvoiceSetting } from '@/stores/SettingSlice'
import { dateFormat } from '@/utils/date-format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'

const SInvoiceSettingPage = () => {
  const loading = useSelector((state) => state.setting.loading)
  const setting = useSelector((state) => state.setting.setting)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Cài đặt Hóa đơn điện tử (SInvoice)'
    dispatch(getSetting('s_invoice'))
  }, [dispatch])

  const form = useForm({
    resolver: zodResolver(updateSInvoiceSettingSchema),
    defaultValues: {
      generalSetting: {
        username: setting?.payload?.username || '',
        password: setting?.payload?.password || '',
        templateCode: setting?.payload?.templateCode || '',
        invoiceSeries: setting?.payload?.invoiceSeries || '',
        invoiceType: setting?.payload?.invoiceType || '',
        currencyCode: setting?.payload?.currencyCode || 'VND',
      },
    },
  })

  // Khi setting từ API về thì reset form
  useEffect(() => {
    if (setting?.payload) {
      form.reset({
        generalSetting: {
          username: setting?.payload?.username || '',
          password: setting?.payload?.password || '',
          templateCode: setting?.payload?.templateCode || '',
          invoiceSeries: setting?.payload?.invoiceSeries || '',
          invoiceType: setting?.payload?.invoiceType || '',
          currencyCode: setting?.payload?.currencyCode || 'VND',
        },
      })
    }
  }, [setting, form])

  const onSubmit = async (data) => {
    try {
      // data đúng format:
      // {
      //   generalSetting: {
      //     username, password, templateCode, invoiceSeries, invoiceType, currencyCode
      //   }
      // }
      await dispatch(updateSInvoiceSetting(data)).unwrap()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Cài đặt Hóa đơn điện tử (SInvoice)
          </h2>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <Form {...form}>
            <form
              id="update-sinvoice-setting"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="my-3 grid gap-4 rounded-lg border p-4 md:grid-cols-3">
                {loading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-[20px] w-full rounded-md" />
                    </div>
                  ))
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="generalSetting.username"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>
                            Tài khoản SInvoice (username)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập tài khoản đăng nhập SInvoice"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.password"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>Mật khẩu</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <IconKey className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu SInvoice"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.templateCode"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>
                            Mẫu số (templateCode)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="VD: 01BLP2/121" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.invoiceSeries"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>
                            Ký hiệu hóa đơn (invoiceSeries)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="VD: AB/23E" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.invoiceType"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>
                            Loại hóa đơn (invoiceType)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="VD: 01BLP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalSetting.currencyCode"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required={true}>
                            Đơn vị tiền tệ (currencyCode)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="VD: VND, USD..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Thông tin meta giống trang GeneralSetting */}
                <div className="col-span-full">
                  <Alert className="border-blue-500 text-primary">
                    <AlertTitle className="text-md font-bold">
                      Thông tin về cài đặt SInvoice
                    </AlertTitle>
                    <AlertDescription>
                      <ul className="list-inside list-disc">
                        <li className="flex items-center space-x-2">
                          <IconUser className="h-4 w-4" />
                          <span>
                            Người cập nhật sau cùng:{' '}
                            <strong>
                              {setting?.updater?.fullName || 'Không có'}
                            </strong>
                          </span>
                        </li>

                        <li className="flex items-center space-x-2">
                          <IconClock className="h-4 w-4" />
                          <span>
                            Lần cập nhật mới nhất:{' '}
                            <strong>
                              {setting?.updatedAt
                                ? dateFormat(setting?.updatedAt, true)
                                : 'Không có'}
                            </strong>
                          </span>
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex justify-end md:col-span-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2 w-32"
                    onClick={() => navigate(-1)}
                  >
                    <IconArrowLeft className="h-4 w-4" /> Quay lại
                  </Button>

                  <Button
                    type="submit"
                    className="w-32"
                    form="update-sinvoice-setting"
                    loading={loading}
                  >
                    {!loading && <IconRefresh className="mr-2 h-4 w-4" />} Cập
                    nhật
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default SInvoiceSettingPage
