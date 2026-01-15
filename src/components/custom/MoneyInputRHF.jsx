import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

const format = (num) => {
  if (num === null || num === undefined || num === '') return ''
  return Number(num).toLocaleString('vi-VN')
}

export default function MoneyInputRHF({
  value,
  onChange,
  placeholder = '0',
  ...props
}) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    setDisplay(format(value))
  }, [value])

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\./g, '')
    const num = raw === '' ? 0 : Number(raw) || 0
    setDisplay(format(raw))
    onChange(num)
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      className="text-end font-medium"
      value={display}
      onChange={handleChange}
      {...props}
    />
  )
}
