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
  const { dictionary = null, suspendedAccountNumbers, isLoadingStatistic } = props

  // HOOKS
  const { lang: locale } = useParams()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  return (
    <div>
      <div className='top-block-card'>
        <div className='card-block-inner'>
          <div className='card-block'>
            <Link href={`/${locale}/${panelName}/menu-nutrition-manage/manage-vendor-request-list`}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>
                        {dictionary?.form?.label?.review_vendor_menu_and_add_suggestion}
                      </Typography>
                      <Typography variant='body2' color='text.disabled'>
                        {dictionary?.page?.menu_nutrition_manage}
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography color='text.primary' className='font-bold text-3xl'>
                        {isLoadingStatistic ? <CircularProgress size={20} /> : numberFormat(suspendedAccountNumbers)}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <div className='top-block-card'>
        <div className='card-block-inner'>
          <div className='card-block'>
            <Link href={`/${locale}/${panelName}/menu-nutrition-manage/nutrition-management`}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>{dictionary?.form?.label?.nutrition_management}</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        {dictionary?.page?.menu_nutrition_manage}
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography color='text.primary' className='font-bold text-3xl'>
                        {isLoadingStatistic ? <CircularProgress size={20} /> : numberFormat(suspendedAccountNumbers)}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
