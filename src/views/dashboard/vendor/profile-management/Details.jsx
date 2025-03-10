'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box
} from '@mui/material'

// Third-party Imports
import { useDispatch } from 'react-redux'

// Redux Imports
import { isCancel } from 'axios'

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
// import UploadProfilePictureDialogBox from './UploadProfilePictureDialogBox'
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
          </ListItem>
          <ListItem className='text-center capitalize'>
            {/* Small Avatar Selection */}
            <Box display='flex' gap={1}></Box>
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
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.vendor_name}:
                </Typography>
                <Typography className='capitalize disc-common-custom-small'>{`${userData?.first_name} ${userData?.last_name}`}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.country}:</Typography>
                <Typography className='disc-common-custom-small'>{userData?.location?.country || 'N/A'}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.email_address}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.email || 'N/A'}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.phone_number}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.phoneNo || 'N/A'}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.restaurant_name}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.companyName || 'N/A'}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.business_description}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.description || 'N/A'}</Typography>
              </div>

              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.no_of_venue}:
                </Typography>
                <Typography className='disc-common-custom-small'>{userData?.venues?.length || 0}</Typography>
              </div>

              {userData?.venues?.map((venue, index) => (
                <Fragment key={`${index}-venues`}>
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='disc-common-custom font-medium'>{`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.address}:`}</Typography>
                    <Typography className='disc-common-custom-small'>{venue?.location?.address || 'N/A'}</Typography>
                  </div>
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='disc-common-custom font-medium'>{`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.opening_hours}:`}</Typography>
                    <Typography className='disc-common-custom-small'>
                      {(!venue?.openingTimes || Object.keys(venue?.openingTimes)?.length === 0) && <i>N/A</i>}

                      {Object.entries(venue.openingTimes)?.map(([day, times]) => (
                        <span key={day} className='capitalize disc-common-custom-small'>
                          {`${times.openingTime} - ${times.closingTime} (${day})`} <br />
                        </span>
                      ))}
                    </Typography>
                  </div>
                </Fragment>
              ))}
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
        {/* <List>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.vendor_name + ' :'}
              secondary={
                (userData?.first_name ? userData?.first_name : '-') +
                ' ' +
                (userData?.last_name ? userData?.last_name : '')
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.country + ' :'}
              secondary={userData?.location?.country ? userData?.location?.country : '-'}
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
              primary={dictionary?.form?.label?.phone_number + ' :'}
              secondary={userData?.phoneNo ? userData?.phoneNo : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.restaurant_name + ' :'}
              secondary={userData?.companyName ? userData?.companyName : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.business_description + ' :'}
              secondary={userData?.description ? userData?.description : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={`${dictionary?.form?.label?.no_of_venue}: `}
              // secondary={userData?.numberOfVenue ? userData?.numberOfVenue : 0}
              secondary={userData?.venues?.length || 0}
            />
          </ListItem>
          {userData?.venues?.map((venue, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.address}: ${venue?.location?.address || 'N/A'}`}
                secondary={Object.entries(venue.openingTimes)?.map(([day, times]) => (
                  <span key={day} className='capitalize'>{`${day} : ${times.openingTime} - ${times.closingTime}`}</span>
                ))}
              />
            </ListItem>
          ))}
        </List> */}
      </CardContent>
    </Card>
  )
}

export default Details
