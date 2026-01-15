import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconAdjustmentsPause,
  IconApps,
  IconClockEdit,
  IconDatabaseCog,
  IconLockOff,
  IconLockOpen,
  IconPencilCog,
  IconUserPlus,
  IconHistory,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import ToggleSchoolStatusAlertDialog from './ToggleSchoolStatusAlertDialog'
import UpdateSchoolPricingPlanDialog from './UpdateSchoolPricingPlanDialog'
import AllowUseKafoodAppDialog from './AllowUseKafoodAppDialog'
import SetStaffSupportSchoolDialog from './SetStaffSupportSchoolDialog'
import { toast } from 'sonner'
import UpdateStorageSizeSettingDialog from '@/views/admin/school/components/UpdateStorageSizeSettingDialog.jsx'
import GoogleCredentialDialog from './GoogleCredentialDialog'
import SchoolLogDialog from './SchoolLogDialog'

const DataTableRowActions = ({ row }) => {
  const [showUpdateSchoolPricingPlan, setShowUpdateSchoolPricingPlan] =
    useState(false)
  const [showToggleSchoolAlertDialog, setShowToggleSchoolAlertDialog] =
    useState(false)
  const [showAllowUseKafoodAppDialog, setShowAllowUseKafoodAppDialog] =
    useState(false)
  const [showSetStaffSupportDialog, setShowSetStaffSupportDialog] =
    useState(false)
  const [showUpdateStorageSizeSetting, setShowUpdateStorageSizeSetting] =
    useState(false)
  const [showGoogleDriveCredentialDialog, setShowGoogleDriveCredentialDialog] =
    useState(false)
  const [showSchoolLogDialog, setShowSchoolLogDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <Can permission="UPDATE_SCHOOL">
            <DropdownMenuItem
              onSelect={() => setShowUpdateSchoolPricingPlan(true)}
            >
              Cập nhật gói
              <DropdownMenuShortcut>
                <IconClockEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="UPDATE_STORAGE_SIZE_SETTING">
            <DropdownMenuItem
              onSelect={() => setShowUpdateStorageSizeSetting(true)}
            >
              Cập nhật dung lượng cài đặt
              <DropdownMenuShortcut>
                <IconDatabaseCog className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="ASSIGN_STAFF_SCHOOL">
            <DropdownMenuItem
              onSelect={() => setShowSetStaffSupportDialog(true)}
            >
              Chỉ định NV phụ trách
              <DropdownMenuShortcut>
                <IconUserPlus className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="UPDATE_SCHOOL">
            <DropdownMenuItem
              className={`${row.original.status === 'active' ? 'text-destructive' : 'text-primary'}`}
              onSelect={() => setShowToggleSchoolAlertDialog(true)}
            >
              {row.original.status === 'active' ? 'Khóa' : 'Kích hoạt'}
              <DropdownMenuShortcut>
                {row.original.status === 'active' ? (
                  <IconLockOff className="h-4 w-4 text-destructive" />
                ) : (
                  <IconLockOpen className="h-4 w-4" />
                )}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="UPDATE_SCHOOL">
            <DropdownMenuItem
              onSelect={() => setShowAllowUseKafoodAppDialog(true)}
            >
              Sử dụng ứng dụng Kafood
              <DropdownMenuShortcut>
                <IconApps className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="UPDATE_SCHOOL">
            <DropdownMenuItem
              onSelect={() =>
                toast.warning('Tính năng đang trong quá trình phát triển')
              }
            >
              QL phân quyền chức năng
              <DropdownMenuShortcut>
                <IconAdjustmentsPause className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="GET_SCHOOL">
            <DropdownMenuItem onSelect={() => setShowSchoolLogDialog(true)}>
              Xem lịch sử truy cập
              <DropdownMenuShortcut>
                <IconHistory className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="GET_SCHOOL">
            <DropdownMenuItem
              onSelect={() => setShowGoogleDriveCredentialDialog(true)}
            >
              QL xác thực cloud
              <DropdownMenuShortcut>
                <IconPencilCog className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      {showToggleSchoolAlertDialog && (
        <ToggleSchoolStatusAlertDialog
          school={row.original}
          isOpen={showToggleSchoolAlertDialog}
          onOpenChange={setShowToggleSchoolAlertDialog}
        />
      )}

      {showAllowUseKafoodAppDialog && (
        <AllowUseKafoodAppDialog
          school={row.original}
          isOpen={showAllowUseKafoodAppDialog}
          onOpenChange={setShowAllowUseKafoodAppDialog}
        />
      )}

      {showUpdateSchoolPricingPlan && (
        <UpdateSchoolPricingPlanDialog
          school={row.original}
          open={showUpdateSchoolPricingPlan}
          onOpenChange={setShowUpdateSchoolPricingPlan}
          showTrigger={false}
        />
      )}

      {showSetStaffSupportDialog && (
        <SetStaffSupportSchoolDialog
          school={row.original}
          open={showSetStaffSupportDialog}
          onOpenChange={setShowSetStaffSupportDialog}
          showTrigger={false}
        />
      )}

      {showUpdateStorageSizeSetting && (
        <UpdateStorageSizeSettingDialog
          school={row.original}
          open={showUpdateStorageSizeSetting}
          onOpenChange={setShowUpdateStorageSizeSetting}
          showTrigger={false}
        />
      )}

      {showGoogleDriveCredentialDialog && (
        <GoogleCredentialDialog
          school={row.original}
          open={showGoogleDriveCredentialDialog}
          onOpenChange={setShowGoogleDriveCredentialDialog}
          showTrigger={false}
        />
      )}

      {showSchoolLogDialog && (
        <SchoolLogDialog
          open={showSchoolLogDialog}
          onOpenChange={setShowSchoolLogDialog}
          school={row.original}
          showTrigger={false}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
