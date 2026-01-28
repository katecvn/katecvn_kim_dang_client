import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import {
  createWarehouseReceipt,
  generateWarehouseReceiptFromInvoice,
} from '@/stores/WarehouseReceiptSlice'
import { getInvoices } from '@/stores/InvoiceSlice'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat } from '@/utils/money-format'

const CreateWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  selectedInvoices = [],
  ...props
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('auto') // 'auto' or 'manual'
  const [step, setStep] = useState(1) // 1: Select mode, 2: Manual form

  // Manual mode form state
  const [formData, setFormData] = useState({
    receiptDate: new Date().toISOString().split('T')[0],
    shipper: '',
    reason: '',
    delivererName: '',
    delivererOrg: '',
    note: '',
  })

  const [selectedProducts, setSelectedProducts] = useState([])

  // Get invoice data (for manual mode, only support 1 invoice)
  const invoice = selectedInvoices[0]?.original

  console.log('Invoice:', invoice)

  const handleContinue = () => {
    if (mode === 'auto') {
      handleAutoExport()
    } else {
      // Manual mode: go to step 2
      if (selectedInvoices.length !== 1) {
        toast.warning('Xuất kho thủ công chỉ hỗ trợ 1 đơn hàng')
        return
      }

      // Check if invoice and invoiceItems exist
      if (!invoice) {
        toast.error('Không tìm thấy thông tin đơn hàng')
        return
      }

      if (!invoice.invoiceItems || invoice.invoiceItems.length === 0) {
        toast.error('Đơn hàng không có sản phẩm')
        return
      }

      // Initialize selected products from invoice
      const products = invoice.invoiceItems.map((item) => ({
        ...item,
        selected: true,
        qtyDocument: item.quantity,
        qtyActual: item.quantity,
        unitPrice: item.price, // Use price from invoiceItem
        unit: {
          id: item.unitId,
          name: item.unitName,
        },
        itemNote: '',
      }))
      console.log('Products initialized:', products)
      setSelectedProducts(products)
      setStep(2)
      console.log('Step set to 2')
    }
  }

  const handleAutoExport = async () => {
    try {
      setLoading(true)

      const validInvoices = selectedInvoices.filter(
        (row) =>
          (row.original.status === 'accepted' ||
            row.original.status === 'delivered') &&
          (!row.original.warehouseReceipts ||
            row.original.warehouseReceipts.length === 0)
      )

      if (validInvoices.length === 0) {
        toast.warning('Không có đơn hàng nào đủ điều kiện tạo phiếu xuất kho')
        return
      }

      let successCount = 0
      let failCount = 0

      for (const row of validInvoices) {
        try {
          await dispatch(
            generateWarehouseReceiptFromInvoice(row.original.id)
          ).unwrap()
          successCount++
        } catch (error) {
          console.error(`Failed for invoice ${row.original.code}:`, error)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Đã tạo ${successCount} phiếu xuất kho thành công`)
        await dispatch(
          getInvoices({ fromDate: null, toDate: null })
        ).unwrap()
        onOpenChange(false)
        navigate('/warehouse-out')
      }

      if (failCount > 0) {
        toast.error(`${failCount} phiếu tạo thất bại`)
      }
    } catch (error) {
      console.error('Auto export error:', error)
      toast.error('Có lỗi xảy ra khi tạo phiếu xuất kho')
    } finally {
      setLoading(false)
    }
  }

  const handleManualExport = async () => {
    try {
      setLoading(true)

      const selectedItems = selectedProducts.filter((p) => p.selected)

      if (selectedItems.length === 0) {
        toast.warning('Vui lòng chọn ít nhất 1 sản phẩm')
        return
      }

      const payload = {
        receiptType: 2, // Xuất kho
        businessType: 'sales_out',
        customerId: invoice.customer.id,
        invoiceId: invoice.id,
        receiptDate: formData.receiptDate,
        shipper: formData.shipper,
        reason: formData.reason,
        delivererName: formData.delivererName,
        delivererOrg: formData.delivererOrg,
        note: formData.note,
        details: selectedItems.map((item) => ({
          productId: item.product.id,
          unitId: item.unit.id,
          qtyDocument: parseFloat(item.qtyDocument),
          qtyActual: parseFloat(item.qtyActual),
          unitPrice: parseFloat(item.unitPrice),
          content: item.product.name,
          movement: 'out',
          note: item.itemNote || '',
        })),
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      await dispatch(getInvoices({ fromDate: null, toDate: null })).unwrap()
      onOpenChange(false)
      navigate('/warehouse-out')
    } catch (error) {
      console.error('Manual export error:', error)
      toast.error('Có lỗi xảy ra khi tạo phiếu xuất kho')
    } finally {
      setLoading(false)
    }
  }

  const handleProductToggle = (index) => {
    const updated = [...selectedProducts]
    updated[index].selected = !updated[index].selected
    setSelectedProducts(updated)
  }

  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts]
    updated[index][field] = value
    setSelectedProducts(updated)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleClose = () => {
    setMode('auto')
    setStep(1)
    setFormData({
      receiptDate: new Date().toISOString().split('T')[0],
      shipper: '',
      reason: '',
      delivererName: '',
      delivererOrg: '',
      note: '',
    })
    setSelectedProducts([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} {...props}>
      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Tạo Phiếu Xuất Kho</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Chọn phương thức tạo phiếu xuất kho'
              : 'Nhập thông tin chi tiết phiếu xuất kho'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          {step === 1 ? (
            <div className="space-y-6 py-4">
              <RadioGroup value={mode} onValueChange={setMode}>
                <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent">
                  <RadioGroupItem value="auto" id="auto" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="auto" className="cursor-pointer font-semibold">
                      Xuất kho tự động
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động tạo phiếu xuất kho từ đơn hàng đã chọn
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="manual"
                      className="cursor-pointer font-semibold"
                    >
                      Xuất kho thủ công
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Chọn sản phẩm và nhập thông tin chi tiết (chỉ hỗ trợ 1 đơn
                      hàng)
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">
                  Đã chọn: {selectedInvoices.length} đơn hàng
                </p>
                {mode === 'manual' && selectedInvoices.length > 1 && (
                  <p className="mt-1 text-yellow-600">
                    ⚠️ Xuất kho thủ công chỉ hỗ trợ 1 đơn hàng
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptDate">Ngày phiếu *</Label>
                  <Input
                    id="receiptDate"
                    type="date"
                    value={formData.receiptDate}
                    onChange={(e) =>
                      setFormData({ ...formData, receiptDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipper">Người giao hàng</Label>
                  <Input
                    id="shipper"
                    value={formData.shipper}
                    onChange={(e) =>
                      setFormData({ ...formData, shipper: e.target.value })
                    }
                    placeholder="Nhập tên người giao hàng"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivererName">Người nhận</Label>
                  <Input
                    id="delivererName"
                    value={formData.delivererName}
                    onChange={(e) =>
                      setFormData({ ...formData, delivererName: e.target.value })
                    }
                    placeholder="Nhập tên người nhận"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivererOrg">Đơn vị nhận</Label>
                  <Input
                    id="delivererOrg"
                    value={formData.delivererOrg}
                    onChange={(e) =>
                      setFormData({ ...formData, delivererOrg: e.target.value })
                    }
                    placeholder="Nhập tên đơn vị nhận"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý do xuất kho</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Nhập lý do xuất kho"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Nhập ghi chú"
                  rows={2}
                />
              </div>

              {/* Products table */}
              <div className="space-y-2">
                <Label>Sản phẩm xuất kho</Label>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">SL chứng từ</TableHead>
                        <TableHead className="text-right">SL thực tế</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={() => handleProductToggle(index)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.product.code}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.qtyDocument}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  'qtyDocument',
                                  e.target.value
                                )
                              }
                              className="w-20 text-right"
                              disabled={!item.selected}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.qtyActual}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  'qtyActual',
                                  e.target.value
                                )
                              }
                              className="w-20 text-right"
                              disabled={!item.selected}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {moneyFormat(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {moneyFormat(item.qtyActual * item.unitPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button onClick={handleContinue} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Quay lại
              </Button>
              <Button onClick={handleManualExport} disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo phiếu xuất kho'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWarehouseReceiptDialog
