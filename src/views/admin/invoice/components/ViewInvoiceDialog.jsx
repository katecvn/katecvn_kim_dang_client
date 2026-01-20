import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
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
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { statuses } from '../data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Mail, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { IconInfoCircle } from '@tabler/icons-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { dateFormat } from '@/utils/date-format'
import { Skeleton } from '@/components/ui/skeleton'
import { getSchool } from '@/api/school'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteCreditNoteById,
  getCreditNotesByInvoiceId,
  updateCreditNoteStatus,
} from '@/stores/CreditNoteSlice'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import UpdateCreditNoteDialog from './UpdateCreditNoteDialog'

const ViewInvoiceDialog = ({ invoiceId, showTrigger = true, ...props }) => {
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [school, setSchool] = useState(null)
  const creditNotes = useSelector(
    (state) => state.creditNote.creditNotesByInvoiceId,
  )
  const dispatch = useDispatch()
  const [openUpdateCN, setOpenUpdateCN] = useState(false)
  const [editingCN, setEditingCN] = useState(null)
  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      const getAdminInvoice = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_INVOICE')

      const data = getAdminInvoice
        ? await getInvoiceDetail(invoiceId)
        : await getInvoiceDetailByUser(invoiceId)

      setInvoice(data)
      if (data.type === 'kafood') {
        const possibleIds = [
          data?.invoiceItems?.[0]?.schoolId,
          data?.invoiceItems?.schoolId,
          data?.invoiceItems?.[0]?.options?.[0]?.schoolId,
        ]

        const schoolId = possibleIds.find(
          (id) => typeof id === 'number' && !isNaN(id),
        )

        const response = await getSchool(schoolId)
        setSchool(response)
      }
    } catch (error) {
      setLoading(false)
      console.log('Fetch invoice detail error:', error)
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    fetchData()
    dispatch(getCreditNotesByInvoiceId(invoiceId))
  }, [invoiceId, fetchData, dispatch])

  const handleApproveCreditNote = async (creditNote) => {
    if (creditNote.status === 'accepted') {
      toast.warning('Hóa đơn đã được duyệt')
      return
    }

    const dataToSend = {
      id: creditNote.id,
      status: 'accepted',
    }

    try {
      await dispatch(updateCreditNoteStatus(dataToSend)).unwrap()
      toast.success(`Đã duyệt hóa đơn âm ${creditNote.code}`)
      await dispatch(getCreditNotesByInvoiceId(invoiceId)).unwrap()
    } catch (err) {
      toast.error('Không thể duyệt hóa đơn. Vui lòng thử lại.')
    }
  }

  const handleEditCreditNote = (creditNote) => {
    setEditingCN(creditNote)
    setOpenUpdateCN(true)
  }

  const handleDeleteCreditNote = async (creditNote) => {
    try {
      await dispatch(deleteCreditNoteById(creditNote.id)).unwrap()
      toast.success(`Đã xóa hóa đơn điều chỉnh ${creditNote.code}`)
      await dispatch(getCreditNotesByInvoiceId(invoiceId)).unwrap()
    } catch (err) {
      toast.error('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết hóa đơn: {invoice?.code}</DialogTitle>
          <DialogDescription>
            Dưới đây là thông tin chi tiết hóa đơn: {invoice?.code}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-[20px] w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-6 rounded-lg border p-4">
                  <h2 className="text-lg font-semibold">Thông tin đơn</h2>

                  {/* Contract Source Alert */}
                  {invoice?.salesContractId && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Nguồn từ hợp đồng bán hàng
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Số HĐ: <span className="font-medium">{invoice.contractNumber || `#${invoice.salesContractId}`}</span>
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 mt-1"
                            onClick={() => {
                              window.open(`/sales-contracts?view=${invoice.salesContractId}`, '_blank')
                            }}
                          >
                            Xem hợp đồng gốc →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
                            <TableHead className="w-8">TT</TableHead>
                            <TableHead className="min-w-40">Sản phẩm</TableHead>
                            <TableHead className="min-w-20">SL</TableHead>
                            <TableHead className="min-w-16">Tặng</TableHead>
                            <TableHead className="min-w-16">ĐVT</TableHead>
                            <TableHead className="min-w-20">Giá</TableHead>
                            <TableHead className="min-w-16">Thuế</TableHead>
                            <TableHead className="min-w-28 md:w-16">
                              Giảm giá
                            </TableHead>
                            <TableHead className="min-w-28">
                              Tổng cộng
                            </TableHead>
                            <TableHead className="min-w-28 md:w-20">
                              BH
                            </TableHead>
                            <TableHead className="min-w-28">Ghi chú</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoice?.invoiceItems.map((product, index) => (
                            <TableRow key={product.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {product.productName}
                                  </div>
                                  {product?.options && (
                                    <div className="break-words text-sm text-muted-foreground">
                                      {product?.options
                                        ?.filter((option) => !!option.code) // Only show options exclude school information
                                        ?.map(
                                          (option) =>
                                            `${option.name} ${option?.pivot?.value || ''}`,
                                        )
                                        .join(', ')}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>{product.giveaway}</TableCell>
                              <TableCell>
                                {product.unitName || 'Không có'}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.price)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.taxAmount)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.discount)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.total)}
                              </TableCell>
                              <TableCell>
                                {product?.warranties[0]?.periodMonths &&
                                  product.warranty
                                  ? `${product.warranty}`
                                  : 'Không có'}
                              </TableCell>
                              <TableCell>
                                {product.note || 'Không có'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                      <div className="flex flex-col gap-2">
                        <div className="text-sm">
                          <strong className="text-destructive">
                            Ghi chú:{' '}
                          </strong>
                          <span className="text-primary">
                            {invoice?.note || 'Không có'}
                          </span>
                        </div>
                        {invoice?.expires?.length > 0 && (
                          <div className="text-sm">
                            <strong className="text-destructive">
                              Thông tin quản lý hạn dùng:
                            </strong>
                            <ul className="ml-4 list-disc text-primary">
                              {invoice.expires.map((exp) => {
                                const matchedProduct =
                                  invoice.invoiceItems?.find(
                                    (item) => item.productId === exp.productId,
                                  )

                                return (
                                  <li key={exp.id}>
                                    <span className="font-medium">
                                      {matchedProduct?.productName ||
                                        `Sản phẩm ID ${exp.productId}`}
                                    </span>
                                    {': '}
                                    từ{' '}
                                    <strong>
                                      {dateFormat(exp.startDate)}
                                    </strong>{' '}
                                    đến{' '}
                                    <strong>{dateFormat(exp.endDate)}</strong>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <strong>Giảm giá:</strong>
                          <span>{moneyFormat(invoice?.discount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Thuế:</strong>
                          <span>{moneyFormat(invoice?.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Phí vận chuyển: </strong>
                          <span>
                            {moneyFormat(invoice?.otherExpenses?.price || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Tổng cộng:</strong>
                          <span>{moneyFormat(invoice?.amount)}</span>
                        </div>
                        <div className="flex justify-start border-t py-2">
                          <div className="text-sm font-bold">
                            Số tiền viết bằng chữ:{' '}
                            <span className="font-bold">
                              {toVietnamese(invoice?.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-start border-t py-2">
                          <strong>Trạng thái hóa đơn: </strong>
                          {invoice?.status && (
                            <span
                              className={`ml-2 flex items-center ${statuses.find(
                                (status) => status.value === invoice?.status,
                              )?.color || ''
                                }`}
                            >
                              {React.createElement(
                                statuses.find(
                                  (status) => status.value === invoice?.status,
                                )?.icon,
                                { className: 'mr-1 h-4 w-4' },
                              )}
                              {
                                statuses.find(
                                  (status) => status.value === invoice?.status,
                                )?.label
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Cột trái: Lịch sử */}
                      <div>
                        <h3 className="mb-2 font-semibold">Lịch sử</h3>
                        <ol className="relative border-s border-primary dark:border-primary">
                          {invoice?.invoiceHistories?.length ? (
                            invoice?.invoiceHistories.map((history) => (
                              <li className="mb-3 ms-4" key={history.id}>
                                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary bg-primary dark:border-primary dark:bg-primary"></div>
                                <time className="mb-1 text-sm font-normal leading-none">
                                  {dateFormat(history.createdAt, true)}
                                </time>
                                <p className="text-xs">{history.description}</p>
                              </li>
                            ))
                          ) : (
                            <p className="text-muted-foreground">
                              Không có lịch sử thay đổi
                            </p>
                          )}
                        </ol>
                      </div>

                      {/* Cột phải: Hóa đơn âm (Credit notes) */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">Hóa đơn điều chỉnh</h3>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="min-w-40">Mã</TableHead>
                                <TableHead className="min-w-[220px]">
                                  Sản phẩm
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Trạng thái
                                </TableHead>
                                <TableHead className="min-w-28 text-right">
                                  Giá
                                </TableHead>
                                <TableHead className="w-24 text-center">
                                  Hành động
                                </TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {creditNotes?.length ? (
                                creditNotes.map((cn) => {
                                  const statusMeta =
                                    statuses?.find(
                                      (s) => s.value === cn.status,
                                    ) || null

                                  return (
                                    <TableRow key={cn.id}>
                                      <TableCell className="whitespace-nowrap">
                                        {cn.code}
                                      </TableCell>

                                      {/* Sản phẩm xSL, tô màu cam cho số lượng */}
                                      <TableCell className="break-words">
                                        {cn?.invoiceItems?.length
                                          ? cn.invoiceItems.map((ii, idx) => (
                                            <span
                                              key={ii.id ?? idx}
                                              className="inline"
                                            >
                                              {ii.productName}{' '}
                                              {ii.quantity ? (
                                                <span className="font-semibold text-orange-500">
                                                  x{ii.quantity}
                                                </span>
                                              ) : null}
                                              {idx <
                                                cn.invoiceItems.length - 1
                                                ? ', '
                                                : ''}
                                            </span>
                                          ))
                                          : '—'}
                                      </TableCell>

                                      {/* Trạng thái */}
                                      <TableCell>
                                        {statusMeta ? (
                                          <ConfirmActionButton
                                            title="Xác nhận duyệt hóa đơn điều chỉnh"
                                            description={`Bạn có chắc muốn duyệt hóa đơn điều chỉnh ${cn.code}?`}
                                            confirmText="Duyệt"
                                            onConfirm={() =>
                                              handleApproveCreditNote(cn)
                                            }
                                          >
                                            <button
                                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition hover:opacity-80 ${statusMeta.color}`}
                                            >
                                              {statusMeta.icon &&
                                                React.createElement(
                                                  statusMeta.icon,
                                                  {
                                                    className: 'h-3 w-3',
                                                  },
                                                )}
                                              {statusMeta.label}
                                            </button>
                                          </ConfirmActionButton>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            —
                                          </span>
                                        )}
                                      </TableCell>

                                      <TableCell className="text-right">
                                        {moneyFormat(cn.amount)}
                                      </TableCell>

                                      <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          {/* Edit */}
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleEditCreditNote(cn)
                                                  }
                                                  className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-accent"
                                                  aria-label={`Sửa ${cn.code}`}
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </button>
                                              </TooltipTrigger>{' '}
                                              <TooltipContent>
                                                Sửa
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>

                                          {editingCN && (
                                            <UpdateCreditNoteDialog
                                              key={editingCN.id}
                                              open={openUpdateCN}
                                              onOpenChange={async (v) => {
                                                setOpenUpdateCN(v)
                                                if (!v) {
                                                  try {
                                                    await dispatch(
                                                      getCreditNotesByInvoiceId(
                                                        invoiceId,
                                                      ),
                                                    ).unwrap()
                                                  } catch { }
                                                }
                                              }}
                                              creditNote={editingCN}
                                              showTrigger={false}
                                            />
                                          )}

                                          {/* Delete (confirm) */}
                                          <ConfirmActionButton
                                            title="Xác nhận xóa"
                                            description={`Bạn có chắc muốn xóa hóa đơn điều chỉnh ${cn.code}? Hành động này không thể hoàn tác.`}
                                            confirmText="Xóa"
                                            onConfirm={() =>
                                              handleDeleteCreditNote(cn)
                                            }
                                          >
                                            <button
                                              type="button"
                                              className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs text-destructive hover:bg-accent"
                                              aria-label={`Xóa ${cn.code}`}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </ConfirmActionButton>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                  >
                                    Không có hóa đơn điều chỉnh
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
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
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.customer?.name}`}
                          alt={invoice?.customer?.name}
                        />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invoice?.customer?.name}
                        </div>
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
                          <a href={`tel:${invoice?.customer?.phone}`}>
                            {invoice?.customer?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <Mail className="h-4 w-4" />
                          </div>
                          <a href={`mailto:${invoice?.customer?.email}`}>
                            {invoice?.customer?.email || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-primary hover:text-secondary-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <MapPin className="h-4 w-4" />
                          </div>
                          {invoice?.customer?.address || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  {school && (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="py-2 text-lg font-semibold">
                          Trường học
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${school?.name}`}
                              alt={school?.name}
                            />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{school.name}</div>
                            {(() => {
                              const lastPlan =
                                school?.licenses?.[school?.licenses?.length - 1]
                                  ?.content?.plan

                              const isPaid = lastPlan === 'paid'
                              const planLabel = isPaid ? 'Trả phí' : 'Miễn phí'
                              const colorClass = isPaid
                                ? 'text-green-600'
                                : 'text-red-600'

                              return (
                                <div
                                  className={`cursor-pointer text-sm font-medium hover:opacity-80 ${colorClass}`}
                                >
                                  {planLabel} ({school?.countPlan || 0})
                                </div>
                              )
                            })()}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2">
                            <div className="font-medium">
                              Thông tin trường học
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center">
                              <div className="mr-2 h-4 w-4 ">
                                <Clock className="h-4 w-4 font-bold" />
                              </div>
                              <div>
                                <strong className="mr-1">
                                  Ngày hết hạn hiện tại:
                                </strong>
                                {dateFormat(school.expirationTime)}
                              </div>
                            </div>

                            <div className="font-semibold">
                              Chủ trường: {school.author}
                            </div>
                            <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${school.phone}`}>
                                {school.phone || 'Chưa cập nhật'}
                              </a>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${school.email}`}>
                                {school.email || 'Chưa cập nhật'}
                              </a>
                            </div>
                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MapPin className="h-4 w-4" />
                              </div>
                              {school.address || 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <h2 className="py-2 text-lg font-semibold">
                      Người lập hóa đơn
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.user?.fullName}`}
                          alt={invoice?.user?.fullName}
                        />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invoice?.user?.fullName} ({invoice?.user.code})
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">Thông tin nhân viên</div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <MobileIcon className="h-4 w-4" />
                          </div>
                          <a href={`tel:${invoice?.user?.phone}`}>
                            {invoice?.user?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                          <div className="mr-2 h-4 w-4 ">
                            <Mail className="h-4 w-4" />
                          </div>
                          <a href={`mailto:${invoice?.user?.email}`}>
                            {invoice?.user?.email || 'Chưa cập nhật'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {invoice?.invoiceRevenueShare && (
                    <>
                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <h2 className="py-2 text-lg font-semibold">
                          Tỉ lệ hưởng doanh số
                        </h2>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <strong>Người được chia: </strong>
                          <div className="flex items-center gap-1">
                            {invoice?.invoiceRevenueShare?.user.fullName}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <IconInfoCircle className="h-4 w-4 cursor-pointer text-primary hover:text-secondary-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      Mã nhân viên:{' '}
                                      {invoice?.invoiceRevenueShare?.user.code}
                                    </div>

                                    <div className="font-medium">
                                      Số điện thoại:{' '}
                                      <a
                                        href={`tel:${invoice?.invoiceRevenueShare?.user.phone}`}
                                      >
                                        {invoice?.invoiceRevenueShare?.user
                                          .phone || 'Chưa cập nhật'}
                                      </a>
                                    </div>

                                    <div className="font-medium">
                                      Địa chỉ email:{' '}
                                      <a
                                        href={`tel:${invoice?.invoiceRevenueShare?.user.email}`}
                                      >
                                        {invoice?.invoiceRevenueShare?.user
                                          .email || 'Chưa cập nhật'}
                                      </a>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <strong>Tỉ lệ chia: </strong>
                          <span>
                            {invoice?.invoiceRevenueShare?.sharePercentage *
                              100}
                            %
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <strong>Số tiền được chia: </strong>
                          <span className="text-primary">
                            {moneyFormat(invoice?.invoiceRevenueShare?.amount)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
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

export default ViewInvoiceDialog
