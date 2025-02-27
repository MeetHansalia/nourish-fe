// React Imports
import React from 'react'

// NEXT Imports
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import { CardContent, Typography, Grid, Avatar, Box, Button } from '@mui/material'

// Util Imports
import { getFullName, getPanelName } from '@/utils/globalFunctions'
import CustomAvatar from '@/@core/components/mui/Avatar'
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
  isGetUserAccessLoading = false
}) => {
  // Hooks
  // const router = useRouter()
  const { lang: locale } = useParams()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  const onAccessButtonClickHandler = (id = null) => {
    if (typeof userAccessHandler === 'function') {
      userAccessHandler(id)
    }
  }

  return (
    <div className='two-block-card-common-block'>
      <div className='top-block-user-create'>
        <Typography className='capitalize' variant='h6' fontWeight={600} sx={{ mb: 0.5 }}>
          {getFullName({ first_name: user?.first_name, last_name: user?.last_name })}
        </Typography>
        {/* <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
          {user.first_name[0]}
          {user.last_name[0]}
        </Avatar> */}
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
            {user?.role} {dictionary?.form?.label?.country}: <span>{user?.location?.country}</span>
          </Typography>
          <Typography variant='body2' color='textPrimary'>
            {dictionary?.page?.user_management?.users?.email}: <span>{user?.email}</span>
          </Typography>
        </Box>
        {/* <Typography variant='body2' color='textSecondary' mt={1}>
          {dictionary?.}
        </Typography> */}

        {/* </div> */}
        {/* <Button onClick={() => handleSuspendUser(user._id)}>{dictionary?.datatable?.button?.suspend}</Button>
          <Button onClick={() => handleDeleteUser(user._id)}>{dictionary?.form?.button?.delete}</Button>
          <Link href={`/${locale}/${panelName}/user-management/user-update/${user._id}`}>
            <Button>edit</Button>
          </Link>
          <Button
            variant='contained'
            className='theme-common-btn'
            disabled={isGetUserAccessLoading}
            onClick={() => onAccessButtonClickHandler(user._id)}
          >
            Access
          </Button> */}
      </div>
      <div className='two-block-user-bottom'>
        <div className='left-two-block'>
          <Button
            variant='contained'
            className='theme-common-btn'
            disabled={isGetUserAccessLoading}
            onClick={() => onAccessButtonClickHandler(user?._id)}
          >
            {dictionary?.common?.access}
          </Button>
        </div>
        <div className='right-two-block'>
          <Link className='edit-icon-block' href={`/${locale}/${panelName}/user-management/user-update/${user?._id}`}>
            <Button>
              {' '}
              <i className='tabler-pencil text-textSecondary'></i>
            </Button>
          </Link>
          <Button className='alert-icon-block' onClick={() => handleSuspendUser(user?._id)}>
            <i className='tabler-alert-small text-textSecondary'></i>
          </Button>
          <Button className='delete-icon-block' onClick={() => handleDeleteUser(user?._id)}>
            <i className='tabler-trash text-textSecondary'></i>
          </Button>
        </div>
      </div>
      {/* </div> */}
      {/* <Grid>
        <Grid item xs={3}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
            {user.first_name[0]}
            {user.last_name[0]}
          </Avatar>
        </Grid>
        <Grid item xs={9}>
          <CardContent>
            <Typography variant='h6' fontWeight={600} sx={{ mb: 0.5 }}> */}
      {/* {`${user.first_name} ${user.last_name}`} */}
      {/* for testing purpose only */}
      {/* {`${user._id}`}  */}
      {/* </Typography>
            <Box display='flex' justifyContent='space-between' mt={1}>
              <Typography variant='body2' color='textPrimary'>
                {dictionary?.page?.user_management?.users?.email}: {user.email}
              </Typography> */}
      {/* <Typography variant="body2" color="textPrimary">{user.status}</Typography> */}
      {/* </Box>
            <Typography variant='body2' color='textSecondary' mt={1}>
              {user.isApproved
                ? dictionary?.page?.user_management?.users?.is_approved
                : dictionary?.page?.user_management?.users?.is_not_approved}
            </Typography>
            <Button onClick={() => handleSuspendUser(user._id)}>suspend</Button>
            <Button onClick={() => handleDeleteUser(user._id)}>delete</Button>
            <Link href={`/${locale}/${panelName}/user-management/user-update/${user._id}`}>
              <Button>edit</Button>
            </Link>
            <Button
              variant='contained'
              disabled={isGetUserAccessLoading}
              onClick={() => onAccessButtonClickHandler(user._id)}
            >
              Access
            </Button>
          </CardContent>
        </Grid>
      </Grid> */}
    </div>
  )
}

export default UserCard
