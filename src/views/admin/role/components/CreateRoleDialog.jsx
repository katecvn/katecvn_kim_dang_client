import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createRole } from '@/stores/RoleSlice'
import { createRoleSchema } from '../schema'
import { useEffect, useState } from 'react'
import { getPermission } from '@/stores/PermissionSlice'
import { Checkbox } from '@/components/ui/checkbox'

const CreateRoleDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.role.loading)
  const permissions = useSelector((state) => state.permission.permissions)

  const form = useForm({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      code: '',
      name: '',
    },
  })

  const [checkedPermissions, setCheckedPermissions] = useState([])
  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      await dispatch(
        createRole({ ...data, permissions: checkedPermissions }),
      ).unwrap()
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  useEffect(() => {
    dispatch(getPermission())
  }, [dispatch])

  const handleCheck = (permissionId, isChecked, children = [], parentId) => {
    let updatedCheckedPermissions = [...checkedPermissions]

    // Handle current permission and its children
    const processPermissions = (id, add) => {
      updatedCheckedPermissions = add
        ? [...updatedCheckedPermissions, id]
        : updatedCheckedPermissions.filter((checkedId) => checkedId !== id)
    }

    processPermissions(permissionId, isChecked)
    children.forEach((child) => processPermissions(child.id, isChecked))

    // Handle parent permission based on children
    if (parentId) {
      const parent = permissions.find(
        (permission) => permission.id === parentId,
      )
      const allChildrenChecked = parent?.children?.every((child) =>
        updatedCheckedPermissions.includes(child.id),
      )

      processPermissions(parentId, allChildrenChecked)
    }

    setCheckedPermissions(updatedCheckedPermissions)
  }

  const renderPermission = (permissions, parentId = null) => {
    return permissions.map((permission) => (
      <div key={permission.id} className="mb-1 ml-4">
        <div className="items-top mb-2 flex space-x-2">
          <Checkbox
            checked={checkedPermissions.includes(permission.id)}
            onCheckedChange={(isChecked) =>
              handleCheck(
                permission.id,
                isChecked,
                permission.children,
                parentId,
              )
            }
            id={permission.code}
          />
          <div className="grid items-center gap-1.5">
            <label
              htmlFor={permission.code}
              className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {permission.name}
            </label>
          </div>
        </div>
        {permission.children &&
          renderPermission(permission.children, permission.id)}
      </div>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Thêm vai trò mới</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật vai trò
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-role" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-3 grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã vai trò</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã vai trò" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className="text-primary">
                        <strong className="text-destructive">Lưu ý: </strong>
                        Mã vai trò không thể thay đổi sau khi tạo và mã vai trò
                        phải là duy nhất.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên vai trò</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập tên vai trò"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className="text-primary">
                        <strong className="text-destructive">Lưu ý:</strong> Tên
                        vai trò phải là duy nhất.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="col-span-full">
                  <label htmlFor="permissions" className="text-sm font-medium">
                    Chọn các quyền cho vai trò
                  </label>
                </div>
                <>{permissions.length > 0 && renderPermission(permissions)}</>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="create-role" loading={loading}>
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateRoleDialog
