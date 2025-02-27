'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import { Button, Card, CardContent, CardHeader, CircularProgress, Grid, Radio, Typography, Avatar } from '@mui/material'

// Third-party Imports
import { isCancel } from 'axios'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { getFullName, getPanelName } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { getInitials } from '@/utils/getInitials'

// Component Imports
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ProfileViewDialog from './ProfileViewDialogBox'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'
import CustomIconButton from '@/@core/components/mui/IconButton'
import FullPageLoader from '@/components/FullPageLoader'

/**
 * Page
 */
const KidListing = ({ dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  // states
  const [kidData, setKidData] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    axiosApiCall
      .get(API_ROUTER.PARENT.KID_DASHBOARD)
      .then(response => {
        setKidData(response?.data?.response?.userData)
        setIsDataLoaded(true)
      })
      .catch(error => {
        console.error('Error fetching roles:', error)
        setIsDataLoaded(true)
      })
  }, [])

  const handleAddKid = () => {
    router.push(getLocalizedUrl(`/${panelName}/kid-profile-management/kid-create`, locale))
  }

  const handleUpdateKid = id => {
    router.push(getLocalizedUrl(`/${panelName}/kid-profile-management/kid-update/${id}`, locale))
  }

  const handleSelectKid = id => {
    router.push(getLocalizedUrl(`/${panelName}/meal-selection/${id}`, locale))
  }

  // Get Notification popups (kid request aprove/reject/pending)
  useEffect(() => {
    axiosApiCall
      .get(API_ROUTER.NOTIFICATIONS.GET_NOTIFICATIONS)
      .then(response => {
        setAlertDetails(response?.data?.response)

        response.data.response.length > 0 && setOpen(true)
      })
      .catch(error => {
        if (!isCancel(error)) {
          // setIsDataLoaded(true)
          // const apiResponseErrorHandlingData = apiResponseErrorHandling(error)
          // toastError(apiResponseErrorHandlingData)
        }
      })
  }, [])

  return (
    <>
      {isDataLoaded ? (
        <Card className='common-block-dashboard'>
          <div className='common-block-title'>
            <CardHeader
              className='p-0 w-100'
              title={dictionary?.page?.parent_kid_management?.kid_profile}
              action={
                <Button
                  variant='contained'
                  className='theme-common-btn min-width-auto'
                  type='button'
                  onClick={handleAddKid}
                >
                  {'+ ' + dictionary?.page?.parent_kid_management?.add_another_kid}
                </Button>
              }
            />
          </div>
          <CardContent className='p-0'>
            <Grid container spacing={6}>
              {kidData.map((kid, index) => (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  key={kid._id}
                  className={kid.verificationStatus === 'pending' ? 'opacity-50 pointer-events-none' : ''}
                >
                  <div
                    className='kids-profile-me border rounded sm:items-center flex-col !items-start sm:flex-row gap-2 cursor-pointer'
                    onClick={() => handleSelectKid(kid._id)}
                  >
                    <div className='kids-profile-me-inner'>
                      <div className='flex justify-between w-full'>
                        <div className='flex items-center gap-2'>
                          <Typography className='title-semi-medium-custom' color='text.primary'>
                            {getFullName({ first_name: kid?.first_name, last_name: kid?.last_name })}
                          </Typography>
                        </div>
                        <CustomAvatar
                          size={25}
                          color='primary'
                          src={kid?.imageUrl}
                          alt={getFullName({ first_name: kid?.first_name, last_name: kid?.last_name })}
                        >
                          {getInitials(getFullName({ first_name: kid?.first_name, last_name: kid?.last_name }))}
                        </CustomAvatar>
                      </div>
                      <div className='details-kids-profile'>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.page?.common?.school +
                                ' : ' +
                                (kid?.schoolId?.schoolName ? kid?.schoolId?.schoolName : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.age + ' : ' + (kid?.age ? kid?.age : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.class + ' : ' + (kid?.class ? kid?.class : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.grade + ' : ' + (kid?.grade ? kid?.grade : ' -')}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.gender + ' : ' + (kid?.gender ? kid?.gender : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.weight + ' : ' + (kid?.weight ? kid?.weight : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.height + ' : ' + (kid?.height ? kid?.height : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.verification_status +
                                ' : ' +
                                (kid?.verificationStatus ? kid?.verificationStatus : ' -')}
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                      <div className='flex items-center justify-end gap-4'>
                        <CustomIconButton
                          color='primary'
                          variant='contained'
                          size='small'
                          className='rounded-full'
                          disabled={kid.verificationStatus === 'pending'}
                          onClick={e => {
                            e.stopPropagation() // Prevent the card click from triggering
                            window.location.href = getLocalizedUrl(
                              `/${panelName}/kid-profile-management/kid-update/${kid._id}`,
                              locale
                            )
                          }}
                        >
                          <i className='tabler-pencil' />
                        </CustomIconButton>
                      </div>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>

            {kidData.length === 0 && (
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.datatable?.common?.no_data_available}
              </Typography>
            )}
          </CardContent>
          <OpenDialogOnElementClick
            elementProps={{
              variant: 'outlined',
              color: 'primary'
            }}
            dialog={ProfileViewDialog}
            dialogProps={{ dictionary }}
          />
        </Card>
      ) : (
        <div className='text-center'>
          <FullPageLoader open={true} color='primary' spinnerSize={60} />
        </div>
      )}
    </>
  )
}

export default KidListing
