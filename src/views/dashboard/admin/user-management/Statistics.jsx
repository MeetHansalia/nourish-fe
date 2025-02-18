'use client'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { Card, CardContent, CircularProgress, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'

// View Imports
import { getPanelName } from '@/utils/globalFunctions'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null, suspendedAccountNumbers, isLoadingStatistic, userOperationPermissions } = props

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
            <Link
              href={`/${locale}/${panelName}/user-management/suspended-users`}
              onClick={e => !userOperationPermissions?.suspended_users_list && e.preventDefault()}
              className={!userOperationPermissions?.suspended_users_list ? 'pointer-events-none opacity-50' : ''}
            >
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>
                        {dictionary?.page?.user_management?.suspended_accounts?.suspended_accounts}
                      </Typography>
                      {/* <Typography variant='body2' color='text.disabled'>
                        {dictionary?.page?.user_management?.suspended_accounts?.last_week}
                      </Typography> */}
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
