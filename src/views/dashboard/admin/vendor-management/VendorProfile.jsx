'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { useSelector } from 'react-redux'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Button,
  DialogActions,
  DialogTitle,
  Dialog,
  DialogContent,
  TextField,
  CardHeader,
  CircularProgress,
  Box
} from '@mui/material'

// Utils Imports
import { isCancel } from 'axios'

import {
  isUserHasPermission,
  apiResponseErrorHandling,
  getFullName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
// import { actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { titleize } from '@/utils/globalFilters'
import { profileState } from '@/redux-store/slices/profile'

const VendorProfile = props => {
  const { dictionary = null, id } = props

  const router = useRouter()
  const { user = null } = useSelector(profileState)
  const [userData, setUserData] = useState()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSuspendLoading, setIsSuspendLoading] = useState(false)

  // Vars
  const isUserHasPermissionSections = useMemo(
    () => ({
      suspend_users: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['suspend_users']
      })
    }),
    [user?.permissions]
  )

  // Get vendor details api call
  const getSpecificVendoDetail = async id => {
    if (!id) return
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.ADMIN.GET_SPECIFIC_VENDOR(id))
      .then(response => {
        // console.log('vendorDetails', response.data)
        setUserData(response?.data?.response || [])
        setIsLoading(false)
      })
      .catch(error => {
        // console.log('issue in vendor call')
        setIsLoading(false)
        toastError(error?.response?.message)
      })
  }

  // Suspend User
  const handleSuspendUser = async id => {
    if (!reason) return
    setIsSuspendLoading(true)

    try {
      const response = await axiosApiCall.patch(API_ROUTER.ADMIN.SUSPEND_VENDOR(id), { reason })

      setIsSuspendLoading(false)
      setIsDialogOpen(false)

      setReason('')
      router.back()
      toastSuccess(response.data.message)
    } catch (error) {
      if (!isCancel(error)) {
        setIsLoading(false)
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
        }
      }
    }
  }

  useEffect(() => {
    getSpecificVendoDetail(id)
  }, [])

  return (
    <Card>
      <CardHeader
        title={dictionary?.page?.vendor_profile?.title}
        action={
          isUserHasPermissionSections?.suspend_users ? (
            <Button
              variant='contained'
              onClick={() => setIsDialogOpen(true)}
              disabled={isLoading}
              className='theme-common-btn'
            >
              {dictionary?.page?.vendor_profile?.button_title}
            </Button>
          ) : null
        }
      />
      <Divider />
      {!isLoading ? (
        <CardContent className='flex justify-around gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <CustomAvatar
                  src={userData?.profileImage}
                  alt={getFullName({ first_name: userData?.first_name, last_name: userData?.last_name })}
                  size={120}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(getFullName({ first_name: userData?.first_name, last_name: userData?.last_name }))}
                </CustomAvatar>
              </div>
              <Chip label={userData?.role} color='secondary' size='small' variant='tonal' />
            </div>
          </div>
          <div>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {dictionary?.page?.vendor_profile?.vendor_name}
                </Typography>
                <Typography>
                  {userData?.first_name} {userData?.last_name}
                </Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {dictionary?.page?.vendor_profile?.country}
                </Typography>
                <Typography>{userData?.location?.country}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {dictionary?.page?.vendor_profile?.email_address}
                </Typography>
                <Typography color='text.primary'>{userData?.email}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {dictionary?.page?.vendor_profile?.phone_number}
                </Typography>
                <Typography color='text.primary'>{userData?.phoneNo}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {dictionary?.page?.vendor_profile?.restaurant_name}
                </Typography>
                <Typography color='text.primary'>{userData?.companyName}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {dictionary?.page?.vendor_profile?.business_description}
                </Typography>
                <Typography color='text.primary'>{userData?.description}</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      ) : (
        <Box display='flex' justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      )}
      {/*---DIALOG BOX---  */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>{dictionary?.page?.vendor_profile?.suspend_vendor}</DialogTitle>
        <DialogContent>
          {/* <Typography variant='body1' mb={2}>
            {dictionary?.page?.vendor_management?.vendor_reject_text}
          </Typography> */}
          <TextField
            label={dictionary?.form?.placeholder?.reason}
            multiline
            rows={4}
            fullWidth
            variant='outlined'
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color='secondary'>
            {dictionary?.form?.button?.cancel}
          </Button>
          <Button
            onClick={() => handleSuspendUser(id)}
            variant='contained'
            color='primary'
            disabled={!reason.trim() || isLoading}
          >
            {dictionary?.form?.button?.ok}
            {isSuspendLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
          </Button>
        </DialogActions>
      </Dialog>
      {/* <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>{dictionary?.page?.vendor_profile?.suspend_vendor}</DialogTitle>
        <DialogContent>
          <TextField
            label='Reason'
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder='Enter the reason'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={isSuspendLoading}>
            {dictionary?.form?.button?.cancel}
          </Button>
          <Button
            onClick={() => handleSuspendUser(id)}
            variant={isSuspendLoading ? 'customLight' : 'contained'}
            // color='primary'
            disabled={!reason.trim() || isSuspendLoading}
          >
            {dictionary?.form?.button?.ok}
            {isSuspendLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
          </Button>
        </DialogActions>
      </Dialog> */}
      {/* <Op */}
    </Card>
  )
}

export default VendorProfile
