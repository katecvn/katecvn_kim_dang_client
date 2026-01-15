import { Button } from '@/components/custom/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, Phone } from 'lucide-react'
import { dateFormat } from '@/utils/date-format'
import { IconRosetteDiscountCheck, IconUser, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import moment from 'moment'
import {
  handleGetStorageSizeSetting,
  handleGetUsedDriveStorageSize,
  handleGetUsedGCStorageSize,
  handleGetUsedStorageSize,
} from '@/api/cloud_storage'

const ViewSchoolDialog = ({
  school,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const [showAllHistories, setShowAllHistories] = useState(false)
  const [showAllLicenses, setShowAllLicenses] = useState(false)
  const [usedInternalSize, setUsedInternalSize] = useState({})
  const [usedImageSize, setUsedImageSize] = useState({})
  const [usedLessonPlanSize, setUsedLessonPlan] = useState({})
  const [allowedSize, setAllowedSize] = useState({
    internal: {},
    lessonPlan: {},
    image: {},
  })
  const users = school?.users || []
  const lastUser = users.length && users.at(-1)

  const displayHistories = showAllHistories
    ? school.histories
    : school.histories.slice(0, 5)

  const displayLicenses = showAllLicenses
    ? school.licenses
    : school.licenses.slice(0, 5)

  const handleGetAndSetStorageSizeSetting = async (school_id) => {
    const res = await handleGetStorageSizeSetting(school_id)
    setAllowedSize(res?.data)
  }

  const handleGetAndSetUsedStorageSize = async (school_id) => {
    const res = await handleGetUsedStorageSize(school_id)
    setUsedInternalSize(res?.data)
  }

  const handleGetAndSetUsedGCStorageSize = async (school_id) => {
    const res = await handleGetUsedGCStorageSize(school_id)
    setUsedImageSize(res?.data)
  }

  const handleGetAndSetDriveStorageSize = async (school_id) => {
    const res = await handleGetUsedDriveStorageSize(school_id)
    setUsedLessonPlan(res?.data)
  }

  useEffect(() => {
    handleGetAndSetStorageSizeSetting(school?.id)
    handleGetAndSetUsedStorageSize(school?.id)
    handleGetAndSetUsedGCStorageSize(school?.id)
    handleGetAndSetDriveStorageSize(school?.id)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Xem chi tiết
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết trường: {school.name}</DialogTitle>
          <DialogDescription>
            Dưới đây là thông tin chi tiết trường học: {school.name}. Bao gồm
            các thông tin cơ bản, người chịu trách nhiệm, lịch sử hoạt động của
            trường...
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="container mx-auto space-y-4 p-4 lg:grid lg:grid-cols-[350px_1fr] lg:gap-4 lg:space-y-0">
            <Card className="space-y-6 rounded-lg p-6 shadow-none">
              <div className="space-y-4">
                <div className="aspect-square h-32 w-32 overflow-hidden rounded-lg">
                  <Avatar className="mr-2 h-32 w-32 rounded-lg">
                    <AvatarImage
                      src={
                        school.logo
                          ? `${import.meta.env.VITE_KAFOOD_SERVER_URL}/${school.logo}`
                          : `https://ui-avatars.com/api/?bold=true&background=random&name=${encodeURIComponent(
                              school.name,
                            )}`
                      }
                      alt={school.name}
                    />
                    <AvatarFallback>
                      {school.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="flex items-center text-2xl font-bold">
                    {school.name}{' '}
                    {school.status === 'active' ? (
                      <div className="h-6 w-6">
                        <IconRosetteDiscountCheck
                          className="ml-2 h-6 w-6 text-green-700"
                          title="Hoạt động"
                        />
                      </div>
                    ) : (
                      <div className="h-6 w-6">
                        <IconX
                          className="ml-2 h-6 w-6 text-destructive"
                          title="Đã khóa"
                        />
                      </div>
                    )}
                  </h1>
                  <p className="text-muted-foreground">{school.author}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>{school.email || 'Không có'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>{school.address || 'Không có'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{school.phone || 'Không có'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4">
                      <IconUser className="h-4 w-4" />
                    </div>
                    <span>{school.account || 'Không có'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Thông tin gói</h3>
                <p className="text-sm">
                  Sỉ số giáo viên:{' '}
                  <strong className="text-primary">
                    {school.userCount}/{school.maxUser}
                  </strong>
                </p>

                <p className="text-sm">
                  Sỉ số học sinh:{' '}
                  <strong className="text-primary">
                    {school.studentCount}/{school.maxStudent}
                  </strong>
                </p>

                <p className="text-sm">
                  Ngày hết hạn:{' '}
                  <strong className="text-primary">
                    {dateFormat(school.expirationTime)}
                  </strong>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Thông tin dung lượng</h3>

                {['internal', 'lessonPlan', 'image'].map((key) => {
                  const used =
                    key === 'internal'
                      ? (usedInternalSize?.size ?? 0)
                      : key === 'lessonPlan'
                        ? (usedLessonPlanSize?.size ?? 0)
                        : (usedImageSize?.size ?? 0)

                  const usedLabel =
                    key === 'internal'
                      ? usedInternalSize?.sizeLabel || '0 Bytes'
                      : key === 'lessonPlan'
                        ? usedLessonPlanSize?.sizeLabel || '0 Bytes'
                        : usedImageSize?.sizeLabel || '0 Bytes'

                  const allowed =
                    key === 'internal'
                      ? (allowedSize?.internal?.size ?? 0)
                      : key === 'lessonPlan'
                        ? (allowedSize?.lessonPlan?.size ?? 0)
                        : (allowedSize?.image?.size ?? 0)

                  const allowedLabel =
                    key === 'internal'
                      ? allowedSize?.internal?.sizeLabel || '0 Bytes'
                      : key === 'lessonPlan'
                        ? allowedSize?.lessonPlan?.sizeLabel || '0 Bytes'
                        : allowedSize?.image?.sizeLabel || '0 Bytes'

                  const remaining = Math.max(allowed - used, 0)
                  const percent = allowed
                    ? Math.min((used / allowed) * 100, 100)
                    : 0
                  const lowSpace = remaining <= 10 * 1024 * 1024

                  const labelMap = {
                    internal: 'Cloud nội bộ',
                    lessonPlan: 'Cloud giáo án',
                    image: 'Cloud ảnh',
                  }

                  return (
                    <div key={key} className="mb-4">
                      <p className="mb-1 text-sm font-medium">
                        {labelMap[key]}:{' '}
                        <strong
                          className={lowSpace ? 'text-red-600' : 'text-primary'}
                        >
                          {usedLabel} / {allowedLabel}
                        </strong>
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            lowSpace ? 'bg-red-500' : 'bg-primary'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      {lowSpace && allowed > 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          ⚠️ Dung lượng còn lại dưới 10MB — vui lòng nâng cấp
                          gói hoặc dọn dẹp dữ liệu.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="space-y-8 rounded-lg p-6 shadow-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Thông tin bổ sung</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">Lịch sử phiên bản</h3>

                    {school.licenses.length ? (
                      displayLicenses.map((license, index) => (
                        <div key={`license_${license.id}_${index}`}>
                          <ul className="mb-4 list-disc pl-5 text-sm">
                            <li className="text-muted-foreground">
                              Tên trường: {license.name}
                            </li>
                            <li className="mt-2 text-muted-foreground">
                              Thời gian thực hiện:{' '}
                              {dateFormat(license.issuedAt, true)}
                            </li>
                            <li className="text-muted-foreground">
                              Thời gian hết hạn:{' '}
                              {dateFormat(license.expirationTime, true)}
                            </li>
                            <li className="mt-2 text-muted-foreground">
                              Loại:{' '}
                              {license.plan === 'demo' ? (
                                <span className="text-primary">Miễn phí</span>
                              ) : (
                                <span className="text-green-500">Trả phí</span>
                              )}
                            </li>
                            <li className="text-muted-foreground">
                              Được tạo bởi: {license.issuedBy}
                            </li>
                            <li className="mt-2 text-muted-foreground">
                              Thiết bị: {license.userAgent}
                            </li>
                            <li className="text-muted-foreground">
                              Địa chỉ IP: {license.ipAddress}
                            </li>
                          </ul>
                          {index < school.licenses.length - 1 && (
                            <hr className="my-4" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        Không có thông tin giấy phép
                      </p>
                    )}

                    {school.licenses.length > 5 && (
                      <button
                        className="hover:text-primary-dark mx-4 mt-2 text-sm font-medium text-primary underline"
                        onClick={() => setShowAllLicenses(!showAllLicenses)}
                      >
                        {showAllLicenses ? 'Ẩn bớt' : 'Xem toàn bộ'}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Người chịu trách nhiệm</h3>
                  </div>

                  {school?.users?.[0] ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium">Họ và tên</h3>
                        <p className="text-xs">{lastUser?.fullName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Địa chỉ email</h3>
                        <p className="text-xs">
                          {lastUser?.email || 'Không có'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Số điện thoại</h3>
                        <p className="text-xs">
                          {lastUser?.phone || 'Không có'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Không có người chịu trách nhiệm
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">
                      Lịch sử thay đổi phiên bản
                    </h3>

                    <ol className="relative border-s border-primary dark:border-primary">
                      {school.histories.length ? (
                        displayHistories.map((history) => {
                          const action = history?.action
                          let extra = ''
                          switch (action) {
                            case 'update': {
                              const planData = history.extra || {}
                              extra = `Cập nhật: ${planData.name}, ngày hết hạn đến: ${dateFormat(planData.expirationTime)}, vào lúc: ${dateFormat(planData.issuedAt, true)}, từ thiết bị: ${planData.userAgent}, địa chỉ IP: ${planData.ipAddress}`
                              break
                            }
                            case 'update_pricing_plan': {
                              const planData = history.extra?.plan || {}
                              extra = `Cập nhật ngày hết hạn đến: ${dateFormat(moment.unix(planData?.exp_date))}, từ thiết bị: ${history.extra?.userAgent}, địa chỉ IP: ${planData.extra?.ipAddress}`
                              break
                            }
                            default:
                              break
                          }

                          return (
                            <li
                              className="mb-3 ms-4"
                              key={`school_history_${history.id}`}
                            >
                              <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary bg-primary dark:border-primary dark:bg-primary"></div>
                              <time className="mb-1 text-sm font-normal leading-none">
                                {dateFormat(history.createdAt, true)}
                              </time>
                              <p className="text-xs">{history.description}</p>
                              <p className="text-xs">{extra}</p>
                            </li>
                          )
                        })
                      ) : (
                        <p className="text-muted-foreground">
                          Không có lịch sử thay đổi phiên bản
                        </p>
                      )}

                      {school.histories.length > 5 && (
                        <button
                          className="hover:text-primary-dark mx-4 mt-2 text-sm font-medium text-primary underline"
                          onClick={() => setShowAllHistories(!showAllHistories)}
                        >
                          {showAllHistories ? 'Ẩn bớt' : 'Xem toàn bộ'}
                        </button>
                      )}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-4"></div>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewSchoolDialog
