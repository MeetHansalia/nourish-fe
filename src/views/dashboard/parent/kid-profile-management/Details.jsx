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
const Details = ({ dictionary, kidData, setProfileUploadedFile }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  // States
  const [preview, setPreview] = useState(kidData?.imageUrl)

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
                  src={preview}
                  alt={getFullName({ first_name: kidData?.first_name, last_name: kidData?.last_name })}
                  size={146}
                  skin='light'
                  variant='rounded'
                >
                  {getInitials(getFullName({ first_name: kidData?.first_name, last_name: kidData?.last_name }))}
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
                <Avatar alt={kidData?.first_name + ' ' + kidData?.last_name || ''} src={preview || ''} />
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
              className='title-semi-medium-custom'
              style={{ textAlign: 'center' }}
              primary={getFullName({ first_name: kidData?.first_name, last_name: kidData?.last_name })}
            />
          </ListItem>
          <ListItem className='flex justify-center items-center title-semi-medium-custom'>
            <Chip variant='tonal' size='small' label={dictionary?.page?.common?.kids} color='primary' />
          </ListItem>
        </List>
        <div className='profile-details'>
          <Typography className='title-semi-medium-custom' variant='h6' gutterBottom>
            {dictionary?.page?.common?.details}
          </Typography>

          <div className='mt-2 profile-details-inner'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.kid_name}:</Typography>
                <Typography className='disc-common-custom-small'>
                  {getFullName({ first_name: kidData?.first_name, last_name: kidData?.last_name })}
                </Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.country}:</Typography>
                <Typography className='disc-common-custom-small'>{kidData?.location?.country || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>
                  {dictionary?.form?.label?.school_name}:
                </Typography>
                <Typography className='disc-common-custom-small'>
                  {kidData?.school?.schoolName || <i>N/A</i>}
                </Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.age}:</Typography>
                <Typography className='disc-common-custom-small'>{kidData?.age || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.grade}:</Typography>
                <Typography className='disc-common-custom-small'>{kidData?.grade || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.class}:</Typography>
                <Typography className='disc-common-custom-small'>{kidData?.class || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.gender}:</Typography>
                <Typography className='capitalize'>{kidData?.gender || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.weight}:</Typography>
                <Typography className='disc-common-custom-small'>{kidData?.weight || <i>N/A</i>}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-2'>
                <Typography className='disc-common-custom font-medium'>{dictionary?.form?.label?.height}:</Typography>
                <Typography className='disc-common-custom-small'>{kidData?.height || <i>N/A</i>}</Typography>
              </div>
            </div>
          </div>
        </div>
        {/* <Button
          variant='contained'
          sx={{ m: 1 }}
          type='button'
          onClick={() => {
            router.push(getLocalizedUrl(`/${panelName}/kid-profile-management/kid-create`, locale))
          }}
        >
          {'+ ' + dictionary?.page?.parent_kid_management?.add_another_kid}
        </Button> */}
      </CardContent>
    </Card>
  )
}

export default Details
