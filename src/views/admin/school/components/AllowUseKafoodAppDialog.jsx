import { Button } from '@/components/custom/Button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  allowUseKafoodApp,
  getParentAccountRole,
} from '@/stores/ParentAccountRolePermissionSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { parentRolePermissionData } from '../data'
import { IconChecks } from '@tabler/icons-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

const AllowUseKafoodAppDialog = ({ school, isOpen, onOpenChange }) => {
  const dispatch = useDispatch()
  const parentRolePermission = useSelector(
    (state) => state.parentRolePermission.parentRolePermission,
  )
  const loading = useSelector((state) => state.parentRolePermission.loading)

  useEffect(() => {
    dispatch(getParentAccountRole(school.id))
  }, [dispatch, school.id])

  const handleAllowUseKafoodApp = async () => {
    try {
      await dispatch(
        allowUseKafoodApp({
          parentRolePermissionData,
          schoolId: school.id,
        }),
      ).unwrap()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn có chắc muốn cho phép <strong>{school.name}</strong> sử dụng ứng
            dụng Kafood chứ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div>
              Bằng cách nhấn vào đồng ý bạn sẽ cho phép{' '}
              <strong>{school.name}</strong> sử dụng ứng dụng Kafood. Trường có
              thể tạo tài khoản cho phụ huynh
              <Alert className="my-3">
                <span className="flex text-primary">
                  <div className="h-4 w-4">
                    <Terminal className="mr-2 h-4 w-4" />
                  </div>
                  <AlertDescription>
                    Tính năng này chưa hoàn thiện do thời gian hoàn thiện gấp
                    rút, sẽ có phân quyền theo chức năng cụ thể cho từng trường.
                    Hiện tại chức năng cho phép các tài khoản{' '}
                    <strong>&quot;Cơ bản&quot;</strong>
                    và <strong>&quot;Nâng cao&quot;</strong> có thể truy cập tất
                    cả các chức năng.
                  </AlertDescription>
                </span>
              </Alert>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Hủy
          </AlertDialogCancel>
          {!loading &&
            (!parentRolePermission?.roles.length ? (
              <Button onClick={handleAllowUseKafoodApp}>
                Cho phép sử dụng
              </Button>
            ) : (
              <Button
                disabled
                variant="outline"
                className="border border-green-700 text-green-700"
              >
                <IconChecks className="mr-2 h-4 w-4 text-green-700" />
                Đã có thể tạo tài khoản phụ huynh
              </Button>
            ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AllowUseKafoodAppDialog
