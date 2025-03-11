'use client'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import { Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import { toastError } from '@/utils/globalFunctions'
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const Reports = props => {
  // Props
  // console.log('props: ', props)

  const {
    dictionary = null,
    issueCounts = 0,
    role = '',
    isDispute = false,
    disabled = false,
    isLoadingStatistic
  } = props

  // console.log('dictionary: ', dictionary, issueCounts)

  // HOOKS
  const { lang: locale } = useParams()

  return (
    <div className='top-block-card'>
      <div className='card-block-inner'>
        <div className='card-block'>
          <Link href={`/${locale}/${USER_PANELS?.vendor}/dispute-management/history`}>
            <Card>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <div className='card-text-top'>
                    <Typography variant='h4'>
                      {isDispute
                        ? dictionary?.datatable?.dispute_history_table?.table_title
                        : dictionary?.page?.issue_reporting?.issue_counting}
                    </Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-1 number-text-block'>
                  <div className='flex items-center gap-2 number-text-block-inner'>
                    <Typography color='text.primary' className='font-bold text-2xl'>
                      {isLoadingStatistic ? <CircularProgress size={20} /> : numberFormat(issueCounts)}
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

export default Reports
