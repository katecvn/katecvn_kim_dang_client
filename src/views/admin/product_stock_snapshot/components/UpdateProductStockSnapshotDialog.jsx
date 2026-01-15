import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { updateProductStockSnapshot } from '@/stores/ProductStockSnapshotSlice'
import MoneyInputRHF from '@/components/custom/MoneyInputRHF'
import { updateProductStockSnapshotSchema } from '../schema'
import { zodResolver } from '@hookform/resolvers/zod'

const formatDateInput = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && value.includes('T')) {
    return value.slice(0, 10)
  }
  return value
}

export const UpdateProductStockSnapshotDialog = ({
  open,
  onOpenChange,
  snapshot,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()

  const defaultValues = useMemo(
    () => ({
      productCode: snapshot?.productCode || '',
      serialNumber: snapshot?.serialNumber || '',
      productName: snapshot?.productName || '',
      unitName: snapshot?.unitName || '',
      quantity: snapshot?.quantity ?? 0,
      price: snapshot?.price ?? 0,
      snapshotDate: formatDateInput(snapshot?.snapshotDate),
      note: snapshot?.note || '',
    }),
    [snapshot],
  )

  const form = useForm({
    resolver: zodResolver(updateProductStockSnapshotSchema),
    defaultValues,
  })

  // Reset form khi snapshot thay đổi
  useEffect(() => {
    if (snapshot) {
      form.reset(defaultValues)
    }
  }, [snapshot, defaultValues, form])

  const onSubmit = async (values) => {
    if (!snapshot?.id) return

    try {
      const payload = {
        productCode: values.productCode.trim(),
        serialNumber: values.serialNumber?.trim() || null,
        productName: values.productName.trim(),
        unitName: values.unitName.trim(),
        quantity: Number(values.quantity) || 0,
        price: Number(values.price) || 0,
        snapshotDate: values.snapshotDate || null,
        note: values.note?.trim() || null,
      }

      await dispatch(
        updateProductStockSnapshot({
          id: snapshot.id,
          ...payload,
        }),
      ).unwrap()

      toast.success('Cập nhật tồn kho thành công!')
      onOpenChange(false)
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi cập nhật tồn kho!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật tồn kho</DialogTitle>
          <DialogDescription>
            Sửa thông tin chốt tồn cho sản phẩm{' '}
            <strong>{snapshot?.productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="update-stock-snapshot"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel required={true}>Mã hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="Mã sản phẩm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Serial / Mã vạch</FormLabel>
                    <FormControl>
                      <Input placeholder="Serial hoặc mã vạch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel required={true}>Tên hàng hóa</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên hàng hóa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel required={true}>Đơn vị tính</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Cái, Bộ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel required>Số lượng tồn</FormLabel>
                      <FormControl>
                        <MoneyInputRHF {...field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel required>Giá tồn</FormLabel>
                      <FormControl>
                        <MoneyInputRHF {...field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="snapshotDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel required={true}>Ngày chốt</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tồn cuối tháng 11/2025"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button form="update-stock-snapshot" type="submit">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
