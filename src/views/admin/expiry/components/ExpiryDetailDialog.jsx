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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Building2, CircleDollarSign, Mail, MapPin } from 'lucide-react'
import RenderEndDateWithText from './RenderEndDateWithText'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileIcon } from '@radix-ui/react-icons'
import { dateFormat } from '@/utils/date-format'
import { attributes } from '../data'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { isValid } from 'date-fns'
import { IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { deleteExpiry } from '@/stores/ExpirySlice'

const ExpiryDetailDialog = ({ account, showTrigger = true, ...props }) => {
  const latestExpiryId = useMemo(() => {
    if (!account?.expiries?.length) return null
    return account.expiries.reduce((latest, current) =>
      new Date(current.endDate) > new Date(latest.endDate) ? current : latest,
    )?.id
  }, [account?.expiries])

  const [showHistory, setShowHistory] = useState(false)
  const dispatch = useDispatch()

  const handleDeleteExpiry = async () => {
    if (!latestExpiryId) return
    const confirmed = window.confirm(
      'Bạn có chắc muốn xoá hạn dùng gần nhất không?',
    )
    if (!confirmed) return

    try {
      await dispatch(deleteExpiry(latestExpiryId)).unwrap()
    } catch (error) {
      console.error('Lỗi khi xoá hạn dùng:', error)
      toast.error('Không thể xoá hạn dùng. Vui lòng thử lại sau.')
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="md:h-auto md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{account?.name}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết hạn dùng: <strong>{account?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-auto">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6 rounded-lg border p-4">
              <h2 className="text-lg font-semibold">{`Thông tin hạn dùng`}</h2>

              <div className="space-y-4 text-sm">
                <div className="overflow-x-auto rounded-lg border">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-secondary text-xs">
                        <TableHead className="min-w-40">
                          Tên tài khoản
                        </TableHead>
                        <TableHead className="min-w-20">Ngày tạo hạn</TableHead>
                        <TableHead className="min-w-16">Ngày gia hạn</TableHead>
                        <TableHead className="min-w-16">Ngày hết hạn</TableHead>
                        <TableHead className="min-w-20">Sản phẩm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account && (
                        <TableRow>
                          <TableCell>{account?.accountName}</TableCell>
                          <TableCell>
                            {dateFormat(account?.accountCreatedAt)}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const rawStartDate =
                                account?.expiries?.[0]?.startDate
                              const startDate = rawStartDate
                                ? new Date(rawStartDate)
                                : null
                              return startDate && isValid(startDate)
                                ? dateFormat(startDate)
                                : 'Không có'
                            })()}
                          </TableCell>

                          <TableCell>
                            {(() => {
                              const rawEndDate = account?.expiries?.[0]?.endDate
                              const endDate = rawEndDate
                                ? new Date(rawEndDate)
                                : null

                              return endDate && isValid(endDate) ? (
                                <RenderEndDateWithText
                                  endDateFromApi={endDate}
                                  stepDate={30}
                                />
                              ) : (
                                'Không có'
                              )
                            })()}
                          </TableCell>

                          <TableCell>
                            {account?.expiries[0]?.product?.name || 'Không có'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col items-start">
                  <div className="my-2 ">
                    <span className="font-medium text-muted-foreground">
                      Ghi chú:{' '}
                    </span>
                    <span className="">
                      {account?.expiries[0]?.note || 'Không có'}
                    </span>
                  </div>

                  <div className="my-2 w-32 font-medium text-muted-foreground">
                    Thông tin bổ sung:
                  </div>

                  <div className="ml-2 space-y-2">
                    {(() => {
                      try {
                        const options = JSON.parse(
                          account?.expiries[0]?.options || '[]',
                        )
                        return Array.isArray(options) && options.length > 0 ? (
                          options.map((opt, idx) => (
                            <div key={idx}>
                              {opt?.name}:{' '}
                              {`${opt?.pivot?.value} ${attributes[opt?.unit] || ''}`}
                            </div>
                          ))
                        ) : (
                          <div>Không có</div>
                        )
                      } catch {
                        return <div>Không có</div>
                      }
                    })()}
                  </div>
                </div>

                <Separator className="my-4" />
                <div className="flex flex-col items-start">
                  <div
                    className="my-2 flex cursor-pointer items-center font-medium text-muted-foreground"
                    onClick={() => setShowHistory((prev) => !prev)}
                  >
                    <span className="mr-1">Lịch sử gia hạn</span>
                    {showHistory ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>

                  {showHistory && (
                    <div className="ml-2 max-h-60 w-full space-y-2 overflow-auto">
                      <ol className="relative ">
                        <div className="ml-2 border-s border-primary pl-3 dark:border-primary">
                          {account?.expiries?.length ? (
                            account.expiries.map((history) => (
                              <li
                                key={'history-' + history.id}
                                className="relative mb-2"
                              >
                                <div className="absolute -left-[18px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-primary bg-primary"></div>
                                <div className="ml-4 flex items-start justify-between gap-2">
                                  <div>
                                    <time className="mb-1 text-sm font-normal leading-none">
                                      {`Ngày gia hạn: ${dateFormat(history.startDate)} - ngày hết hạn: ${dateFormat(history.endDate)}`}
                                    </time>
                                    <p className="text-xs">{`Người dùng ${history.user.fullName} đã gia hạn ${history.product.name}`}</p>
                                  </div>

                                  {/* Nút xoá chỉ hiển thị nếu là bản ghi mới nhất */}
                                  {history.id === latestExpiryId && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={handleDeleteExpiry}
                                    >
                                      <IconTrash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </li>
                            ))
                          ) : (
                            <p className="text-muted-foreground">
                              Không có lịch sử thay đổi
                            </p>
                          )}
                        </div>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full rounded-lg border p-4 lg:w-72">
              <div className="flex items-center justify-between">
                <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${account?.customer?.name}`}
                      alt={account?.customer?.name}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{account?.customer?.name}</div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">Thông tin khách hàng</div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <MobileIcon className="h-4 w-4" />
                      </div>
                      <a href={`tel:${account?.customer?.phone}`}>
                        {account?.customer?.phone || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${account?.customer?.email}`}>
                        {account?.customer?.email || 'Chưa cập nhật'}
                      </a>
                    </div>

                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <CircleDollarSign className="h-4 w-4" />
                      </div>
                      {account?.customer?.taxCode || 'Chưa cập nhật'}
                    </div>

                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <Building2 className="h-4 w-4" />
                      </div>
                      {account?.customer?.represent || 'Chưa cập nhật'}
                    </div>

                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4 ">
                        <MapPin className="h-4 w-4" />
                      </div>
                      {account?.customer?.address || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExpiryDetailDialog
