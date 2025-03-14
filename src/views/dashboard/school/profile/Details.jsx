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
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { getInitials } from '@/utils/getInitials'
import { titleize } from '@/utils/globalFilters'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import { AVATARS } from '@/utils/constants'
import UploadProfileDialog from '@/components/UploadProfileDialog'

/**
 * Page
 */
const Details = ({ dictionary, userData, setSelectedAvatar, selectedAvatar }) => {
  // Hooks
  const dispatch = useDispatch()

  // States
  const [preview, setPreview] = useState()
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isNewImageOrAvatarSelected, setIsNewImageOrAvatarSelected] = useState(false)

  const handleImageChange = event => {
    const fileInput = event.target
    const file = fileInput.files[0]

    setIsNewImageOrAvatarSelected(true)
    setSelectedAvatar(null)
    setSelectedFile(null)

    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))

      fileInput.value = ''
    } else {
      toastError('Please select a valid file.')
    }
  }

  const handleAvatarChange = (avatarName, avatarUrl) => {
    setIsNewImageOrAvatarSelected(true)
    setSelectedFile(null)
    setSelectedAvatar(avatarName)
    setPreview(avatarUrl)
  }

  const onSubmitFileUpload = async onSuccess => {
    if (!selectedFile && !selectedAvatar) return

    const apiFormData = new FormData()

    if (selectedFile) {
      apiFormData.append('file', selectedFile)
    }

    if (!selectedFile && selectedAvatar) {
      apiFormData.append('avtar', selectedAvatar)
    }

    setIsUploading(true)

    try {
      const response = await axiosApiCall.post(API_ROUTER.UPLOAD_PROFILE_IMAGE, apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const responseBody = response?.data

      dispatch(setProfile(responseBody?.response?.userData))
      const profileImage = responseBody?.response?.userData?.profileImage
      const avatar = responseBody?.response?.userData?.avtar

      if (profileImage) {
        setPreview(profileImage)
      } else {
        setSelectedAvatar(avatar)
      }

      onSuccess()
    } catch (error) {
      setPreview(null)

      if (!isCancel(error)) {
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const existingImage =
    preview || (typeof userData?.avtar === 'string' && AVATARS[userData?.avtar]) || userData?.profileImage

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <List>
          <ListItem className='flex justify-center'>
            <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
              <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
                <CustomAvatar
                  src={existingImage}
                  alt={`${userData?.first_name} ${userData?.last_name}`}
                  size={120}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(titleize(userData?.first_name + ' ' + userData?.last_name))}
                </CustomAvatar>
              </div>
              {/* <div className='block m-auto text-center'>
                <i className='tabler-edit text-textSecondary' />
              </div> */}
              <div className='edit-profile'>
                <OpenDialogOnElementClick
                  element={Button}
                  elementProps={{
                    children: <i className='tabler-pencil' />
                  }}
                  dialog={UploadProfileDialog}
                  dialogProps={{
                    handleImageChange,
                    onSubmitFileUpload,
                    isUploading,
                    handleAvatarChange,
                    isNewImageOrAvatarSelected,
                    userData,
                    existingImage
                  }}
                />
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
          {/* <ListItem className='text-center capitalize'>
            <Box display='flex' gap={1}>
              {Object.entries(AVATARS).map(([avatarName, avatarUrl]) => (
                <Avatar
                  key={avatarName}
                  src={avatarUrl}
                  alt={avatarName}
                  sx={{ width: 40, height: 40, cursor: 'pointer' }}
                  onClick={() => {
                    selectAvatar(avatarName, avatarUrl)
                  }}
                />
              ))}
            </Box>
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
