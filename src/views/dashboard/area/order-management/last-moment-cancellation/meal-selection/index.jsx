'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useRouter, usePathname, useParams } from 'next/navigation'

// MUI Imports
import { Button, Card, CardContent, CardHeader, CircularProgress, Grid, Radio, Typography, Avatar } from '@mui/material'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { getPanelName } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

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

  const handleNavigateNextStep = id => {
    router.push(getLocalizedUrl(`${panelName}/meal-selection/${id}`, locale))
  }

  return (
    <>
      {isDataLoaded ? (
        <Card>
          <CardHeader title={dictionary?.page?.parent_kid_management?.add_kids_details} />
          <CardContent className='flex flex-col gap-4'>
            <Grid container spacing={2}>
              {kidData.map((kid, index) => (
                <Grid
                  item
                  xs={6}
                  key={kid._id}
                  className={kid.verificationStatus === 'pending' ? 'opacity-50 pointer-events-none' : ''}
                >
                  <div className='flex justify-between border rounded sm:items-center p-6 flex-col !items-start sm:flex-row gap-2'>
                    <div className='flex flex-col items-start gap-2'>
                      <Radio
                        onChange={() => {
                          handleNavigateNextStep(kid._id)
                        }}
                        name='select-kid'
                        disabled={kid.verificationStatus === 'pending'}
                      />
                      <div className='flex items-center gap-2'>
                        <Typography className='font-medium' color='text.primary'>
                          {kid.first_name}
                        </Typography>
                      </div>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography>
                            {dictionary?.page?.common?.school +
                              ' : ' +
                              (kid?.schoolId?.schoolName ? kid?.schoolId?.schoolName : ' -')}
                          </Typography>
                          <Typography>{dictionary?.form?.label?.age + ' : ' + (kid?.age ? kid?.age : ' -')}</Typography>
                          <Typography>
                            {dictionary?.form?.label?.class + ' : ' + (kid?.class ? kid?.class : ' -')}
                          </Typography>
                          <Typography>
                            {dictionary?.form?.label?.grade + ' : ' + (kid?.grade ? kid?.grade : ' -')}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography>
                            {dictionary?.form?.label?.gender + ' : ' + (kid?.gender ? kid?.gender : ' -')}
                          </Typography>
                          <Typography>
                            {dictionary?.form?.label?.weight + ' : ' + (kid?.weight ? kid?.weight : ' -')}
                          </Typography>
                          <Typography>
                            {dictionary?.form?.label?.height + ' : ' + (kid?.height ? kid?.height : ' -')}
                          </Typography>
                          <Typography>
                            {dictionary?.form?.label?.verification_status +
                              ' : ' +
                              (kid?.verificationStatus ? kid?.verificationStatus : ' -')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                    <div className='flex flex-col gap-4'>
                      <div className='flex items-center justify-end gap-4'>
                        <Avatar
                          src={kid?.imageUrl}
                          alt={`${kid.first_name} ${kid.last_name}`}
                          sx={{ width: 25, height: 25 }}
                        />
                        {/* <Button
                          variant='tonal'
                          size='small'
                          onClick={() => {
                            handleUpdateKid(kid._id)
                          }}
                          disabled={kid.verificationStatus === 'pending'}
                        >
                          Edit
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>

            {kidData.length == 0 && (
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.datatable?.common?.no_data_available}
              </Typography>
            )}
          </CardContent>
        </Card>
      ) : (
        <CircularProgress />
      )}
    </>
  )
}

export default MealSelection
