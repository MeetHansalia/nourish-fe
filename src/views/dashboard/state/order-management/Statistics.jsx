'use client'
// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Card, CardContent, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null, setShowDropDown, showDropDdown } = props
  const [orderStatistics, setOrderStatistics] = useState(0)

  // HOOKS
  const handleNavigation = () => {
    setShowDropDown(!showDropDdown)
  }

  const getLastMomentCancelationStatistic = async () => {
    // setLastMomentCancelationCount(true)
    await axiosApiCall
      .get(API_ROUTER.STATE.GET_LAST_MOMENT_STATISTIC)
      .then(response => {
        setOrderStatistics(response?.data?.response)
        // setLastMomentCancelationCount(false)
      })
      .catch(response => {
        if (!isCancel(error)) {
          // setIsFormSubmitLoading(false)
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
    getLastMomentCancelationStatistic()
  }, [])
  // Page Life Cycle: End

  return (
    <div className='top-block-card'>
      <div className='card-block-inner two-block-card'>
        <div className='card-block'>
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
                  <Typography variant='h4'>{numberFormat(orderStatistics.lastMomentCancelOrderRequests)}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='card-block'>
          <Card onClick={handleNavigation} className='card-link-a cursor-pointer'>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar className='custom-avatar' color='primary' skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.order_management?.monitor_deliverd_order}</Typography>
              </div>
              <div className='number-text-block flex flex-col gap-1'>
                <div className='number-text-block-inner flex items-center gap-2'>
                  <Typography variant='h4'>{numberFormat(orderStatistics.completeOrders)}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Statistics
