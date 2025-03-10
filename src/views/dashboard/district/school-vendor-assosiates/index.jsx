'use client'

import { useEffect, useRef, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { Box, Card, CardContent, Avatar, Typography, IconButton, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'

import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError } from '@/utils/globalFunctions'
import { getLocalizedUrl } from '@/utils/i18n'

export default function SchoolVendor({ dictionary }) {
  const [searchSchool, setSearchSchool] = useState('')
  const [searchVendor, setSearchVendor] = useState('')
  const [schoolData, setSchoolData] = useState([])
  const [vendorData, setVendorData] = useState([])

  const didFetch = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  // Function to get school list with search filter
  const getSchoolList = async (searchQuery = '') => {
    try {
      const apiUrl = `${API_ROUTER?.DISTRICT.GET_SCHOOL_LIST}`
      const response = await axiosApiCall.get(apiUrl, { params: { searchQuery } })

      setSchoolData(response?.data?.response?.users)
    } catch (error) {
      toastError(error?.response?.message)
    }
  }

  // Function to get vendor list with search filter
  const getVendorList = async (searchQuery = '') => {
    try {
      const apiUrl = `${API_ROUTER?.DISTRICT.GET_VENDOR_LIST}`
      const response = await axiosApiCall.get(apiUrl, { params: { searchQuery } })

      setVendorData(response?.data?.response?.users)
    } catch (error) {
      toastError(error?.response?.message)
    }
  }

  // Fetch data on initial render
  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true
      getSchoolList()
      getVendorList()
    }
  }, [])

  // Debounce function for search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSchoolList(searchSchool)
    }, 500) // Delays API call to avoid excessive requests

    return () => clearTimeout(timeoutId)
  }, [searchSchool])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getVendorList(searchVendor)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchVendor])

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* School List */}
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 3,
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '700px'
          }}
        >
          <Typography fontWeight='bold' mb={2}>
            {dictionary?.page?.common?.school_list}
          </Typography>
          <TextField
            fullWidth
            placeholder={dictionary?.form?.placeholder?.search_school}
            value={searchSchool}
            onChange={e => setSearchSchool(e.target.value)}
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              '& fieldset': { border: 'none' },
              '& .MuiOutlinedInput-root': { px: 1 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: 'gray' }} />
                </InputAdornment>
              )
            }}
          />
          <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
            {schoolData.map((item, index) => (
              <Card
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() =>
                  router.push(getLocalizedUrl(`/district/school-vendor-associates/schools/${item._id}`, locale))
                }
              >
                <Avatar sx={{ mr: 2 }}>🏫</Avatar>
                <CardContent sx={{ flex: 1 }}>
                  <Typography fontWeight='bold'>{item.schoolName}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.kind}
                  </Typography>
                </CardContent>
                <EditIcon />
              </Card>
            ))}
          </Box>
        </Box>

        {/* Vendor List */}
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 3,
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '700px'
          }}
        >
          <Typography fontWeight='bold' mb={2}>
            {dictionary?.page?.common?.vendor_list}
          </Typography>
          <TextField
            fullWidth
            placeholder={dictionary?.form?.placeholder?.search_vendor}
            value={searchVendor}
            onChange={e => setSearchVendor(e.target.value)}
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              '& fieldset': { border: 'none' },
              '& .MuiOutlinedInput-root': { px: 1 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: 'gray' }} />
                </InputAdornment>
              )
            }}
          />
          <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
            {vendorData?.map((item, index) => (
              <Card
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() =>
                  router.push(getLocalizedUrl(`/district/school-vendor-associates/vendors/${item._id}`, locale))
                }
              >
                <Avatar sx={{ mr: 2 }}>🏢</Avatar>
                <CardContent sx={{ flex: 1 }}>
                  <Typography fontWeight='bold'>{item.first_name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.companyName}
                  </Typography>
                </CardContent>
                <EditIcon />
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
