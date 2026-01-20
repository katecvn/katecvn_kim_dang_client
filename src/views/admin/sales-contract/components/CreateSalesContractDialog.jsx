import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MobileIcon } from '@radix-ui/react-icons'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat } from '@/utils/money-format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, MapPin } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSalesContractSchema } from '../schema'
import { useDispatch, useSelector } from 'react-redux'
import { createSalesContract, reviewSalesContract } from '@/stores/SalesContractSlice'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { getSetting } from '@/stores/SettingSlice'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'

const CreateSalesContractDialog = ({
  invoiceIds = [],
  open,
  onOpenChange,
  showTrigger = true,
  table,
  ...props
}) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState([])
  const setting = useSelector((state) => state.setting.setting)
  const invoiceItems = invoiceData?.flatMap((invoice) => invoice.invoiceItems)
  const customer = invoiceData[0]?.customer

  const totalAmount = invoiceItems
    ?.map((product) => product)
    .reduce((acc, product) => acc + product.total, 0) || 0

  const form = useForm({
    resolver: zodResolver(createSalesContractSchema),
    defaultValues: async () => ({
      contractNumber: '',
      contractDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      paymentTerms: '',
      note: '',
    }),
  })

  const fetchData = useCallback(async () => {
    if (!invoiceIds || invoiceIds.length === 0) return
    
    setLoading(true)
    try {
      const getAdminInvoice = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_INVOICE')

      const invoiceDetailsPromises = invoiceIds.map((id) =>
        getAdminInvoice
          ? getInvoiceDetail(id)
          : getInvoiceDetailByUser(id),
      )

      const invoices = await Promise.all(invoiceDetailsPromises)
      setInvoiceData(invoices)
    } catch (error) {
      console.log('Failed to fetch invoice data: ', error)
    } finally {
      setLoading(false)
    }
  }, [invoiceIds])

  useEffect(() => {
    fetchData()
    if (table) {
      table.resetRowSelection()
    }
  }, [invoiceIds, fetchData, table])

  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const navigate = useNavigate()

  const onSubmit = async (data) => {
    const dataToSend = {
      ...data,
      invoiceIds: invoiceIds,
      totalAmount,
    }
    try {
      await dispatch(createSalesContract(dataToSend)).unwrap()
      const getAdminContract = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_SALES_CONTRACT')
      getAdminContract ? navigate('/sales-contracts') : navigate('/sales-contract-user')
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Tạo hợp đồng bán hàng mới</DialogTitle>
          <DialogDescription>
            Kiểm tra và hoàn thành thông tin bên dưới để tạo hợp đồng mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-sales-contract" onSubmit={form.handleSubmit(onSubmit)}>
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
                      <h2 className="text-lg font-semibold">
                        Thông tin chi tiết hợp đồng
                      </h2>

                      <div className="space-y-6">
                        {/* Invoice Items Table */}
                        {invoiceItems && invoiceItems.length > 0 && (
                          <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                              <TableHeader>
                                <TableRow className="bg-secondary text-xs">
                                  <TableHead className="w-8">TT</TableHead>
                                  <TableHead className="min-w-40">
                                    Sản phẩm
                                  </TableHead>
                                  <TableHead className="min-w-20">SL</TableHead>
                                  <TableHead className="min-w-16">ĐVT</TableHead>
                                  <TableHead className="min-w-20">Giá</TableHead>
                                  <TableHead className="min-w-28">
                                    Tổng cộng
                                  </TableHead>
                                  <TableHead className="min-w-28">
                                    Ghi chú
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {invoiceItems.map((product, index) => (
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
                                              ?.map(
                                                (option) =>
                                                  `${option.name}: ${option.pivot.value}`,
                                              )
                                              .join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                      {product.unitName || 'Không có'}
                                    </TableCell>
                                    <TableCell className="text-end">
                                      {moneyFormat(product.price)}
                                    </TableCell>
                                    <TableCell className="text-end">
                                      {moneyFormat(product.total)}
                                    </TableCell>
                                    <TableCell>
                                      {product.note || 'Không có'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {/* Form Fields */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="contractNumber"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel required={true}>
                                  Số hợp đồng
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="HĐBH-2026-001"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contractDate"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel required={true}>
                                  Ngày ký hợp đồng
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="deliveryDate"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel>Ngày hẹn giao hàng</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="paymentTerms"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel>Điều khoản thanh toán</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Trả trước 50%, còn lại trả sau khi nhận hàng..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel>Ghi chú hợp đồng</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Nhập ghi chú nếu có"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Summary */}
                        <div className="rounded-lg bg-muted p-4">
                          <div className="flex justify-between">
                            <strong>Tổng giá trị hợp đồng:</strong>
                            <span className="text-lg font-bold">
                              {moneyFormat(totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info Sidebar */}
                    <div className="w-full rounded-lg border p-4 lg:w-72">
                      <div className="flex items-center justify-between">
                        <h2 className="py-2 text-lg font-semibold">
                          Khách hàng
                        </h2>
                      </div>

                      {customer && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?bold=true&background=random&name=${customer?.name}`}
                                alt={customer?.name}
                              />
                              <AvatarFallback>KH</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer?.name}</div>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="font-medium">
                                Thông tin khách hàng
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                              <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <MobileIcon className="h-4 w-4" />
                                </div>
                                <a href={`tel:${customer?.phone}`}>
                                  {customer?.phone || 'Chưa cập nhật'}
                                </a>
                              </div>

                              <div className="flex items-center text-muted-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <a href={`mailto:${customer?.email}`}>
                                  {customer?.email || 'Chưa cập nhật'}
                                </a>
                              </div>

                              <div className="flex items-center text-primary hover:text-secondary-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                {customer?.address || 'Chưa cập nhật'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="create-sales-contract" loading={loading}>
            Tạo hợp đồng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSalesContractDialog
