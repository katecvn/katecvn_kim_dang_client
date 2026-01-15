import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useState } from 'react'
import LogoutAlertDialog from './LogoutAlertDialog'
import { useSelector } from 'react-redux'
import UserProfileDialog from './UserProfileDialog'
import ChangePasswordDialog from './ChangePasswordDialog'
import { IconKey, IconLogout, IconUserCircle } from '@tabler/icons-react'

const UserNav = () => {
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const avatarFallback = fullName && fullName.charAt(0).toUpperCase()

  const [isOpenLogoutAlertDialog, setIsOpenLogoutAlertDialog] = useState(false)
  const [isOpenProfileDialog, setIsOpenProfileDialog] = useState(false)
  const [isOpenChangePasswordDialog, setIsOpenChangePasswordDialog] =
    useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://ui-avatars.com/api/?bold=true&background=random&name=${authUserWithRoleHasPermissions?.fullName}`}
                alt={authUserWithRoleHasPermissions?.fullName}
              />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {authUserWithRoleHasPermissions?.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {authUserWithRoleHasPermissions.username}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup onClick={() => setIsOpenProfileDialog(true)}>
            <DropdownMenuItem>
              Thông tin cá nhân
              <DropdownMenuShortcut>
                <IconUserCircle className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuGroup
            onClick={() => setIsOpenChangePasswordDialog(true)}
          >
            <DropdownMenuItem>
              Đổi mật khẩu
              <DropdownMenuShortcut>
                <IconKey className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsOpenLogoutAlertDialog(true)}
          >
            Đăng xuất
            <DropdownMenuShortcut>
              <IconLogout className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isOpenProfileDialog && (
        <UserProfileDialog
          showTrigger={false}
          isOpen={isOpenProfileDialog}
          onOpenChange={setIsOpenProfileDialog}
        />
      )}

      {isOpenChangePasswordDialog && (
        <ChangePasswordDialog
          showTrigger={false}
          isOpen={isOpenChangePasswordDialog}
          onOpenChange={setIsOpenChangePasswordDialog}
        />
      )}

      {isOpenLogoutAlertDialog && (
        <LogoutAlertDialog
          isOpen={isOpenLogoutAlertDialog}
          onOpenChange={setIsOpenLogoutAlertDialog}
        />
      )}
    </>
  )
}

export default UserNav
