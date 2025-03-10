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
  const { dictionary = null, title, link, count, totalCount } = props

  // HOOKS
  const { lang: locale } = useParams()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  return (
    // <Grid container spacing={6}>
    // {/* <Grid item xs={12} sm={6} md={4}> */}
    <Link href={`/${locale}/${panelName}/${link}`}>
      <Card>
        <CardContent className='flex flex-col gap-1'>
          <div className='flex items-center gap-4'>
            <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
              <i className='tabler-clipboard-check text-xl' />
            </CustomAvatar>
            <Typography variant='h4'>{title}</Typography>
            <Typography variant='body2' color='text.disabled'>
              {dictionary?.page?.user_managemnt?.suspended_account}
            </Typography>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Typography color='text.primary' className='font-bold text-3xl'>
                {totalCount ? numberFormat(count) : <CircularProgress size={20} />}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
    // </Grid>
    // </Grid>
  )
}

export default Statistics
