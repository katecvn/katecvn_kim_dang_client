import { Button } from '@/components/custom/Button'
import { IconUpload } from '@tabler/icons-react'
import ExcelJS from 'exceljs'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { useRef, useState } from 'react'
import { createProductStockSnapshotList } from '@/stores/ProductStockSnapshotSlice'

export default function UploadStockExcel({ snapshotDate }) {
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const parseExcel = async (file) => {
    try {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(await file.arrayBuffer())
      const sheet = workbook.worksheets[0]

      const rows = sheet.getSheetValues()
      const result = []

      // Bỏ dòng header
      for (let i = 2; i < rows.length; i++) {
        const row = rows[i]
        if (!row) continue

        const productCode = row[3]
        const barcode = row[4]
        const productName = row[5]
        const unitName = row[6]
        const quantity = row[7]
        const price = row[8]

        if (!productCode || !productName) continue

        result.push({
          productCode: String(productCode).trim(),
          serialNumber: barcode ? String(barcode).trim() : null,
          productName: String(productName).trim(),
          unitName: String(unitName || '').trim(),
          quantity: Number(quantity) || 0,
          price: Number(price) || 0,
          snapshotDate,
          note: `Tồn ${snapshotDate}`,
        })
      }

      return result
    } catch (err) {
      console.error(err)
      toast.error('Lỗi đọc file Excel!')
      return null
    }
  }

  const handleUpload = async (file, inputEl) => {
    setIsUploading(true)
    try {
      const parsed = await parseExcel(file)
      if (!parsed || parsed.length === 0) {
        toast.error('File Excel không có dữ liệu hợp lệ!')
        return
      }

      const dataToSend = {
        productStockSnapshotList: parsed,
      }

      await dispatch(createProductStockSnapshotList(dataToSend)).unwrap()

      toast.success('Tải lên & lưu dữ liệu thành công!')
    } catch (error) {
      console.error(error)
      toast.error('Lỗi khi lưu dữ liệu lên server!')
    } finally {
      setIsUploading(false)
      // 🔥 RẤT QUAN TRỌNG: reset value để lần sau chọn lại cùng file vẫn chạy onChange
      if (inputEl) {
        inputEl.value = ''
      }
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        <IconUpload className="mr-2 size-4" />
        {isUploading ? 'Đang tải lên...' : 'Tải lên Excel'}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleUpload(file, e.target)
          } else {
            // Nếu user cancel chọn file, vẫn đảm bảo reset
            e.target.value = ''
          }
        }}
      />
    </>
  )
}
