'use client'

// Mui Imports
import { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

// Component Importimport { useParams } from 'next/navigation'
import { useTranslation } from '@/utils/getDictionaryClient'

import Statistics from './StatisticsCard'

import axiosApiCall from '@/utils/axiosApiCall'
import { toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

import ReviewTable from './OrderReviewTable'

const StaffDashboard = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  const CARD_TITLE_DATA = [
    {
      title: t('form.label.total_orders'),
      // link: 'total-orders',
      key: 'totalOrders'
    },
    {
      title: t('form.label.approved_orders'),
      // link: 'complete-orders',
      key: 'approveOrders'
    },
    {
      title: t('form.label.rejected_orders'),
      // link: 'reject-orders',
      key: 'rejectOrders'
    },
    {
      title: t('form.label.total_amount'),
      // link: 'minimum-thresholds',
      key: 'totalAmount'
    }
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.STAFF.GET_STATISTIC)
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
        <ReviewTable dictionary={dictionary} />
      </div>
    </>
  )
}

export default StaffDashboard
