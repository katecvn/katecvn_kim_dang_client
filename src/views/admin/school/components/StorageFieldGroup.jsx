import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fileSizeList } from '@/views/admin/school/data/index.jsx'

const StorageFieldGroup = ({ control, name, label }) => (
  <>
    <FormField
      control={control}
      name={`${name}.sizeType`}
      render={({ field }) => (
        <FormItem className="mb-2 space-y-1">
          <FormLabel required>{label} - Loại dung lượng</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại dung lượng" />
              </SelectTrigger>
              <SelectContent>
                {fileSizeList.map((item, index) => (
                  <SelectItem key={index} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name={`${name}.sizeValue`}
      render={({ field }) => (
        <FormItem className="mb-2 space-y-1">
          <FormLabel required>Dung lượng</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="Nhập dung lượng"
              {...field}
              step="0.01"
              min="0"
              inputMode="decimal"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
)

export default StorageFieldGroup
