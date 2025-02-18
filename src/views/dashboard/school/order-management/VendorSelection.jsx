'use client'
import React, { useEffect, useRef, useState } from 'react'

import { useParams, usePathname } from 'next/navigation'

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Radio,
  FormControlLabel,
  Box,
  Button,
  CircularProgress
} from '@mui/material'

import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import { useTranslation } from '@/utils/getDictionaryClient'
import { useRedirect } from '@/hooks/useAppRedirect'
import { getLocalizedUrl } from '@/utils/i18n'
import { apiResponseErrorHandling, getPanelName, toastError, toastSuccess } from '@/utils/globalFunctions'

const VendorSelection = ({ setTab = () => {}, selectedVendor = null, setSelectedVendor = () => {} }) => {
  //** HOOKS */
  const { locale, router, redirectTo } = useRedirect()
  const { t } = useTranslation(locale)
  const pathname = usePathname()

  const panelName = getPanelName(pathname)

  //** STATES */
  const [isLoading, setIsLoading] = useState(false)
  const [vendors, setVendors] = useState([])
  const [meta, setMeta] = useState({})

  //** EFFECTS */
  useEffect(() => {
    fetchVendors()
  }, [])

  //** HANDLERS */
  const fetchVendors = async () => {
    setIsLoading(true)

    try {
      const res = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.GET_NEAR_BY_VENDORS)

      const { response, meta } = res?.data

      setVendors(response?.vendors || [])
      setMeta(meta || {})
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectionChange = vendor => {
    setSelectedVendor(vendor)
    router.push(getLocalizedUrl(`${panelName}/order-management/meal-selection/${vendor._id}`, locale))
  }

  const GetFullName = vendor => {
    return `${vendor?.first_name} ${vendor?.last_name}`
  }

  const handleNext = () => {
    if (!selectedVendor?._id) return
    setTab(1)
  }

  return (
    <Box>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Grid container spacing={2} alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant='h5'>{t('page.order_management.select_vendor')}</Typography>
            </Grid>
            <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant='contained' color='primary' disabled={isLoading} onClick={handleNext}>
                {t('form.button.next')}
                {isLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
              </Button>
              {/* <Button variant='customLight' onClick={() => router.back()} disabled={isLoading}>
                {t('form.button.cancel')}
              </Button> */}
            </Grid>
          </Grid>
          <Grid container spacing={6}>
            {/* //TODO: ADD LOADER HERE */}
            {vendors.map(vendor => (
              <Grid item xs={12} sm={6} key={vendor._id}>
                <Card
                  sx={{
                    padding: 2,
                    boxShadow: selectedVendor?._id === vendor._id ? '0 0 10px #006838' : 'none',
                    border: selectedVendor?._id === vendor._id ? '1px solid #006838' : '1px solid #e0e0e0'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={vendor.image} alt={vendor.name} sx={{ width: 50, height: 50, marginRight: 2 }} />
                      <Typography
                        variant='h6'
                        sx={{
                          fontSize: '16px',
                          // fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {GetFullName(vendor)}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      value={vendor._id}
                      control={
                        <Radio
                          checked={selectedVendor?._id === vendor._id}
                          onChange={() => handleSelectionChange(vendor)}
                          sx={{
                            color: '#4caf50',
                            '&.Mui-checked': {
                              color: '#4caf50'
                            }
                          }}
                        />
                      }
                      label=''
                      sx={{ marginLeft: 'auto' }}
                    />
                  </Box>

                  <Box sx={{ marginTop: 1 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#757575',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {vendor.address}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default VendorSelection
