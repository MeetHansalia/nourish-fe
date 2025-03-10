'use client'

// React Imports
import { useRef, useState, useEffect, use } from 'react'

// MUI Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { useSelector } from 'react-redux'

import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getPanelName, toastError } from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { globalState } from '@/redux-store/slices/global'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = params => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [notificationsState, setNotificationsState] = useState(null)
  // let { notificationCount } = useSelector(globalState)
  const router = useRouter()
  const pathname = usePathname()
  const { lang: locale } = useParams()

  // Vars
  const panelName = getPanelName(pathname)

  const getNotificationList = async () => {
    try {
      // const response = await axiosApiCall.get(API_ROUTER.NOTIFICATIONLIST)
      const response = await axiosApiCall.get(API_ROUTER.NOTIFICATIONLIST, {
        params: {
          page: 1,
          limit: 5
        }
      })

      const allOrders = response?.data?.response?.notifications || []

      setNotificationsState(allOrders || 0)
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }
  }

  useEffect(() => {
    getNotificationList()
  }, [])
  // Vars
  let notificationCount = notificationsState?.filter(notification => !notification.isViewd).length
  const readAll = notificationsState?.every(notification => notification.isViewd)

  // Refs
  const anchorRef = useRef(null)
  const ref = useRef(null)

  // Hooks
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Read notification when notification is clicked
  const handleReadNotification = (event, value, index) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications[index].isViewd = value
    setNotificationsState(newNotifications)
  }

  // Remove notification when close icon is clicked
  const handleRemoveNotification = (event, index) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications.splice(index, 1)
    setNotificationsState(newNotifications)
  }

  const redirectPage = () => {
    setOpen(false)
    router.push(`/${locale}/${panelName}/notifications`)
  }

  // Read or unread all notifications when read all icon is clicked
  const readAllNotifications = async () => {
    const newNotifications = [...notificationsState]

    newNotifications.forEach(notification => {
      notification.isViewd = !readAll
    })
    setNotificationsState(newNotifications)

    // try {
    //   // const response = await axiosApiCall.get(API_ROUTER.NOTIFICATIONLIST)
    //   const response = await axiosApiCall.patch(API_ROUTER.READALLNOTIFICATION)

    //   if (response?.data?.status) {
    //     setAllRead(true)
    //     getNotificationList()
    //   }
    // } catch (error) {
    //   if (error.name !== 'AbortError') {
    //     // Handle errors only if it's not an abort error
    //     toastError(error?.response?.data?.message)
    //   }
    // }
  }

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-3 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      Notifications
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip size='small' variant='tonal' color='primary' label={`${notificationCount} New`} />
                    )}
                    <Tooltip
                      title={readAll ? 'Mark all as unread' : 'Mark all as read'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      {notificationsState?.length > 0 ? (
                        <IconButton size='small' onClick={() => readAllNotifications()} className='text-textPrimary'>
                          <i className={readAll ? 'tabler-mail' : 'tabler-mail-opened'} />
                        </IconButton>
                      ) : (
                        <></>
                      )}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {notificationsState?.length > 0 ? (
                      notificationsState.map((notification, index) => {
                        const { title, subtitle, createdAt, isViewd } = notification

                        return (
                          <div
                            key={index}
                            className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                              'border-be': index !== notificationsState.length - 1
                            })}
                            onClick={e => handleReadNotification(e, true, index)}
                          >
                            <div className='flex flex-col flex-auto'>
                              <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                                {title}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' className='mbe-2'>
                                {subtitle}
                              </Typography>
                              <Typography variant='caption' color='text.disabled'>
                                {createdAt}
                              </Typography>
                            </div>
                            <div className='flex flex-col items-end gap-2'>
                              <Badge
                                variant='dot'
                                color={isViewd ? 'secondary' : 'primary'}
                                onClick={e => handleReadNotification(e, !isViewd, index)}
                                className={classnames('mbs-1 mie-1', {
                                  'invisible group-hover:hide': isViewd
                                })}
                              />
                              <i
                                className='tabler-x text-xl invisible group-hover:visible'
                                onClick={e => handleRemoveNotification(e, index)}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className='flex justify-center items-center p-4'>
                        <Typography variant='body2' color='text.secondary'>
                          No Notifications
                        </Typography>
                      </div>
                    )}
                  </ScrollWrapper>
                  {notificationsState?.length > 0 && (
                    <>
                      <Divider />
                      <div className='p-4'>
                        <Button fullWidth variant='contained' size='small' onClick={() => redirectPage()}>
                          View All Notifications
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
