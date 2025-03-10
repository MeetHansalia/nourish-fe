'use client'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { Card, CardContent, Grid, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'
// View Imports
import { getPanelName, toastError } from '@/utils/globalFunctions'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null, setShowDropDown, showDropDdown } = props

  // HOOKS
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const panelName = getPanelName(pathname)
  const [statisticData, setStatisticData] = useState({})

  // const [vednerMinimumThresholdsVerificationCount, setVednerMinimumThresholdsVerificationCount] = useState(0)

  // const getTotalSuspendedAccountNumber = async () => {
  //   try {
  //     const response = await axiosApiCall.get(API_ROUTER.SUPER_ADMIN_ORDER.MINIMUM_THRESHOLD)

  //     setVednerMinimumThresholdsVerificationCount(response?.data?.response?.thresholdRequestCount || 0)
  //   } catch (error) {
  //     toastError(error?.response?.message || 'An error occurred while fetching data.')
  //   }
  // }

  // useEffect(() => {
  //   getTotalSuspendedAccountNumber()
  // }, [])

  const getStatistics = async () => {
    await axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_ORDER.STATISTICS)
      .then(response => {
        setStatisticData(response?.data?.response)
      })
      .catch(error => {
        toastError(error?.response?.message)
      })
  }

  useEffect(() => {
    getStatistics()
  }, [])

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

  // Page Life Cycle: End

  return (
    <div className='top-block-card'>
      <div className='card-block-inner two-block-card'>
        <div
          className={`card-block ${showDropDdown.last_moment_cancellation ? 'active' : ''}`}
          onClick={() => handleClick('last_moment_cancellation')}
        >
          <Card className='card-link-a'>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.order_management?.last_moment_cancellation}</Typography>
              </div>
              <div className='number-text-block flex flex-col gap-1'>
                <div className='number-text-block-inner flex items-center gap-4'>
                  <Typography variant='h4' color='text.primary'>
                    {numberFormat(statisticData?.lastMomentCancelOrders || 0)}
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
            <Card className='card-link-a'>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h4'> {dictionary?.page?.order_management?.monitor_deliverd_order}</Typography>
                </div>
                <div className='number-text-block flex flex-col gap-1'>
                  <div className='number-text-block-inner flex items-center gap-2'>
                    <Typography variant='h4' color='text.primary'>
                      {numberFormat(statisticData?.completeOrders || 0)}
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
