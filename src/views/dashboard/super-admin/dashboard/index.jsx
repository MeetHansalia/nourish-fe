'use client'

// Mui Imports
import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

// Component Imports
import Statistics from './StatisticsCard'
import BelowStatistics from './BelowStatisticsCard'
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

import { useTranslation } from '@/utils/getDictionaryClient'

import MonthlyOrdersChart from '../../common/MonthlyOrdersChart'

const SuperAdminDashboard = () => {
  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)

  const CARD_TITLE_DATA = [
    {
      title: t('form.label.total_orders'),
      // link: 'total-orders',
      key: 'totalOrders'
    },
    {
      title: t('form.label.total_profiles'),
      // link: 'complete-orders',
      key: 'totalProfiles'
    },
    {
      title: t('form.label.total_sales'),
      // link: 'reject-orders',
      key: 'totalSales'
    },
    {
      title: t('form.label.total_income'),
      // link: 'minimum-thresholds',
      key: 'totalIncome'
    }
  ]

  const CARD_TITLE_DATA_BELOW = [
    {
      title: 'Revenue Growth',
      // link: 'total-orders',
      key: 'revenueGrowth'
    },
    {
      title: 'Sales',
      // link: 'complete-orders',
      key: 'sales'
    }
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_USER.STATISTIC)
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
        <div className='card-block-inner four-block-card'>
          {CARD_TITLE_DATA?.map((card, index) => (
            <div className='card-block' key={index}>
              <Statistics title={card?.title} link={card?.link} isLoading={isLoading} value={statisticData[card.key]} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <MonthlyOrdersChart />
      </div>

      <div className='top-block-card'>
        <div className='card-block-inner two-block-card'>
          {CARD_TITLE_DATA_BELOW?.map((card, index) => (
            <div className='card-block' key={index}>
              <BelowStatistics
                title={card?.title}
                link={card?.link}
                isLoading={isLoading}
                value={statisticData[card.key]}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default SuperAdminDashboard
