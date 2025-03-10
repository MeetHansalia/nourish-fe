'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import { Card, CardContent, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'

// View Imports
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const Reports = props => {
  // Props

  const { dictionary = null, issueCounts = 0, role = '', isDispute = false, disabled = false } = props

  // HOOKS
  const { lang: locale } = useParams()

  return (
    <div className='top-block-card'>
      <div className='card-block-inner'>
        <div className='card-block'>
          <Link
            href={
              role === 'admin_role'
                ? `/${locale}/${USER_PANELS?.admin}/dispute-management/history`
                : `/${locale}/${role === 'parent_role' ? USER_PANELS?.parent : USER_PANELS?.staff}/issue-reporting/issues-list`
            }
          >
            <Card>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <Typography variant='h4'>
                    {isDispute
                      ? dictionary?.datatable?.dispute_history_table?.table_title
                      : dictionary?.page?.issue_reporting?.issue_counting}
                  </Typography>
                </div>
                <div className='number-text-block flex flex-col gap-1 mt-6'>
                  <div className='number-text-block-inner flex items-center gap-2'>
                    <Typography color='text.primary' className='font-bold text-2xl'>
                      {numberFormat(issueCounts)}
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
