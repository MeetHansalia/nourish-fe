'use client'

// Mui Imports
import { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

// Component Imports
import OrdersTableComponent from './OrdersTableComponent'
import Statistics from './StatisticsCard'
import { toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'

const VendorOrderManagementComponent = ({ dictionary }) => {
  const [totalCount, setTotalCount] = useState(null)
  const [updateData, setUpdateData] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.VENDOR.STATISTICS)

      const allOrders = response?.data?.response || []

      setTotalCount(allOrders || 0)
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }
  }

  const getStatisticsMore = async () => {
    await axiosApiCall
      .get(API_ROUTER.VENDOR.GET_STATISTIC)
      .then(response => {
        setStatisticData(response?.data?.response)
      })
      .catch(error => {
        toastError(error?.response?.message)
      })
  }

  useEffect(() => {
    getStatistics()
    getStatisticsMore()
  }, [updateData])

  const CARD_TITLE_DATA = [
    {
      title: 'Regular School Order Request',
      link: 'order-management/regular-order-request',
      count: totalCount?.regularOrders + '/'
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
    },
    {
      title: 'Minimum Threshold Request',
      // link: 'order-management/cancle-order-status',
      count: String(statisticData?.totalOrders) + '/' + String(statisticData?.vendorThresholdRequests)
    }
  ]

  return (
    <>
      {/* <h1>vendor order listing table here</h1> */}
      <Grid container spacing={6}>
        {CARD_TITLE_DATA?.map((card, index) => (
          <Grid item xs={6} sm={4} md={4} key={index}>
            <Statistics title={card?.title} link={card?.link} count={card?.count} totalCount={totalCount} />
          </Grid>
        ))}
      </Grid>

      <OrdersTableComponent dictionary={dictionary} setUpdateData={setUpdateData} updateData={updateData} />
    </>
  )
}

export default VendorOrderManagementComponent
