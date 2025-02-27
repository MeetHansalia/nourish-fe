'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { useParams } from 'next/navigation'

import { Box, Typography, Grid, CircularProgress } from '@mui/material'

// Third Party Imports
import { useInView } from 'react-intersection-observer'

// Import StaffCard Component
import StaffCard from './StaffCard'

// Next Imports

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { getFullName, toastError } from '@/utils/globalFunctions'
import { useTranslation } from '@/utils/getDictionaryClient'
import FullPageLoader from '@/components/FullPageLoader'

const StaffListingComponent = ({ dictionary }) => {
  const [allStaff, setAllStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [metaForPagination, setMetaForPagination] = useState({ currentPage: 1 })

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  const { ref, inView } = useInView({ threshold: 0 })

  const getAllStaffMembers = async page => {
    setLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.STAFF_MANAGEMENT(), {
        params: {
          limit: 12,
          page
        }
      })

      const newStaff = response?.data?.response?.users || []

      setAllStaff(prev => [...prev, ...newStaff])
      setLoading(false)
      setMetaForPagination(response?.data?.meta)
    } catch (error) {
      toastError(error?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (inView && !loading && metaForPagination?.currentPage < metaForPagination?.totalPage) {
      const nextPage = metaForPagination?.currentPage + 1

      getAllStaffMembers(nextPage)
    }
  }, [inView, loading, metaForPagination])

  useEffect(() => {
    if (metaForPagination?.currentPage === 1) {
      getAllStaffMembers(1)
    }
  }, [])

  const noMoreData = metaForPagination?.currentPage >= metaForPagination?.totalPage

  return (
    <>
      {/* <Typography variant='h5'>Staff List</Typography> */}

      <Grid container spacing={6}>
        {allStaff?.map(staff => (
          <Grid item xs={12} md={6} lg={6} key={staff._id}>
            <StaffCard
              // name={`${staff.first_name} ${staff.last_name}`}
              name={getFullName({ first_name: staff?.first_name, last_name: staff?.last_name })}
              role={staff?.role}
              email={staff?.email}
              userId={staff?._id}
              dictionary={dictionary}
              setAllStaff={setAllStaff}
            />
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box display='flex' justifyContent='center' alignItems='center' mt={2}>
          <FullPageLoader open={true} color='primary' spinnerSize={60} />
        </Box>
      )}

      {noMoreData && !loading && (
        <Box display='flex' justifyContent='center' mt={2}>
          <Typography variant='body1' color='textSecondary'>
            {t('common.no_more_data_to_load')}
          </Typography>
        </Box>
      )}

      <div ref={ref} style={{ height: 20 }} />
    </>
  )
}

export default StaffListingComponent
