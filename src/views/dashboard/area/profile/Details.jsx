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
  Typography
} from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getFullName, getPanelName } from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'

/**
 * Page
 */
const Details = ({ dictionary, userData, setSelectedFile }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  // States
  const [preview, setPreview] = useState(userData?.profileImage)

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setSelectedFile(file)
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
    <Card>
      <CardHeader />
      <CardContent>
        <List>
          <ListItem className='flex justify-center'>
            <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
              <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
                <CustomAvatar
                  src={preview || '/'}
                  alt={getFullName({ first_name: userData?.first_name, last_name: userData?.last_name })}
                  size={120}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(getFullName({ first_name: userData?.first_name, last_name: userData?.last_name }))}
                </CustomAvatar>
              </div>
              <div className='flex justify-center items-center'>
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
          <ListItem className='flex justify-center items-center'>
            <Chip variant='tonal' size='small' label={dictionary?.page?.common?.area} color='primary' />
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
              <Typography className='capitalize'>{dictionary?.page?.common?.area}</Typography>
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
