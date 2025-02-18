'use client'

// Mui Imports
import { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

// Component Imports
import Statistics from './StatisticsCard'
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import MonthlyOrdersChart from '../../common/MonthlyOrdersChart'

const VendorDashboard = () => {
  const CARD_TITLE_DATA = [
    {
      title: 'Total Orders',
      //  link: 'total-orders',
      key: 'totalOrders'
    },
    {
      title: 'Complete Orders',
      // link: 'complete-orders',
      key: 'completeOrders'
    },
    {
      title: 'Pending Orders',
      link: 'pending-orders',
      key: 'pendingOrders'
    },
    {
      title: 'Minimum Threshold',
      // link: 'minimum-thresholds',
      key: 'vendorThresholdRequests'
    },
    {
      title: 'Suggestions on menu',
      link: 'suggestions-on-menu',
      key: 'suggestionsOnMenu'
    },
    {
      title: 'Total Revenue'
      // link: 'total-revenue'
    }
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.VENDOR.GET_STATISTIC)
      .then(response => {
        setIsLoading(false)
        setStatisticData(response?.data?.response)
      })
      .catch(error => {
        setIsLoading(false)
        toastError(error?.response?.message)
      })
  }

  // console.log('statisticData', statisticData)

  useEffect(() => {
    getStatistics()
  }, [])

  return (
    <>
      <div className='top-block-card'>
        <div className='card-block-inner'>
          {CARD_TITLE_DATA?.map((card, index) => (
            <div className='card-block' item key={index}>
              <Statistics title={card?.title} link={card?.link} isLoading={isLoading} value={statisticData[card.key]} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <MonthlyOrdersChart />
      </div>
    </>
  )
}

export default VendorDashboard
