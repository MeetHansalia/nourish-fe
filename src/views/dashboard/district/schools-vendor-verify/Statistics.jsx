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

  const content = (
    <Card>
      <CardContent className='flex flex-col gap-1'>
        <div className='flex items-center gap-4'>
          <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
            <i className='tabler-clipboard-check text-xl' />
          </CustomAvatar>
          <Typography variant='h4'>{title}</Typography>
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Typography color='text.primary' className='font-bold text-3xl'>
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
