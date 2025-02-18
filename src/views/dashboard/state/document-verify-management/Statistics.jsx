'use client'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'

// View Imports
import { getPanelName, toastError } from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null, suspendedAccountNumbers } = props

  // HOOKS
  const { lang: locale } = useParams()
  const pathname = usePathname()

  const [statisticData, setStatisticData] = useState([])

  // Vars
  const panelName = getPanelName(pathname)

  const [isLoading, setIsLoading] = useState(false)

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.STATE.STATISTIC)
      .then(response => {
        setStatisticData(response?.data?.response)
        setIsLoading(false)
      })
      .catch(error => {
        toastError(error.response.message)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    getStatistics()
  }, [])

  // console.log('statisticData', statisticData)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={4}>
        <Link href={`/${locale}/${panelName}/document-verify/school-registration-request`}>
          <Card>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.common?.School_registration_request}</Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Typography color='text.primary' className='font-bold text-3xl'>
                    {isLoading ? <CircularProgress size={20} /> : numberFormat(statisticData?.schoolDocumentRequests)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Link
          href={`/${locale}/${panelName}/document-verify/parent-registration-request
        `}
        >
          <Card>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.common?.parent_registration_request}</Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Typography color='text.primary' className='font-bold text-3xl'>
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      numberFormat(statisticData?.parentRegistrationRequests)
                    )}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Link href={`/${locale}/${panelName}/document-verify/vendor-registration-request`}>
          <Card>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.common?.Vendor_registration_request}</Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Typography color='text.primary' className='font-bold text-3xl'>
                    {isLoading ? <CircularProgress size={20} /> : numberFormat(statisticData?.vendorDocumentRequests)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Link href={`/${locale}/${panelName}/document-verify/threshold-registration-request`}>
          <Card>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>
                  {dictionary?.page?.order_management?.vendor_minimum_thresholds_verfication_requests}
                </Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Typography color='text.primary' className='font-bold text-3xl'>
                    {isLoading ? <CircularProgress size={20} /> : numberFormat(statisticData?.vendorThresholdRequests)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </Grid>
    </Grid>
  )
}

export default Statistics
