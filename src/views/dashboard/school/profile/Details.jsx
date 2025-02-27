'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button
} from '@mui/material'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { isCancel } from 'axios'

// Redux Imports
import { setProfile } from '@/redux-store/slices/profile'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError, toastSuccess } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { getInitials } from '@/utils/getInitials'
import { titleize } from '@/utils/globalFilters'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'

/**
 * Page
 */
const Details = ({ dictionary, userData }) => {
  // Hooks
  const dispatch = useDispatch()

  // States
  const [preview, setPreview] = useState(userData?.profileImage)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      onSubmitFileUpload(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreview(reader.result)
      }

      reader.readAsDataURL(file)
    } else {
      toastError('Please select a valid file.')
    }
  }

  const onSubmitFileUpload = async file => {
    const apiFormData = new FormData()

    apiFormData.append('file', file)

    setIsFormSubmitLoading(true)
    await axiosApiCall
      .post(API_ROUTER.SCHOOL_ADMIN.UPLOAD_PROFILE_IMAGE, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        dispatch(setProfile(responseBody.response.userData))
        setIsFormSubmitLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <List>
          <ListItem className='flex justify-center'>
            <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
              <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
                <CustomAvatar
                  src={preview || '/'}
                  alt={`${userData?.first_name} ${userData?.last_name}`}
                  size={120}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(titleize(userData?.first_name + ' ' + userData?.last_name))}
                </CustomAvatar>
              </div>
              <div className='block m-auto text-center'>
                <i className='tabler-edit text-textSecondary' />
              </div>
            </label>
            <input
              accept='image/*'
              style={{ display: 'none' }}
              id='imageUpload'
              type='file'
              onChange={handleImageChange}
            />
          </ListItem>

          {/* <ListItem>
            <Avatar
              sx={{
                textAlign: 'center',
                bgcolor: 'transparent',
                width: 64,
                height: 64,
                mx: 'auto',
                borderRadius: 2
              }}
            >
              <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
                <Avatar alt={userData.first_name + ' ' + userData.last_name || ''} src={preview || ''} />
                <EditIcon />
              </label>
              <input
                accept='image/*'
                style={{ display: 'none' }}
                id='imageUpload'
                type='file'
                onChange={handleImageChange}
              />
            </Avatar>
          </ListItem> */}

          <ListItem>
            <ListItemText
              className='text-center capitalize'
              primary={`${userData?.first_name || ''} ${userData?.last_name || ''}`}
            />
          </ListItem>
        </List>

        <Typography variant='h6' gutterBottom>
          {dictionary?.page?.common?.details}
        </Typography>

        <Divider></Divider>

        <div className='mt-2'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.name}:</Typography>
              <Typography className='capitalize'>{`${userData?.first_name} ${userData?.last_name}`}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.school_name}:</Typography>
              <Typography className='capitalize'>{userData?.schoolName}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.country}:</Typography>
              <Typography>{userData?.location?.country || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>
                {dictionary?.form?.label?.email_address}:
              </Typography>
              <Typography>{userData?.email || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.phone_number}:</Typography>
              <Typography>{userData?.phoneNo || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>
                {dictionary?.form?.label?.school_address}:
              </Typography>
              <Typography>{userData?.location?.address || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>
                {dictionary?.form?.label?.expected_delivery_time}:
              </Typography>
              <Typography>{userData?.expectedDeliveryTime || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2 justify-center'>
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  children: `${dictionary?.common?.change_password}`,
                  variant: 'contained'
                }}
                dialog={ChangePasswordDialog}
                dialogProps={{ dictionary }}
              />
            </div>
          </div>
        </div>

        {/* <Box display='flex' flexDirection='column' gap={2}>
          <Box display='flex' justifyContent='space-between'>
            <Typography variant='body1' fontWeight='bold'>
              {dictionary?.form?.label?.vendor_name + ' :'}
            </Typography>
            <Typography variant='body1'>
              {(userData?.first_name ? userData?.first_name : '-') +
                ' ' +
                (userData?.last_name ? userData?.last_name : '')}
            </Typography>
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Typography variant='body1' fontWeight='bold'>
              {dictionary?.form?.label?.country + ' :'}
            </Typography>
            <Typography variant='body1'>{userData?.location?.country ? userData?.location?.country : '-'}</Typography>
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Typography variant='body1' fontWeight='bold'>
              {dictionary?.form?.label?.email_address + ' :'}
            </Typography>
            <Typography variant='body1'>{userData?.email ? userData.email : '-'}</Typography>
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Typography variant='body1' fontWeight='bold'>
              {dictionary?.form?.label?.phone_number + ' :'}
            </Typography>
            <Typography variant='body1'>{userData?.phoneNo ? userData?.phoneNo : '-'}</Typography>
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Typography variant='body1' fontWeight='bold'>
              {dictionary?.form?.label?.restaurant_name + ' :'}
            </Typography>
            <Typography variant='body1'>{userData?.companyName ? userData?.companyName : '-'}</Typography>
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Typography variant='body1' fontWeight='bold'>
              {dictionary?.form?.label?.business_description + ' :'}
            </Typography>
            <Typography variant='body1'>{userData?.description ? userData?.description : '-'}</Typography>
          </Box>
        </Box> */}
      </CardContent>
    </Card>
  )
}

export default Details
