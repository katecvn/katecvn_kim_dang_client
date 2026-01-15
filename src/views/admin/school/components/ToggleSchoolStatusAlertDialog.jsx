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
import { toggleSchoolStatus } from '@/stores/SchoolSlice'
import { useDispatch } from 'react-redux'

const ToggleSchoolAlertDialog = ({ school, isOpen, onOpenChange }) => {
  const dispatch = useDispatch()

  const handleBlocked = async () => {
    try {
      await dispatch(toggleSchoolStatus(school.id)).unwrap()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc muốn cập nhật chứ?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này sẽ cập nhật trạng thái của trường học.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Hủy
          </AlertDialogCancel>
          <Button onClick={handleBlocked}>Cập nhật</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ToggleSchoolAlertDialog
