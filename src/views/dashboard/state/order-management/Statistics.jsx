'use client'
// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { useParams, usePathname } from 'next/navigation'

import { Card, CardContent, CircularProgress, Typography } from '@mui/material'

// Core Component Imports
import { isCancel } from 'axios'

import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import {
  apiResponseErrorHandling,
  getPanelName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError
} from '@/utils/globalFunctions'
import Link from '@/components/Link'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null, setShowDropDown, showDropDdown } = props
  const [orderStatistics, setOrderStatistics] = useState(0)
  const [isLoadingStatistic, setIsLoadingStatistic] = useState(false)

  // HOOKS
  // const handleNavigation = () => {
  //   setShowDropDown(!showDropDdown)
  // }
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const panelName = getPanelName(pathname)

  const handleClick = name => {
    setShowDropDown(prevState => {
      switch (name) {
        case 'last_moment_cancellation':
          return {
            last_moment_cancellation: true,
            meal_monitoring: false
          }
        case 'meal_monitoring':
          return {
            last_moment_cancellation: false,
            meal_monitoring: true
          }
        default:
          return prevState
      }
    })
  }

  const getStatistic = async () => {
    setIsLoadingStatistic(true)
    await axiosApiCall
      .get(API_ROUTER.STATE.GET_LAST_MOMENT_STATISTIC)
      .then(response => {
        setOrderStatistics(response?.data?.response)
        setIsLoadingStatistic(false)
      })
      .catch(response => {
        if (!isCancel(error)) {
          setIsLoadingStatistic(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  useEffect(() => {
    getStatistic()
  }, [])
  // Page Life Cycle: End

  return (
    <div className='top-block-card'>
      <div className='card-block-inner two-block-card'>
        <div
          className={`card-block ${showDropDdown.last_moment_cancellation ? 'active' : ''}`}
          onClick={() => handleClick('last_moment_cancellation')}
        >
          <Card className='card-link-a cursor-pointer' onClick={() => setShowDropDown(false)}>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.order_management?.last_moment_cancellation}</Typography>
              </div>
              <div className='number-text-block flex flex-col gap-1'>
                <div className='number-text-block-inner flex items-center gap-4'>
                  <Typography variant='h4'>
                    {isLoadingStatistic ? (
                      <CircularProgress
                        size={20}
                        className={`${showDropDdown.last_moment_cancellation ? 'text-white' : ''}`}
                      />
                    ) : (
                      numberFormat(orderStatistics.lastMomentCancelOrders)
                    )}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className={`card-block ${showDropDdown.meal_monitoring ? 'active' : ''}`}
          onClick={() => handleClick('meal_monitoring')}
        >
          <Link href={`/${locale}/${panelName}/order-management/monitor-orders`}>
            <Card className='card-link-a cursor-pointer'>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color='primary' skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h4'>{dictionary?.page?.order_management?.monitor_deliverd_order}</Typography>
                </div>
                <div className='number-text-block flex flex-col gap-1'>
                  <div className='number-text-block-inner flex items-center gap-2'>
                    <Typography variant='h4'>
                      {isLoadingStatistic ? (
                        <CircularProgress
                          size={20}
                          className={`${showDropDdown.meal_monitoring ? 'text-white' : ''}`}
                        />
                      ) : (
                        numberFormat(orderStatistics?.completeOrders || 0)
                      )}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Statistics
