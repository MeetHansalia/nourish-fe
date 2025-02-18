'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import { Avatar, Card, CardContent, CardHeader, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { toastError } from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'
import { titleize } from '@/utils/globalFilters'

/**
 * Page
 */
const Details = ({ dictionary, userData, setProfileUploadedFile }) => {
  const [preview, setPreview] = useState(userData?.profileImage)

  const selectedGender = userData?.gender
    ? dictionary?.form?.dropdown?.genders?.find(gender => gender.id === userData?.gender)?.name
    : '-'

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setProfileUploadedFile(file)

      const reader = new FileReader()

      reader.onloadend = () => {
        setPreview(reader.result)
      }

      reader.readAsDataURL(file)
    } else {
      toastError('Please select a valid file.')
    }
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
