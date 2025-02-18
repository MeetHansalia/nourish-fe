'use client'

import { useEffect, useState } from 'react'

import { Grid, Stack } from '@mui/material'

import Statistics from './Statistics'

import OrderDataTable from './OrderDataTable'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError } from '@/utils/globalFunctions'
import LocationSelectorForm from './LocationSelectorForm'
import LastMomentOrderDataTable from './LastMomentOrderDataTable'

const OrderManagement = props => {
  const { dictionary = null } = props
  const [totalCount, setTotalCount] = useState(null)

  const [showDropDdown, setShowDropDown] = useState({
    last_moment_cancellation: false,
    minimum_threshold: true,
    meal_monitoring: false
  })

  const getStatistics = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.SUPER_ADMIN_USER.STATISTIC)

      const allOrders = response?.data?.response || []

      setTotalCount(allOrders || 0)
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }
  }

  useEffect(() => {
    getStatistics()
  }, [])

  const CARD_TITLE_DATA = [
    {
      title: 'Regular School Order Request',
      link: 'order-management/regular-order-request',
      count: totalCount?.regularOrders
    },
    {
      title: 'Special Event Order Request',
      link: 'order-management/event-order-request',
      count: totalCount?.eventOrders
    },
    {
      title: 'Order Cancellation Request Status',
      link: 'order-management/cancle-order-status',
      count: totalCount?.cancellationRequestsStatus
    }
  ]

  return (
    <Stack spacing={5}>
      {/* <Grid container spacing={2}>
        {CARD_TITLE_DATA?.map((card, index) => (
          <Grid item xs={6} sm={2} md={4} key={index}>
            <Statistics title={card?.title} link={card?.link} count={card?.count} dictionary={dictionary} />
          </Grid>
        ))}
      </Grid> */}
      {/* <Statistics dictionary={dictionary} />
      <OrderDataTable dictionary={dictionary} /> */}

      <Grid container spacing={6}>
        <Grid item xs={6} sm={2} md={12}>
          <Statistics dictionary={dictionary} setShowDropDown={setShowDropDown} />
          {showDropDdown.last_moment_cancellation && <LastMomentOrderDataTable dictionary={dictionary} />}
          {showDropDdown.minimum_threshold && <OrderDataTable dictionary={dictionary} />}

          {showDropDdown.meal_monitoring && (
            <LocationSelectorForm dictionary={dictionary} showButton={true} spacing={4} lg={6} />
          )}
        </Grid>
      </Grid>
    </Stack>
  )
}

export default OrderManagement
