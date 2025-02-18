'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

// Third Party Imports
import { isCancel } from 'axios'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'

/**
 * Page
 */
const OrderStatistics = props => {
  // Props
  const { dictionary = null } = props

  // States
  const [loading, setLoading] = useState(false)
  const [minThresholdCount, setMinThresholdCount] = useState(0)
  const [eventOrderCount, setEventOrderCount] = useState(0)
  const [deliveryApprovalRequestCount, setDeliveryApprovalRequestCount] = useState(0)

  /**
   * Statistic API Call: Start
   */
  const getEventAndThresholdCounts = async () => {
    try {
      setLoading(true)
      const response = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.GET_STATISTIC_DATA)

      const responseBody = response?.data
      const responseBodyData = responseBody?.response

      setMinThresholdCount(responseBodyData?.vendorThresholdRequests)
      setEventOrderCount(responseBodyData?.eventOrderRequests)
      setDeliveryApprovalRequestCount(responseBodyData?.deliveryApprovalRequests)
    } catch (error) {
      if (!isCancel(error)) {
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        toastError(apiResponseErrorHandlingData)
      }
    } finally {
      setLoading(false)
    }
  }
  /** Statistic API Call: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getEventAndThresholdCounts()
  }, [])
  // Page Life Cycle: End

  return (
    <Box>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <Link href={'order-management'}>
            <Card>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h5'>{dictionary?.page?.order_management?.event_orders_request}</Typography>
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <Typography color='text.primary' className='font-bold text-3xl'>
                      {loading ? <CircularProgress size={20} /> : numberFormat(eventOrderCount)}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={6}>
          <Link href={'order-management/minimum-thresholds-of-vendor'}>
            <Card>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h5'>
                    {dictionary?.page?.order_management?.view_minimum_threshold_of_vendors}
                  </Typography>
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <Typography color='text.primary' className='font-bold text-3xl'>
                      {loading ? <CircularProgress size={20} /> : numberFormat(minThresholdCount)}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={6}>
          <Link href={'order-management/order-delivery-approval'}>
            <Card>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h5'>{dictionary?.page?.order_management?.order_delivery_approval}</Typography>
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <Typography color='text.primary' className='font-bold text-3xl'>
                      {loading ? <CircularProgress size={20} /> : numberFormat(deliveryApprovalRequestCount)}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderStatistics
