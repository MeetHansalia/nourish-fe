'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter, usePathname } from 'next/navigation'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box
} from '@mui/material'

// Core Component Imports
import { useDispatch } from 'react-redux'

import { isCancel } from 'axios'

import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import {
  apiResponseErrorHandling,
  getFullName,
  getPanelName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError
} from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import { AVATARS } from '@/utils/constants'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { setProfile } from '@/redux-store/slices/profile'
import UploadProfileDialog from '@/components/UploadProfileDialog'

/**
 * Page
 */
const Details = ({ dictionary, userData, selectedAvatar, setSelectedAvatar }) => {
  // Hooks
  const dispatch = useDispatch()
  const { lang: locale } = useParams()
  const router = useRouter()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

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
                  alt={getFullName({ first_name: userData?.first_name, last_name: userData?.last_name })}
                  size={120}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(getFullName({ first_name: userData?.first_name, last_name: userData?.last_name }))}
                </CustomAvatar>
              </div>
              {/* <div className='flex justify-center items-center'>
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
                    selectAvatar(avatarName, avatarUrl) // Ensure we set avatar name, not URL
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
          <ListItem className='flex justify-center items-center'>
            <Chip variant='tonal' size='small' label={dictionary?.page?.common?.staff} color='primary' />
          </ListItem>
        </List>
        <Typography variant='h6' gutterBottom>
          {dictionary?.page?.common?.details}
        </Typography>

        <Divider></Divider>

        <div className='mt-2'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.admin_name}:</Typography>
              <Typography className='capitalize'>{`${userData?.first_name} ${userData?.last_name}`}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.role}:</Typography>
              <Typography className='capitalize'>{dictionary?.page?.common?.staff}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>
                {dictionary?.form?.label?.email_address}:
              </Typography>
              <Typography>{userData?.email || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.status}:</Typography>
              <Typography>
                {userData?.status ? userData.status.charAt(0).toUpperCase() + userData.status.slice(1) : <i>N/A</i>}
              </Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.dialog?.contact}:</Typography>
              <Typography>{userData?.phoneNo || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.language}:</Typography>
              <Typography>{locale || <i>N/A</i>}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-2'>
              <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.country}:</Typography>
              <Typography>
                {userData?.location?.country ? (
                  userData?.location?.country.charAt(0).toUpperCase() + userData?.location?.country.slice(1)
                ) : (
                  <i>N/A</i>
                )}
              </Typography>
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
