import { useEffect, useState } from 'react'
import { Input } from '../ui/input'

export const MoneyInputQuick = ({ value, onChange, ...props }) => {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (value != null && value !== '') {
      setDisplay(String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
    } else {
      setDisplay('')
    }
  }, [value])

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\./g, '')
    const num = raw === '' ? '' : Number(raw)
    setDisplay(raw ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '')
    onChange(num || 0)
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      className="h-7 w-24 text-end font-medium"
      placeholder="0"
      value={display}
      onChange={handleChange}
      {...props}
    />
  )
}
