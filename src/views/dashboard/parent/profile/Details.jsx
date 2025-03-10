'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import { apiResponseErrorHandling, isVariableAnObject, setFormFieldsErrors, toastError } from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'
import { titleize } from '@/utils/globalFilters'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import { AVATARS } from '@/utils/constants'
import UploadProfileDialog from '@/components/UploadProfileDialog'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { setProfile } from '@/redux-store/slices/profile'

/**
 * Page
 */
const Details = ({ dictionary, userData, setSelectedAvatar, selectedAvatar }) => {
  // Hooks
  const dispatch = useDispatch()

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
    <Card className='card-shadow-common p-0'>
      <CardHeader />
      <CardContent className='p-0'>
        <List className='profile-block-img'>
          <ListItem className='flex justify-center'>
            <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
              <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
                <CustomAvatar
                  src={existingImage}
                  alt={`${userData?.first_name} ${userData?.last_name}`}
                  size={146}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(titleize(userData?.first_name + ' ' + userData?.last_name))}
                </CustomAvatar>
              </div>
              {/* <div className='edit-profile'>
                <i className='tabler-pencil' />
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
          <ListItem className='text-center capitalize'>
            {/* Small Avatar Selection */}
            {/* <Box display='flex' gap={1}>
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
            </Box> */}
          </ListItem>
          <ListItem className='mb-4'>
            <ListItemText
              className='text-center capitalize title-semi-medium-custom'
              primary={`${userData?.first_name || ''} ${userData?.last_name || ''}`}
            />
          </ListItem>
        </List>
        <div className='profile-details'>
          <Typography className='title-semi-medium-custom' variant='h6' gutterBottom>
            {dictionary?.page?.common?.details}
          </Typography>

          <div className='profile-details-inner'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.parent_name}:
                </Typography>
                <Typography className='capitalize disc-common-custom-small'>{`${userData?.first_name} ${userData?.last_name}`}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.email_address}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.email || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.phone_number}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.phoneNo || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.address}:</Typography>
                <Typography className='disc-common-custom-small'>
                  {userData?.location?.address || <i>N/A</i>}
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
        </div>

        {/* <List>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.parent_name + ' :'}
              secondary={
                (userData?.first_name ? userData?.first_name : '-') +
                ' ' +
                (userData?.last_name ? userData?.last_name : '')
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={dictionary?.page?.common?.school + ' :'}
              secondary={userData?.schoolName ? userData.schoolName : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.email_address + ' :'}
              secondary={userData?.email ? userData.email : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.page?.common?.contact + ' :'}
              secondary={userData?.phoneNo ? userData?.phoneNo : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText primary={dictionary?.form?.label?.gender + ' :'} secondary={selectedGender} />
          </ListItem>{' '}
        </List> */}
      </CardContent>
    </Card>
  )
}

export default Details
