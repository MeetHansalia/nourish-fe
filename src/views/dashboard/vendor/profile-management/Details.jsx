'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import {
  Avatar,
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
                {/* <IconButton>
                  <i className='tabler-edit text-textSecondary' />
                </IconButton> */}
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
            {/* <Typography variant='h6' gutterBottom className='uppercase text-textPrimary font-medium'>
              {dictionary?.page?.common?.details}
            </Typography>

            <Divider></Divider> */}

            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>
                  {dictionary?.form?.label?.vendor_name}:
                </Typography>
                <Typography className='capitalize'>{`${userData?.first_name} ${userData?.last_name}`}</Typography>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>{dictionary?.form?.label?.country}:</Typography>
                <Typography>{userData?.location?.country || 'N/A'}</Typography>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>
                  {dictionary?.form?.label?.email_address}:
                </Typography>
                <Typography>{userData?.email || 'N/A'}</Typography>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>
                  {dictionary?.form?.label?.phone_number}:
                </Typography>
                <Typography>{userData?.phoneNo || 'N/A'}</Typography>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>
                  {dictionary?.form?.label?.restaurant_name}:
                </Typography>
                <Typography>{userData?.companyName || 'N/A'}</Typography>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>
                  {dictionary?.form?.label?.business_description}:
                </Typography>
                <Typography>{userData?.description || 'N/A'}</Typography>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='text-textPrimary font-medium'>
                  {dictionary?.form?.label?.no_of_venue}:
                </Typography>
                <Typography>{userData?.venues?.length || 0}</Typography>
              </div>
            </div>

            {userData?.venues?.map((venue, index) => (
              <Fragment key={`${index}-venues`}>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='text-textPrimary font-medium'>{`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.address}:`}</Typography>
                    <Typography>{venue?.location?.address || 'N/A'}</Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center flex-wrap gap-2'>
                    <Typography className='text-textPrimary font-medium'>{`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.opening_hours}:`}</Typography>
                    <Typography>
                      {(!venue?.openingTimes || Object.keys(venue?.openingTimes)?.length === 0) && <i>N/A</i>}

                      {Object.entries(venue.openingTimes)?.map(([day, times]) => (
                        <span key={day} className='capitalize'>
                          {`${times.openingTime} - ${times.closingTime} (${day})`} <br />
                        </span>
                      ))}
                    </Typography>
                  </div>
                </div>
              </Fragment>
            ))}
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
