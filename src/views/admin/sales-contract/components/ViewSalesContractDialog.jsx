import {
  Dialog,
  DialogContent,
  DialogClose,
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
import { useEffect, useState } from 'react'
import { getSalesContractDetail } from '@/stores/SalesContractSlice'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Button } from '@/components/custom/Button'
import { statuses, paymentStatuses } from '../data'
import { statuses as invoiceStatuses } from '@/views/admin/invoice/data'
import { useDispatch } from 'react-redux'
import { Separator } from '@/components/ui/separator'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { PlusIcon, MobileIcon } from '@radix-ui/react-icons'
import { Mail, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import ViewInvoiceDialog from '@/views/admin/invoice/components/ViewInvoiceDialog'

const ViewSalesContractDialog = ({
  open,
  onOpenChange,
  contractId,
  showTrigger = true,
  ...props
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)

  useEffect(() => {
    if (open && contractId) {
      fetchContractDetail()
    }
  }, [open, contractId])

  const fetchContractDetail = async () => {
    setLoading(true)
    try {
      const result = await dispatch(getSalesContractDetail(contractId)).unwrap()
      setContract(result)
    } catch (error) {
      console.error('Fetch contract error:', error)
    } finally {
      setLoading(false)
    }
  }

  const contractStatus = statuses.find((s) => s.value === contract?.status)
  const paymentStatus = paymentStatuses.find(
    (s) => s.value === contract?.paymentStatus,
  )

  const remainingAmount = contract
    ? parseFloat(contract.totalAmount) - parseFloat(contract.paidAmount || 0)
    : 0

  return (
    <>
      {selectedInvoiceId && (
        <ViewInvoiceDialog
          invoiceId={selectedInvoiceId}
          showTrigger={false}
        />
      )}
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className={cn(
          'md:h-auto md:max-w-full',
          !isDesktop && 'h-screen max-h-screen w-screen max-w-none m-0 p-0 rounded-none',
        )}
      >
        <DialogHeader className={cn(!isDesktop && 'px-4 pt-4')}>
          <DialogTitle className={cn(!isDesktop && 'text-base')}>
            Chi tiết hợp đồng bán hàng: {contract?.code}
          </DialogTitle>
          <DialogDescription className={cn(!isDesktop && 'text-xs')}>
            Dưới đây là thông tin chi tiết hợp đồng bán hàng: {contract?.code}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'overflow-auto',
            isDesktop ? 'max-h-[75vh]' : 'h-full px-4 pb-4',
          )}
        >
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
              <div
                className={cn(
                  'flex gap-6',
                  isDesktop ? 'flex-row' : 'flex-col',
                )}
              >
                <div
                  className={cn(
                    'flex-1 rounded-lg border',
                    isDesktop ? 'space-y-6 p-4' : 'space-y-4 p-3',
                  )}
                >
                  <h2
                    className={cn(
                      'font-semibold',
                      isDesktop ? 'text-lg' : 'text-base',
                    )}
                  >
                    Thông tin hợp đồng
                  </h2>

                  {/* Contract Header Info */}
                  <div
                    className={cn(
                      'space-y-4 p-3 rounded-lg border bg-card',
                      isDesktop ? 'text-sm' : 'text-xs',
                    )}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Mã hợp đồng:</span>
                        <p className="font-medium text-primary">{contract?.code}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ngày hợp đồng:</span>
                        <p className="font-medium">
                          {dateFormat(contract?.contractDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ngày giao hàng:</span>
                        <p className="font-medium text-orange-600">
                          {dateFormat(contract?.deliveryDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trạng thái:</span>
                        {contractStatus && (
                          <div className={`font-medium flex items-center ${contractStatus.color}`}>
                            {React.createElement(contractStatus.icon, {
                              className: 'mr-1 h-4 w-4',
                            })}
                            {contractStatus.label}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={cn('space-y-6', !isDesktop && 'space-y-4')}>
                    {/* Product Items Table */}
                    {isDesktop ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-secondary text-xs">
                              <TableHead className="w-8">TT</TableHead>
                              <TableHead className="min-w-40">
                                Sản phẩm
                              </TableHead>
                              <TableHead className="min-w-20 text-right">
                                SL
                              </TableHead>
                              <TableHead className="min-w-28 text-right">
                                Đơn giá
                              </TableHead>
                              <TableHead className="min-w-28 text-right">
                                Thành tiền
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contract?.items?.map((item, index) => (
                              <TableRow key={item.id || index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                  {item.productName}
                                </TableCell>
                                <TableCell className="text-right">
                                  {parseInt(item.quantity)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {moneyFormat(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {moneyFormat(item.totalAmount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contract?.items?.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="border rounded-lg p-3 space-y-2 bg-card"
                          >
                            <div className="font-medium text-sm">
                              {index + 1}. {item.productName}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">SL: </span>
                                <span className="font-medium">
                                  {parseInt(item.quantity)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Đơn giá:{' '}
                                </span>
                                <span className="font-medium">
                                  {moneyFormat(item.unitPrice)}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between border-t pt-2 font-semibold text-sm">
                              <span>Thành tiền:</span>
                              <span className="text-primary">
                                {moneyFormat(item.totalAmount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Totals Section */}
                    <div
                      className={cn(
                        'space-y-4 p-4 rounded-lg border bg-card',
                        isDesktop ? 'text-sm' : 'text-xs',
                      )}
                    >
                      <div className="flex justify-between">
                        <strong>Tổng giá trị:</strong>
                        <span className="font-bold text-primary">
                          {moneyFormat(contract?.totalAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <strong>Đã thanh toán:</strong>
                        <span className="font-medium text-green-600">
                          {moneyFormat(contract?.paidAmount || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-2">
                        <strong>Còn lại:</strong>
                        <span
                          className={cn(
                            'font-bold',
                            remainingAmount > 0
                              ? 'text-red-600'
                              : 'text-green-600',
                          )}
                        >
                          {moneyFormat(remainingAmount)}
                        </span>
                      </div>

                      {/* Amount in words */}
                      <div className="flex flex-col border-t pt-2">
                        <strong className="text-muted-foreground mb-1">
                          Số tiền viết bằng chữ:
                        </strong>
                        <span className="font-bold text-primary">
                          {toVietnamese(contract?.totalAmount)}
                        </span>
                      </div>

                      {/* Payment Status */}
                      <div className="flex justify-between border-t pt-2">
                        <strong>Trạng thái thanh toán:</strong>
                        {paymentStatus && (
                          <span
                            className={`font-medium flex items-center ${paymentStatus.color}`}
                          >
                            {React.createElement(paymentStatus.icon, {
                              className: 'mr-1 h-4 w-4',
                            })}
                            {paymentStatus.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Invoices Section */}
                    {contract?.invoices && contract.invoices.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h3 className={cn(
                            'font-semibold',
                            isDesktop ? 'text-base' : 'text-sm',
                          )}>
                            Đơn bán
                          </h3>

                          {isDesktop ? (
                            <div className="overflow-x-auto rounded-lg border">
                              <Table className="min-w-full">
                                <TableHeader>
                                  <TableRow className="bg-secondary text-xs">
                                    <TableHead className="min-w-32">Mã hóa đơn</TableHead>
                                    <TableHead className="min-w-28 text-right">
                                      Tổng cộng
                                    </TableHead>
                                    <TableHead className="min-w-28 text-right">
                                      Đã thanh toán
                                    </TableHead>
                                    <TableHead className="min-w-28">
                                      Trạng thái
                                    </TableHead>
                                    <TableHead className="min-w-28">
                                      Thanh toán
                                    </TableHead>
                                    <TableHead className="min-w-32">
                                      Ngày tạo
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {contract.invoices.map((invoice, index) => {
                                    const invoiceStatus = invoiceStatuses.find(
                                      (s) => s.value === invoice.status,
                                    )
                                    const invoicePaymentStatus = paymentStatuses.find(
                                      (s) => s.value === invoice.paymentStatus,
                                    )
                                    return (
                                      <TableRow key={invoice.id || index}>
                                        <TableCell 
                                          className="font-medium text-primary cursor-pointer hover:underline"
                                          onClick={() => setSelectedInvoiceId(invoice.id)}
                                        >
                                          {invoice.code}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {moneyFormat(invoice.totalAmount)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                          {moneyFormat(invoice.paidAmount || 0)}
                                        </TableCell>
                                        <TableCell>
                                          {invoiceStatus && (
                                            <div
                                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${invoiceStatus.color}`}
                                            >
                                              {React.createElement(invoiceStatus.icon, {
                                                className: 'h-3 w-3',
                                              })}
                                              {invoiceStatus.label}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {invoicePaymentStatus && (
                                            <div
                                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${invoicePaymentStatus.color}`}
                                            >
                                              {React.createElement(
                                                invoicePaymentStatus.icon,
                                                {
                                                  className: 'h-3 w-3',
                                                },
                                              )}
                                              {invoicePaymentStatus.label}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {dateFormat(invoice.createdAt, true)}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {contract.invoices.map((invoice, index) => {
                                const invoiceStatus = statuses.find(
                                  (s) => s.value === invoice.status,
                                )
                                const invoicePaymentStatus = paymentStatuses.find(
                                  (s) => s.value === invoice.paymentStatus,
                                )
                                return (
                                  <div
                                    key={invoice.id || index}
                                    className="border rounded-lg p-3 space-y-2 bg-card text-xs"
                                  >
                                    <div
                                      className="font-medium text-primary cursor-pointer hover:underline"
                                      onClick={() => setSelectedInvoiceId(invoice.id)}
                                    >
                                      {invoice.code}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Tổng cộng:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {moneyFormat(invoice.totalAmount)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Đã TT:{' '}
                                        </span>
                                        <span className="font-medium text-green-600">
                                          {moneyFormat(invoice.paidAmount || 0)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                      {invoiceStatus && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-muted-foreground">
                                            Trạng thái:
                                          </span>
                                          <div
                                            className={`inline-flex items-center gap-0.5 ${invoiceStatus.color}`}
                                          >
                                            {React.createElement(invoiceStatus.icon, {
                                              className: 'h-3 w-3',
                                            })}
                                            <span className="text-xs">
                                              {invoiceStatus.label}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {invoicePaymentStatus && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-muted-foreground">
                                            TT:
                                          </span>
                                          <div
                                            className={`inline-flex items-center gap-0.5 ${invoicePaymentStatus.color}`}
                                          >
                                            {React.createElement(
                                              invoicePaymentStatus.icon,
                                              {
                                                className: 'h-3 w-3',
                                              },
                                            )}
                                            <span className="text-xs">
                                              {invoicePaymentStatus.label}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="border-t pt-2 text-muted-foreground">
                                      Ngày tạo:{' '}
                                      <span className="font-medium text-foreground">
                                        {dateFormat(invoice.createdAt, true)}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Customer Info Sidebar */}
                <div
                  className={cn(
                    'rounded-lg border p-4',
                    isDesktop ? 'w-72' : 'w-full',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h2
                      className={cn(
                        'py-2 font-semibold',
                        isDesktop ? 'text-lg' : 'text-base',
                      )}
                    >
                      Khách hàng
                    </h2>
                  </div>

                  <div className={cn(isDesktop ? 'space-y-6' : 'space-y-4')}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${contract?.customer?.name}`}
                          alt={contract?.customer?.name}
                        />
                        <AvatarFallback>CU</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {contract?.customer?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {contract?.customer?.code}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">Thông tin khách hàng</div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center text-primary hover:text-secondary-foreground">
                          <div className="mr-2 h-4 w-4">
                            <MobileIcon className="h-4 w-4" />
                          </div>
                          <a href={`tel:${contract?.customer?.phone}`}>
                            {contract?.customer?.phone || 'Chưa cập nhật'}
                          </a>
                        </div>

                        {contract?.customer?.email && (
                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4">
                              <Mail className="h-4 w-4" />
                            </div>
                            <a href={`mailto:${contract?.customer?.email}`}>
                              {contract?.customer?.email}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center text-muted-foreground">
                          <div className="mr-2 h-4 w-4">
                            <MapPin className="h-4 w-4" />
                          </div>
                          {contract?.customer?.address || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>

                    {/* Customer Additional Info */}
                    {(contract?.customer?.identityCard ||
                      contract?.customer?.taxCode) && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-2 text-sm">
                            {contract?.customer?.identityCard && (
                              <div>
                                <strong className="text-muted-foreground">
                                  CCCD/CMND:
                                </strong>
                                <p className="font-medium">
                                  {contract.customer.identityCard}
                                </p>
                              </div>
                            )}
                            {contract?.customer?.identityDate && (
                              <div>
                                <strong className="text-muted-foreground">
                                  Cấp ngày:
                                </strong>
                                <p className="font-medium">
                                  {dateFormat(contract.customer.identityDate)}
                                </p>
                              </div>
                            )}
                            {contract?.customer?.identityPlace && (
                              <div>
                                <strong className="text-muted-foreground">
                                  Cấp tại:
                                </strong>
                                <p className="font-medium">
                                  {contract.customer.identityPlace}
                                </p>
                              </div>
                            )}
                            {contract?.customer?.taxCode && (
                              <div>
                                <strong className="text-muted-foreground">
                                  Mã số thuế:
                                </strong>
                                <p className="font-medium">
                                  {contract.customer.taxCode}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default ViewSalesContractDialog
