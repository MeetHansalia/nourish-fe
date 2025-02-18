'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

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
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
// import { actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { getFullName, toastError, toastSuccess } from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'

const VendorProfile = props => {
  const { dictionary = null, id } = props

  const router = useRouter()

  const [userData, setUserData] = useState()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Get vendor details api call
  const getSpecificVendoDetail = async id => {
    if (!id) return
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_VENDOR.VENDOR_BY_ID(id))
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

    try {
      const response = await axiosApiCall.patch(API_ROUTER.SUPER_ADMIN_VENDOR.SUSPEND_VENDOR(id), { reason })

      setIsDialogOpen(false)

      setReason('')
      router.back()
      toastSuccess(response.data.message)
    } catch (error) {
      console.log('Failed to suspend vendor:', error)
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
          <Button variant='contained' onClick={() => setIsDialogOpen(true)} disabled={isLoading}>
            {dictionary?.page?.vendor_profile?.button_title}
          </Button>
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
        <Box display='flex' justifyContent='center' alignItems='center' className='p-2'>
          <CircularProgress />
        </Box>
      )}
      {/* 
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
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
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSuspendUser(id)} variant='contained' color='primary' disabled={!reason.trim()}>
            OK
          </Button>
        </DialogActions>
      </Dialog> */}
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
            {/* {isSuspendLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />} */}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default VendorProfile
