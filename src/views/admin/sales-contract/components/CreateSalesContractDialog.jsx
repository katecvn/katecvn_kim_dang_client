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

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { moneyFormat } from '@/utils/money-format'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { createSalesContractSchema } from '../schema'
import { useDispatch } from 'react-redux'
import { createSalesContract } from '@/stores/SalesContractSlice'
import { getInvoices, getInvoiceDetail } from '@/stores/InvoiceSlice'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { getSetting } from '@/stores/SettingSlice'

const CreateSalesContractDialog = ({
  invoiceIds = [],
  open,
  onOpenChange,
  showTrigger = true,
  table,
  ...props
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Local state
  const [loading, setLoading] = useState(false)
  const [invoiceList, setInvoiceList] = useState([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [openCombobox, setOpenCombobox] = useState(false)

  // Fetch list of invoices for dropdown
  useEffect(() => {
    if (open) {
      dispatch(getInvoices({ fromDate: null, toDate: null }))
        .unwrap()
        .then((data) => {
          setInvoiceList(data)
        })
        .catch(console.error)

      dispatch(getSetting('general_information'))
    }
  }, [open, dispatch])

  // Handle passed invoiceIds prop (pre-selection)
  useEffect(() => {
    if (invoiceIds && invoiceIds.length > 0) {
      setSelectedInvoiceId(invoiceIds[0])
    }
  }, [invoiceIds])

  // Fetch detailed invoice data when selected
  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedInvoiceId) {
        setSelectedInvoice(null)
        return
      }

      setLoading(true)
      try {
        const invoice = await dispatch(getInvoiceDetail(selectedInvoiceId)).unwrap()
        setSelectedInvoice(invoice)

        // Removed auto-filling form fields with invoice data as user requested manual input for specific fields,
        // but let's check if we should auto-fill paymentTerm or note if they exist?
        // User said: "chỉ nhập thêm các thông tin này... các cái khác đều tự động"
        // So we keep form clean for manual input, or maybe set some defaults if logic permits.
      } catch (error) {
        console.error('Failed to fetch invoice detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [selectedInvoiceId, dispatch])

  const form = useForm({
    resolver: zodResolver(createSalesContractSchema),
    defaultValues: {
      contractNumber: '',
      contractDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      paymentTerms: 'Thanh toán trong 30 ngày', // User example suggest a default?
      note: 'Hợp đồng bán hàng test', // User example default
    },
  })

  // Watch values for summary if needed (optional)

  const onSubmit = async (data) => {
    if (!selectedInvoice) return

    // Construct payload as per user request
    const customer = selectedInvoice.customer || {}
    const items = selectedInvoice.invoiceItems || []

    const dataToSend = {
      customerId: customer.id || null, // from Invoice
      buyerName: customer.name || '',
      buyerPhone: customer.phone || '',
      buyerAddress: customer.address || '',

      // Assuming these might exist in customer object, or we send empty/defaults if missing
      // The user said "các cái khác đều tự động" (others are automatic).
      // We'll try to map what we can.
      buyerIdentityNo: customer.identityCard || '', // common field name
      buyerIdentityIssueDate: customer.identityDate || null,
      buyerIdentityIssuePlace: customer.identityPlace || '',

      contractNumber: data.contractNumber,
      contractDate: data.contractDate,
      deliveryDate: data.deliveryDate,
      paymentTerm: data.paymentTerms, // Map input 'paymentTerms' to payload 'paymentTerm'
      note: data.note,

      items: items.map(item => ({
        productId: item.productId || item.id, // check InvoiceItem structure
        unitId: item.unitId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount || 0,
        note: item.note || ''
      }))
    }

    // Log payload for debugging/verification
    console.log('Contract Payload:', dataToSend)

    try {
      await dispatch(createSalesContract(dataToSend)).unwrap()
      const getAdminContract = JSON.parse(
        localStorage.getItem('permissionCodes') || '[]'
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
      <DialogContent className="max-w-[600px] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Tạo hợp đồng bán hàng</DialogTitle>
          <DialogDescription>
            Chọn hóa đơn và điền thông tin bổ sung để tạo hợp đồng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="create-sales-contract" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Invoice Selection */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Chọn hóa đơn nguồn <span className="text-destructive">*</span></label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {selectedInvoiceId
                      ? invoiceList.find((invoice) => invoice.id === selectedInvoiceId)?.code || selectedInvoice?.code || "Đã chọn hóa đơn"
                      : "Chọn hóa đơn..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm mã hóa đơn..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy hóa đơn.</CommandEmpty>
                      <CommandGroup>
                        {invoiceList.map((invoice) => (
                          <CommandItem
                            key={invoice.id}
                            value={invoice.code}
                            onSelect={() => {
                              setSelectedInvoiceId(invoice.id)
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedInvoiceId === invoice.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{invoice.code}</span>
                              <span className="text-xs text-muted-foreground">
                                {invoice.customer?.name} - {moneyFormat(invoice.totalAmount)}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Display Invoice Info (Read-only) */}
            {selectedInvoice && (
              <div className="text-sm border rounded p-3 bg-muted/20">
                <div className="flex justify-between">
                  <span>Khách hàng: <strong>{selectedInvoice.customer?.name}</strong></span>
                  <span>Tổng tiền: <strong>{moneyFormat(selectedInvoice.totalAmount)}</strong></span>
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Sản phẩm: {selectedInvoice.invoiceItems?.length || 0} món
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hợp đồng <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="HĐBH-202xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contractDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày ký <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày giao hàng</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điều khoản thanh toán</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Ví dụ: Thanh toán trong 30 ngày..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Ghi chú thêm..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </form>
        </Form>

        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => form.reset()}>
              Hủy
            </Button>
          </DialogClose>
          <Button
            form="create-sales-contract"
            loading={loading}
            disabled={!selectedInvoiceId}
          >
            Tạo hợp đồng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSalesContractDialog
