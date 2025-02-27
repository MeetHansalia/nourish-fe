'use client'

import { useEffect, useState } from 'react'

import { Grid, Stack } from '@mui/material'

import Statistics from './Statistics'

import OrderDataTable from '../vendor-management/vendor-threshold/OrderDataTable'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError } from '@/utils/globalFunctions'
import LocationSelectorForm from './LocationSelectorForm'
import LastMomentOrderDataTable from './last-moment-cancellation/LastMomentOrderDataTable'
import MealMonitoring from './meal-monitoring'

const OrderManagement = props => {
  const { dictionary = null } = props
  const [totalCount, setTotalCount] = useState(null)

  const [showDropDdown, setShowDropDown] = useState({
    last_moment_cancellation: true,
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
    // getStatistics()
  }, [])

  return (
    <Stack spacing={6} className='full-width-custom'>
      {/* <Grid container spacing={2}>
        {CARD_TITLE_DATA?.map((card, index) => (
          <Grid item xs={6} sm={2} md={4} key={index}>
            <Statistics title={card?.title} link={card?.link} count={card?.count} dictionary={dictionary} />
          </Grid>
        ))}
      </Grid> */}
      {/* <Statistics dictionary={dictionary} />
      <OrderDataTable dictionary={dictionary} /> */}

      <Grid container spacing={6} className='full-width-custom'>
        <Grid item xs={6} sm={2} md={12} className='pl-0'>
          <Statistics dictionary={dictionary} setShowDropDown={setShowDropDown} showDropDdown={showDropDdown} />
          <LastMomentOrderDataTable dictionary={dictionary} />
          {/* {showDropDdown.last_moment_cancellation && <LastMomentOrderDataTable dictionary={dictionary} />}
          {showDropDdown.meal_monitoring && (
            // <LocationSelectorForm dictionary={dictionary} showButton={true} spacing={6} lg={6} />
            <MealMonitoring dictionary={dictionary} />
          )} */}
        </Grid>
      </Grid>
    </Stack>
  )
}

export default OrderManagement
