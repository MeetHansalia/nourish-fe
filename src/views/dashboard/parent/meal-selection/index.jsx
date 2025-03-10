'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useRouter, usePathname, useParams } from 'next/navigation'

// MUI Imports
import { Button, Card, CardContent, CardHeader, CircularProgress, Grid, Radio, Typography, Avatar } from '@mui/material'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'

import { API_ROUTER } from '@/utils/apiRoutes'
import FullPageLoader from '@/components/FullPageLoader'
import { getFullName, getPanelName } from '@/utils/globalFunctions'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import CustomIconButton from '@/@core/components/mui/IconButton'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ProfileViewDialog from '../kid-profile-management/ProfileViewDialogBox'

const MealSelection = ({ dictionary }) => {
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

  const handleSelectKid = id => {
    router.push(getLocalizedUrl(`/${panelName}/meal-selection/${id}`, locale))
  }

  return (
    <>
      {isDataLoaded ? (
        <Card className='common-block-dashboard'>
          <div className='common-block-title'>
            <CardHeader className='p-0 w-100' title={dictionary?.page?.parent_kid_management?.kid_profile} />
          </div>
          <CardContent className='p-0'>
            <Grid container spacing={6}>
              {kidData?.map((kid, index) => {
                let isVerified = kid?.verificationStatus === 'approved' ? true : false

                return (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={6}
                    key={kid?._id}
                    className={!isVerified ? 'opacity-50 pointer-events-none' : ''}
                    disabled={!isVerified}
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
                              {/* <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.age + ' : ' + (kid?.age ? kid?.age : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.class + ' : ' + (kid?.class ? kid?.class : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.grade + ' : ' + (kid?.grade ? kid?.grade : ' -')}
                            </Typography> */}
                            </Grid>

                            <Grid item xs={6}>
                              {/* <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.gender + ' : ' + (kid?.gender ? kid?.gender : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.weight + ' : ' + (kid?.weight ? kid?.weight : ' -')}
                            </Typography>
                            <Typography className='title-small-medium-custom'>
                              {dictionary?.form?.label?.height + ' : ' + (kid?.height ? kid?.height : ' -')}
                            </Typography> */}
                              <Typography className='title-small-medium-custom'>
                                {dictionary?.form?.label?.verification_status +
                                  ' : ' +
                                  (kid?.verificationStatus === 'approved'
                                    ? 'Verified'
                                    : kid?.verificationStatus || ' -')}
                              </Typography>
                            </Grid>
                          </Grid>
                        </div>
                      </div>
                    </div>
                  </Grid>
                )
              })}
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
        <FullPageLoader open={true} color='primary' spinnerSize={60} />
      )}
    </>
  )
}

export default MealSelection
