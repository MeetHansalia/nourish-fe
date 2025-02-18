'use client'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

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
  const { dictionary = null, title, link, value, isLoading } = props

  // HOOKS
  const { lang: locale } = useParams()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  const [suspendedAccountNumbers, setSuspendedAccountNumber] = useState()

  //   const getTotalSuspendedAccountNumber = async () => {
  //     await axiosApiCall
  //       .get(API_ROUTER.USER_MANAGEMENT_STATISTICS)
  //       .then(response => {
  //         setSuspendedAccountNumber(response?.data?.response?.suspended_accounts)
  //       })
  //       .catch(error => {
  //         toastError(error?.response?.message)
  //       })
  //   }

  //  Page Life Cycle: Start
  useEffect(() => {
    // getTotalSuspendedAccountNumber()
  }, [])
  //  Page Life Cycle: End

  const content = (
    <Card className='card-link-a'>
      <CardContent className='flex flex-col gap-1'>
        <div className='flex items-center gap-4'>
          <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
            <i className='tabler-clipboard-check text-xl' />
          </CustomAvatar>
          <div className='card-text-top'>
            <Typography variant='h4'>{title}</Typography>
            <Typography variant='body2' color='text.disabled'>
              Last Week
            </Typography>
          </div>
        </div>
        <div className='number-text-block flex flex-col gap-1'>
          <div className='number-text-block-inner flex items-center gap-2'>
            <Typography variant='h4' color='text.primary'>
              {/* {numberFormat(4541)} */}
              {isLoading ? <CircularProgress size={20} /> : numberFormat(value)}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return link ? <Link href={`/${locale}/${panelName}/${link}`}>{content}</Link> : content
}

export default Statistics
