'use client'

import { useEffect, useState } from 'react'

import { Box, Grid } from '@mui/material'

import Statistics from './Statistics'
import VendorRegistrationRequestsTable from './VendorRequestTable'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError } from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'

const VendorManagementComponent = ({ dictionary }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.ADMIN.GET_STATISTIC)
      .then(response => {
        setIsLoading(false)
        setStatisticData(response?.data?.response)
      })
      .catch(error => {
        setIsLoading(false)
        toastError(error?.response?.message)
      })
  }

  useEffect(() => {
    getStatistics()
  }, [])

  // console.log('statisticData', statisticData)

  return (
    <Grid container spacing={6}>
      {[
        {
          title: 'Vendor minimum thresholds requests',
          link: 'vendor-management/vendor-minimum-threshold',
          key: 'vendorThresholdRequests'
        },
        { title: 'Monitor Deliver Orders' },
        {
          title: 'Vendor Document Requests',
          link: 'vendor-management/vendor-document-requests',
          key: 'vendorDocumentRequests'
        }
      ]?.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Statistics title={card?.title} link={card?.link} isLoading={isLoading} value={statisticData[card.key]} />
        </Grid>
      ))}
      <Grid item xs={12}>
        <VendorRegistrationRequestsTable dictionary={dictionary} />
      </Grid>
    </Grid>
  )
}

export default VendorManagementComponent
