import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAvailableLots, allocateLots, clearAvailableLots } from '@/stores/LotSlice'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import CreateLotForAllocationDialog from './CreateLotForAllocationDialog'
import { Trash2 } from 'lucide-react'

/**
 * Dialog to select lots for a warehouse receipt detail line
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Callback when dialog state changes
 * @param {number} detailId - Warehouse receipt detail ID
 * @param {number} productId - Product ID
 * @param {string} productName - Product name
 * @param {number} qtyRequired - Required quantity to allocate
 * @param {array} existingAllocations - Existing lot allocations
 * @param {function} onSuccess - Callback on successful allocation
 */
const LotAllocationDialog = ({
  open,
  onOpenChange,
  detailId,
  productId,
  productName,
  qtyRequired,
  existingAllocations = [],
  onSuccess,
  contentClassName,
  overlayClassName,
  onCreateLot,
  receiptType,
}) => {
  const dispatch = useDispatch()
  const { availableLots, loading, error } = useSelector((state) => state.lot)

  // Local state for lot selections
  const [selections, setSelections] = useState({})
  const [saving, setSaving] = useState(false)
  const [validationError, setValidationError] = useState(null)

  // New lots created during this session
  const [newLots, setNewLots] = useState([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch available lots when dialog opens
  useEffect(() => {
    if (open && productId) {
      dispatch(getAvailableLots(productId))

      // Initialize selections from existing allocations
      if (existingAllocations.length > 0) {
        const initialSelections = {}
        existingAllocations.forEach((alloc) => {
          initialSelections[alloc.lotId] = {
            selected: true,
            quantity: parseFloat(alloc.quantity),
          }
        })
        setSelections(initialSelections)
      }
    }

    return () => {
      if (!open) {
        dispatch(clearAvailableLots())
        setSelections({})
        setValidationError(null)
      }
    }
  }, [open, productId, dispatch, existingAllocations])

  // Calculate total selected quantity (including new lots)
  const totalSelected = Object.values(selections).reduce((sum, sel) => {
    return sum + (sel.selected ? parseFloat(sel.quantity || 0) : 0)
  }, 0) + newLots.reduce((sum, lot) => sum + parseFloat(lot.quantity || 0), 0)

  // Handle new lot creation success
  const handleCreateLotSuccess = (data) => {
    setNewLots([...newLots, { ...data, tempId: Date.now() }])
    setValidationError(null)
  }

  const handleRemoveNewLot = (tempId) => {
    setNewLots(newLots.filter(l => l.tempId !== tempId))
    setValidationError(null)
  }

  // Handle lot selection toggle
  const handleLotToggle = (lotId, checked) => {
    setSelections((prev) => {
      const newSelections = { ...prev }
      if (checked) {
        newSelections[lotId] = { selected: true, quantity: 0 }
      } else {
        delete newSelections[lotId]
      }
      return newSelections
    })
    setValidationError(null)
  }

  // Handle quantity input change
  const handleQuantityChange = (lotId, value) => {
    const quantity = parseFloat(value) || 0
    const lot = availableLots.find((l) => l.id === lotId)

    // Validate against lot's available quantity ONLY if not Import (1)
    if (receiptType !== 1 && lot && quantity > Number(lot.currentQuantity)) {
      setValidationError(`Lô ${lot.code} chỉ còn ${Number(lot.currentQuantity)} ${lot.unit?.name || 'cái'}`)
      return
    }

    setSelections((prev) => ({
      ...prev,
      [lotId]: {
        ...prev[lotId],
        quantity: quantity,
      },
    }))
    setValidationError(null)
  }

  // Handle save allocations
  const handleSave = async () => {
    // Validate total quantity
    // Using a small epsilon for float comparison
    if (Math.abs(totalSelected - qtyRequired) > 0.001) {
      setValidationError(
        `Tổng số lượng phân bổ (${totalSelected}) phải bằng số lượng cần xuất (${qtyRequired})`
      )
      return
    }

    // Build allocations array
    const existingAllocations = Object.entries(selections)
      .filter(([_, sel]) => sel.selected && sel.quantity > 0)
      .map(([lotId, sel]) => ({
        lotId: parseInt(lotId),
        quantity: sel.quantity,
      }))

    const newLotAllocations = newLots.map(lot => ({
      quantity: parseFloat(lot.quantity),
      newLotData: {
        batchNumber: lot.batchNumber,
        code: lot.code,
        name: lot.name,
        note: lot.note
      }
    }))

    const allocations = [...existingAllocations, ...newLotAllocations]

    if (allocations.length === 0) {
      setValidationError('Vui lòng chọn ít nhất một lô hoặc tạo lô mới')
      return
    }

    try {
      setSaving(true)
      await dispatch(allocateLots({ detailId, allocations })).unwrap()
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setValidationError(err || 'Có lỗi xảy ra khi phân bổ lô')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl max-h-[90vh]", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Chọn Lô Cho: {productName}</DialogTitle>
              <DialogDescription>
                Cần xuất: <strong>{qtyRequired}</strong> cái
              </DialogDescription>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-white mr-5"
              onClick={() => setShowCreateDialog(true)}
            >
              + Tạo Lô Mới
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[60vh] space-y-3">

          {/* List New Lots */}
          {newLots.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-primary">Lô mới tạo (Chưa lưu):</div>
              {newLots.map((lot) => (
                <div key={lot.tempId} className="border border-dashed border-green-500 bg-green-50 rounded-lg p-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:bg-red-100"
                    onClick={() => handleRemoveNewLot(lot.tempId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">SL:</span> {lot.quantity}</div>
                    <div><span className="font-medium">Batch:</span> {lot.batchNumber || '---'}</div>
                    <div><span className="font-medium">Mã:</span> {lot.code || '(Tự sinh)'}</div>
                    <div><span className="font-medium">Tên:</span> {lot.name || '(Tự sinh)'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : availableLots.length === 0 && newLots.length === 0 ? (
            <Alert>
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không tìm thấy lô khả dụng cho sản phẩm này. Hãy tạo lô mới.
              </AlertDescription>
            </Alert>
          ) : (
            availableLots.map((lot) => {
              const isSelected = selections[lot.id]?.selected || false
              const quantity = selections[lot.id]?.quantity || 0
              const isExpiringSoon = lot.expiryDate &&
                new Date(lot.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

              return (
                <div
                  key={lot.id}
                  className={`border rounded-lg p-4 ${isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleLotToggle(lot.id, checked)}
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{lot.code}</div>
                          {lot.batchNumber && (
                            <div className="text-sm text-muted-foreground">
                              Lô SX: {lot.batchNumber}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">
                          Tồn: {Number(lot.currentQuantity)} {lot.unit?.name || 'cái'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {lot.expiryDate && (
                          <div>
                            <span className="text-muted-foreground">HSD: </span>
                            <span className={isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                              {dateFormat(lot.expiryDate)}
                              {isExpiringSoon && ' ⚠️'}
                            </span>
                          </div>
                        )}
                        {lot.supplier && (
                          <div>
                            <span className="text-muted-foreground">NCC: </span>
                            {lot.supplier.name}
                          </div>
                        )}
                        {lot.unitCost && (
                          <div>
                            <span className="text-muted-foreground">Giá vốn: </span>
                            {moneyFormat(Number(lot.unitCost))}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Số lượng:</label>
                          <Input
                            type="number"
                            min="0"
                            max={lot.currentQuantity}
                            step="0.01"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(lot.id, e.target.value)}
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground">
                            {lot.unit?.name || 'cái'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Validation Summary */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tổng đã chọn:</span>
            <span className={`font-semibold ${totalSelected === qtyRequired
              ? 'text-green-600'
              : totalSelected > qtyRequired
                ? 'text-red-600'
                : 'text-orange-600'
              }`}>
              {totalSelected} / {qtyRequired} cái
              {totalSelected === qtyRequired && <IconCheck className="inline ml-1 h-4 w-4" />}
            </span>
          </div>
        </div>

        {(validationError || error) && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError || error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || Math.abs(totalSelected - qtyRequired) > 0.001}
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <CreateLotForAllocationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateLotSuccess}
      />
    </Dialog>
  )
}

export default LotAllocationDialog
