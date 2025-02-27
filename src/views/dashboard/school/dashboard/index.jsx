'use client'

// Mui Imports
import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { useTranslation } from '@/utils/getDictionaryClient'

// Component Imports
import Statistics from './StatisticsCard'
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

import MonthlyOrdersChart from '../../common/MonthlyOrdersChart'

const SchoolDashboard = () => {
  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)

  const CARD_TITLE_DATA = [
    {
      title: t('form.label.parent_registration_requests'),
      link: 'parent-registration-request',
      key: 'parentRegistrationRequests'
    },
    {
      title: t('form.label.approved_orders'),
      // link: 'complete-orders',
      key: 'approveOrders'
    },
    {
      title: t('form.label.reject'),
      // link: 'reject-orders',
      key: 'rejectOrders'
    },
    {
      title: t('form.label.total_amount'),
      // link: 'minimum-thresholds',
      key: 'totalAmount'
    },
    {
      title: t('form.label.food_chart')
      // link: 'menu-suggestions'
    },
    {
      title: t('form.label.nutrition_suggestion')
      // link: 'total-revenue'
    }
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.SCHOOL_ADMIN.GET_STATISTIC)
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
            <div className='card-block' key={index}>
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

export default SchoolDashboard
