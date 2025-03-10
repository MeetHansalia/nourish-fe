'use client'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

// Core Component Imports
import { isCancel } from 'axios'

import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'
// View Imports
import {
  apiResponseErrorHandling,
  getPanelName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError
} from '@/utils/globalFunctions'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null } = props

  // HOOKS
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const panelName = getPanelName(pathname)

  const [statisticsCount, setStatisticsCount] = useState(0)
  const [isStatisticsCountLoaded, setIsStatisticCountLoaded] = useState(false)

  const getTotalSuspendedAccountNumber = async () => {
    setIsStatisticCountLoaded(false)

    try {
      const response = await axiosApiCall.get(API_ROUTER.ADMIN.GET_STATISTIC)

      setStatisticsCount(response?.data?.response || 0)
      setIsStatisticCountLoaded(true)
    } catch (error) {
      // toastError(error?.response?.message || 'An error occurred while fetching data.')
      if (!isCancel(error)) {
        setIsStatisticCountLoaded(false)
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
        }
      }
    }
  }

  useEffect(() => {
    getTotalSuspendedAccountNumber()
  }, [])

  return (
    <div className='top-block-card'>
      <div className='card-block-inner two-block-card'>
        <div className='card-block'>
          <Link href={`/${locale}/${panelName}/vendor-management/vendor-document-requests`}>
            <Card className='card-link-a'>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h4'>
                    {dictionary?.page?.vendor_management?.vendor_document_verification_requests}
                  </Typography>
                </div>
                <div className='number-text-block flex flex-col gap-1'>
                  <div className='number-text-block-inner flex items-center gap-4'>
                    <Typography variant='h4' color='text.primary'>
                      {isStatisticsCountLoaded ? (
                        numberFormat(statisticsCount?.vendorDocumentRequests)
                      ) : (
                        <CircularProgress size={20} />
                      )}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className='card-block'>
          <Link href={`/${locale}/${panelName}/vendor-management/vendor-minimum-threshold`}>
            <Card className='card-link-a'>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h4'>
                    {dictionary?.page?.order_management?.vendor_minimum_thresholds_verfication_requests}
                  </Typography>
                </div>
                <div className='number-text-block flex flex-col gap-1'>
                  <div className='number-text-block-inner flex items-center gap-2'>
                    <Typography variant='h4' color='text.primary'>
                      {isStatisticsCountLoaded ? (
                        numberFormat(statisticsCount?.vendorDocumentRequests)
                      ) : (
                        <CircularProgress size={20} />
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
