import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/Button'

const InputCredentialField = ({ control, name, label }) => {
  const [show, setShow] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={show ? 'text' : 'password'}
                className="pr-10"
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1"
              onClick={() => setShow(!show)}
            >
              {show ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default InputCredentialField
