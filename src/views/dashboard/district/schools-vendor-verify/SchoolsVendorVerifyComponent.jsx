'use client'

import { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

import Statistics from './Statistics'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError } from '@/utils/globalFunctions'

const SchoolsVendorVerifyComponent = () => {
  const CARD_TITLE_DATA = [
    {
      title: 'School Document Verification Request',
      link: 'schools-vendors-verify/school-registration-request',
      key: 'schoolDocumentRequests'
    },
    {
      title: 'Parent Registration Requests',
      link: 'schools-vendors-verify/parent-registration-request',
      key: 'parentRegistrationRequests'
    },
    {
      title: 'Vendor Document Verification Requests',
      link: 'schools-vendors-verify/vendors-document-list',
      key: 'vendorDocumentRequests'
    },
    {
      title: 'Vendor Minimum Thresholds Verification Requests',
      link: 'schools-vendors-verify/vendors-threshold-request',
      key: 'vendorThresholdRequests'
    }
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [statisticData, setStatisticData] = useState({})

  const getStatistics = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.DISTRICT.GET_STATISTIC)
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

  return (
    <Grid container spacing={2}>
      {CARD_TITLE_DATA?.map((card, index) => (
        <Grid item xs={6} sm={2} md={4} key={index}>
          <Statistics title={card?.title} link={card?.link} value={statisticData[card.key]} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  )
}

export default SchoolsVendorVerifyComponent
