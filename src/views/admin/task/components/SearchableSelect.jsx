import { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn',
  emptyMessage = 'Không tìm thấy kết quả.',
  allowNone = false,
  noneLabel = 'Không chọn',
}) => {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (newValue) => {
    onChange(newValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* Giới hạn chiều cao + scroll */}
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value={noneLabel}
                  onSelect={() => handleSelect('none')}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === 'none' ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {noneLabel}
                </CommandItem>
              )}

              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => handleSelect(opt.value)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === opt.value ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default SearchableSelect
