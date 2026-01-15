import { Layout, LayoutBody } from '@/components/custom/Layout'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getSetting, setSharingRatios } from '@/stores/SettingSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { setSharingRatioSchema } from '../schema'
import {
  IconArrowLeft,
  IconClock,
  IconDeviceFloppy,
  IconUser,
} from '@tabler/icons-react'
import { Button } from '@/components/custom/Button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { dateFormat } from '@/utils/date-format'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'

const SharingRatioPage = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    document.title = 'Tỉ lệ hưởng doanh số'
    dispatch(getSetting('sharing_ratio'))
  }, [dispatch])

  const sharingRatios = useSelector((state) => state.setting.setting)
  const loading = useSelector((state) => state.setting.loading)
  const payload = sharingRatios?.payload

  const form = useForm({
    resolver: zodResolver(setSharingRatioSchema),
    defaultValues: {
      sharingRatios: payload,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sharingRatios',
  })

  useEffect(() => {
    if (payload) {
      form.reset({
        sharingRatios: payload,
      })
    }
  }, [payload, form])

  const onSubmit = async (data) => {
    try {
      await dispatch(setSharingRatios(data)).unwrap()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  const navigate = useNavigate()

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Thiết lập tỉ lệ hưởng doanh số
          </h2>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <Form {...form}>
            <form id="set-sharing-ratio" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="my-3 grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                {loading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Skeleton className="h-[20px] w-full rounded-md" />
                      </div>
                    ))
                  : fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name={`sharingRatios.${index}.main`}
                          render={({ field }) => (
                            <FormItem className="mb-3 h-16 w-1/2 space-y-1">
                              <FormLabel required={true}>
                                Người hưởng chính
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  autoFocus
                                  placeholder="Nhập tỉ lệ người hưởng chính"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`sharingRatios.${index}.sub`}
                          render={({ field }) => (
                            <FormItem className="mb-3 h-16 w-1/2 space-y-1">
                              <FormLabel required={true}>
                                Người được chia
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Nhập tỉ lệ người được chia"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="mt-4 inline-block cursor-pointer">
                          <TrashIcon
                            className="h-4 w-4 text-destructive"
                            onClick={() => remove(index)}
                          />
                        </div>
                      </div>
                    ))}

                <div className="flex justify-end md:col-span-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ main: '', sub: '' })}
                    className="w-50 mx-4"
                  >
                    <PlusIcon className="h-4 w-4 flex-shrink-0" /> Thêm tỉ lệ
                  </Button>
                </div>

                <div className="col-span-full">
                  <Alert className="border-blue-500 text-primary">
                    <AlertTitle className="text-md font-bold">
                      Thông tin về cài đặt
                    </AlertTitle>
                    <AlertDescription>
                      <ul className="list-inside list-disc">
                        <li className="flex items-center space-x-2">
                          <IconUser className="h-4 w-4" />
                          <span>
                            Người cập nhật sau cùng:{' '}
                            <strong>{sharingRatios?.updater?.fullName}</strong>
                          </span>
                        </li>

                        <li className="flex items-center space-x-2">
                          <IconClock className="h-4 w-4" />
                          <span>
                            Lần cập nhật mới nhất:{' '}
                            <strong>
                              {dateFormat(sharingRatios?.updatedAt, true)}
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
                    form="set-sharing-ratio"
                    className="w-32"
                    loading={loading}
                  >
                    {!loading && <IconDeviceFloppy className="mr-2 h-4 w-4" />}
                    Lưu lại
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

export default SharingRatioPage
