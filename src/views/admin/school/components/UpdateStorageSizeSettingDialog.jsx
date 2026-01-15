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
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/utils/axios.jsx'
import { useEffect, useState } from 'react'
import convertSizeToBytes from '@/utils/convert-size-to-bytes'
import StorageFieldGroup from './StorageFieldGroup'
import { updateStorageSizeSettingSchema } from '../schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateStorageSizeSetting } from '@/stores/SchoolSlice'

const UpdateStorageSizeSettingDialog = ({
  school,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.school.loading)
  const dispatch = useDispatch()
  const [usedInternalSize, setUsedInternalSize] = useState({})
  const [usedImageSize, setUsedImageSize] = useState({})
  const [usedLessonPlanSize, setUsedLessonPlan] = useState({})
  const [allowedSize, setAllowedSize] = useState({})

  const form = useForm({
    resolver: zodResolver(updateStorageSizeSettingSchema),
    defaultValues: {
      internal: { sizeType: 'MB', sizeValue: '100' },
      lessonPlan: { sizeType: 'MB', sizeValue: '100' },
      image: { sizeType: 'MB', sizeValue: '100' },
    },
  })

  // Lấy cấu hình allowed storage size
  const handleGetStorageSizeSetting = async () => {
    try {
      const res = await api.get(
        `/setting/${school.id}/allowed-storage-size-settings`,
      )
      return res.data
    } catch (error) {
      console.log('Get storage size setting error:', error)
      return
    }
  }

  // Lấy dung lượng đã dùng Kcloud, Kafood cloud
  const handleGetUsedStorageSize = async () => {
    try {
      const res = await api.get('/setting/get-used-storage-size', {
        params: { project: 'kafood', schoolId: school.id },
      })
      return res.data
    } catch (error) {
      console.log('Get used storage size error:', error)
      return
    }
  }

  const handleGetUsedGCStorageSize = async () => {
    try {
      const res = await api.get('/setting/get-gcs-used-storage-size', {
        params: { schoolId: school.id },
      })
      return res.data
    } catch (error) {
      console.log('Get used storage size error:', error)
      return
    }
  }

  const handleGetUsedDriveStorageSize = async () => {
    try {
      const res = await api.get('/setting/get-drive-used-storage-size', {
        params: { schoolId: school.id },
      })
      return res.data
    } catch (error) {
      console.log('Get used storage size error:', error)
      return
    }
  }

  const parseSizeLabel = (sizeLabel) => {
    if (!sizeLabel) return { sizeType: '', sizeValue: '' }
    const [value, type] = sizeLabel.split(' ')
    return {
      sizeType: type || '',
      sizeValue: Number(value).toString() || '',
    }
  }

  const getUsedSizeAndPublishSize = async () => {
    const publishSizeResponse = await handleGetStorageSizeSetting()
    const usedSizeResponse = await handleGetUsedStorageSize()
    const usedGCSSizeResponse = await handleGetUsedGCStorageSize()
    const usedDriveSizeResponse = await handleGetUsedDriveStorageSize()

    if (publishSizeResponse?.data) {
      form.reset({
        internal: {
          ...parseSizeLabel(publishSizeResponse.data?.internal?.sizeLabel),
        },
        lessonPlan: {
          ...parseSizeLabel(publishSizeResponse.data?.lessonPlan?.sizeLabel),
        },
        image: {
          ...parseSizeLabel(publishSizeResponse.data?.image?.sizeLabel),
        },
      })
      setAllowedSize(publishSizeResponse?.data)
    }

    if (usedSizeResponse?.data) {
      setUsedInternalSize(usedSizeResponse?.data)
    }

    if (usedGCSSizeResponse?.data) {
      setUsedImageSize(usedGCSSizeResponse?.data)
    }

    if (usedDriveSizeResponse?.data) {
      setUsedLessonPlan(usedDriveSizeResponse?.data)
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        schoolId: school.id,
        internal: convertSizeToBytes(
          data.internal.sizeType,
          data.internal.sizeValue,
          'nearest',
        ),
        lessonPlan: convertSizeToBytes(
          data.lessonPlan.sizeType,
          data.lessonPlan.sizeValue,
          'nearest',
        ),
        image: convertSizeToBytes(
          data.image.sizeType,
          data.image.sizeValue,
          'nearest',
        ),
      }
      await dispatch(updateStorageSizeSetting(payload)).unwrap()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  useEffect(() => {
    if (open) {
      getUsedSizeAndPublishSize()
    }
  }, [open, school])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Cập nhật
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cập nhật dung lượng sử dụng: {school.name}</DialogTitle>
          <DialogDescription>
            <div className="grid grid-cols-1 md:grid-cols-4">
              <strong>Cloud nội bộ:</strong>
              <span className="col-span-3">
                <span
                  className={`col-span-3 ${
                    allowedSize?.internal &&
                    usedInternalSize?.size &&
                    allowedSize.internal.size - usedInternalSize.size <=
                      10 * 1024 * 1024
                      ? 'text-red-500'
                      : ''
                  }`}
                >
                  {usedInternalSize.sizeLabel || '0 Bytes'}
                </span>
                /{allowedSize?.internal?.sizeLabel}
              </span>
              <strong>Cloud giáo án:</strong>
              <span className="col-span-3">
                <span
                  className={`col-span-3 ${
                    allowedSize?.lessonPlan &&
                    usedLessonPlanSize?.size &&
                    allowedSize?.lessonPlan?.size - usedLessonPlanSize?.size <=
                      10 * 1024 * 1024
                      ? 'text-red-500'
                      : ''
                  }`}
                >
                  {usedLessonPlanSize.sizeLabel || '0 Bytes'}
                </span>
                /{allowedSize?.lessonPlan?.sizeLabel}
              </span>
              <strong>Cloud ảnh:</strong>{' '}
              <span className="col-span-3">
                <span
                  className={`col-span-3 ${
                    allowedSize?.image &&
                    usedImageSize?.size &&
                    allowedSize?.image?.size - usedImageSize?.size <=
                      10 * 1024 * 1024
                      ? 'text-red-500'
                      : ''
                  }`}
                >
                  {usedImageSize?.sizeLabel || '0 Bytes'}
                </span>
                /{allowedSize?.image?.sizeLabel}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="update-storage-size-setting-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <StorageFieldGroup
                  control={form.control}
                  name="internal"
                  label="Cloud nội bộ"
                />
                <StorageFieldGroup
                  control={form.control}
                  name="lessonPlan"
                  label="Cloud giáo án"
                />
                <StorageFieldGroup
                  control={form.control}
                  name="image"
                  label="Cloud ảnh"
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="update-storage-size-setting-form" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateStorageSizeSettingDialog
