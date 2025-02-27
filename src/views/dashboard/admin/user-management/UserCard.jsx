// React Imports
import { useEffect } from 'react'

// NEXT Imports
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import { Typography, Box, Button } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { getFullName, getPanelName } from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'

/**
 * Page
 */
const UserCard = ({
  user,
  dictionary,
  handleSuspendUser,
  handleDeleteUser,
  userAccessHandler,
  isGetUserAccessLoading = false,
  userOperationPermissions
}) => {
  // Hooks
  const { lang: locale } = useParams()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  const onAccessButtonClickHandler = (id = null) => {
    if (typeof userAccessHandler === 'function') {
      userAccessHandler(id)
    }
  }

  // useEffect(() => {
  //   if (user?._id === '67a206d6b4da3393bfa21124') {
  //     console.log('UserCard: userOperationPermissions: ', userOperationPermissions)
  //   }
  // }, [userOperationPermissions])

  return (
    <div className='two-block-card-common-block'>
      <div className='top-block-user-create'>
        <Typography className='capitalize' variant='h6' fontWeight={600} sx={{ mb: 0.5 }}>
          {getFullName({ first_name: user?.first_name, last_name: user?.last_name })}
        </Typography>
        <CustomAvatar
          size={40}
          color='primary'
          src={user?.profileImage}
          alt={getFullName({ first_name: user?.first_name, last_name: user?.last_name })}
        >
          {getInitials(getFullName({ first_name: user?.first_name, last_name: user?.last_name }))}
        </CustomAvatar>
      </div>

      <div className='two-block-user-middle'>
        <Box display='flex' flexDirection='column' justifyContent='flex-start' mt={1}>
          <Typography variant='body2' color='textPrimary'>
            {dictionary?.page?.user_management?.users?.admin_country}: <span>{user?.location?.country}</span>
          </Typography>
          <Typography variant='body2' color='textPrimary'>
            {dictionary?.page?.user_management?.users?.email}: <span>{user?.email}</span>
          </Typography>
        </Box>
      </div>
      <div className='two-block-user-bottom'>
        <div className='left-two-block'>
          {userOperationPermissions?.access_user && (
            <Button
              variant='contained'
              className='theme-common-btn'
              disabled={isGetUserAccessLoading}
              onClick={() => onAccessButtonClickHandler(user?._id)}
            >
              {dictionary?.common?.access}
            </Button>
          )}
        </div>
        <div className='right-two-block'>
          {userOperationPermissions?.get_user_details && userOperationPermissions?.update_user && (
            <Link className='edit-icon-block' href={`/${locale}/${panelName}/user-management/user-update/${user?._id}`}>
              <Button>
                {' '}
                <i className='tabler-pencil text-textSecondary'></i>
              </Button>
            </Link>
          )}

          {userOperationPermissions?.suspend_user && user?.role === 'Vendor' && (
            <Button className='alert-icon-block' onClick={() => handleSuspendUser(user?._id)}>
              <i className='tabler-alert-small text-textSecondary'></i>
            </Button>
          )}

          {userOperationPermissions?.delete_user && (
            <Button className='delete-icon-block' onClick={() => handleDeleteUser(user?._id)}>
              <i className='tabler-trash text-textSecondary'></i>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserCard
