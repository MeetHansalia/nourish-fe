'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
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
  Typography
} from '@mui/material'

// Third-party Imports
import { useDispatch } from 'react-redux'

// Redux Imports
import { setProfile } from '@/redux-store/slices/profile'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError, toastSuccess } from '@/utils/globalFunctions'
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
    axiosApiCall
      .post(API_ROUTER.VENDOR.VENDOR_UPLOAD_PROFILE, apiFormData, {
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
        console.log('error', error)
        toastError('Something went wrong, please try again!')
      })
  }

  return (
    <Card className='card-shadow-common p-0'>
      <CardHeader />
      <CardContent className='p-0'>
        <List className='profile-block-img'>
          <ListItem className='flex justify-center'>
            <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
              <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
                <CustomAvatar
                  src={preview || '/'}
                  alt={`${userData?.first_name} ${userData?.last_name}`}
                  size={146}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(titleize(userData?.first_name + ' ' + userData?.last_name))}
                </CustomAvatar>
              </div>
              <div className='edit-profile'>
                <i className='tabler-pencil' />
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
