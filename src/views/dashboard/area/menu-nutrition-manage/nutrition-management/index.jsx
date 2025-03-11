'use client'

// React Imports
import { forwardRef, useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

import { differenceInDays, format } from 'date-fns'

// MUI Imports
import { Button, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

// Third-party Imports
import { useSelector } from 'react-redux'

import { isCancel } from 'axios'

import axiosApiCall from '@/utils/axiosApiCall'

import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Component Imports
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'

import { profileState } from '@/redux-store/slices/profile'

import { API_ROUTER } from '@/utils/apiRoutes'

import { useTranslation } from '@/utils/getDictionaryClient'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import Calendar from './Calendar'

/**
 * Page
 */
const FoodChartCreation = props => {
  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { user = null } = useSelector(profileState)
  const getSchoolListController = useRef()
  const getKidsListController = useRef()
  const [schools, setSchools] = useState([])
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [event, setEvent] = useState([])
  const [kidsList, setKidsList] = useState([]) // Store the fetched list of kids
  const [selectedKid, setSelectedKid] = useState(null)

  console.log('event', event?.orders)

  const CustomInput = forwardRef((props, ref) => {
    const { label, start, end, ...rest } = props

    const value = start
      ? `${format(start, 'MM/dd/yyyy')}${end ? ` - ${format(end, 'MM/dd/yyyy')}` : ''}`
      : 'Please select dates'

    return <CustomTextField fullWidth inputRef={ref} {...rest} label={label} value={value} />
  })

  const handleOnChange = dates => {
    const [start, end] = dates

    setEndDate(end)
    setStartDate(start)
  }

  const fetchKidsList = () => {
    setIsGetSchoolListLoading(true)

    if (getKidsListController.current) {
      getKidsListController.current?.abort()
    }

    getKidsListController.current = new AbortController()

    axiosApiCall
      .get(`${API_ROUTER.AREA_EXECUTIVE.GET_KIDS}/${selectedSchool}`, {
        signal: getKidsListController?.current?.signal
      })

      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data

        const responseBodyData = responseBody?.response

        const kids = responseBodyData?.userData || []

        setKidsList(kids)

        setSelectedKid(kids.length > 0 ? kids[0] : null)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  // Fetching school list
  const fetchSchoolList = () => {
    setIsGetSchoolListLoading(true)

    if (getSchoolListController.current) {
      getSchoolListController.current?.abort()
    }

    getSchoolListController.current = new AbortController()

    setSchools([])
    axiosApiCall

      .get(API_ROUTER.AREA_EXECUTIVE.GET_SCHOOLS_NUTRITION, {
        signal: getSchoolListController?.current?.signal
      })

      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data

        const responseBodyData = responseBody?.response

        setSchools(responseBodyData?.users || [])
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  // Effect for fetching school list
  useEffect(() => {
    fetchSchoolList()
  }, [])

  useEffect(() => {
    if (selectedSchool) {
      setSelectedKid(null)

      fetchKidsList()
    }
  }, [selectedSchool])

  useEffect(() => {
    if (selectedSchool && selectedKid === null) {
      fetchKidsList()
    }
  }, [selectedKid === null])

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedSchool || !selectedKid || !startDate || !endDate) {
      toastError(t('form.errors.missing_fields'))

      return
    }

    setIsSubmitting(true)

    const formData = {
      // schoolId: selectedSchool,
      kidId: selectedKid?._id,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }

    try {
      const response = await axiosApiCall.get(`${API_ROUTER.AREA_EXECUTIVE.GET_SCHOOL_ORDER_MONTH}/${selectedSchool}`, {
        params: formData
      })

      setEvent(response?.data?.response)
    } catch (error) {
      const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

      toastError(apiResponseErrorHandlingData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h4'>{t('navigation.nutrition_management')}</Typography>
              <Grid container spacing={6}>
                <Grid item lg={4}>
                  <CustomAutocomplete
                    fullWidth
                    options={schools}
                    getOptionLabel={option => option?.schoolName || ''}
                    renderInput={params => (
                      <CustomTextField {...params} placeholder={t('form.placeholder.school_name')} />
                    )}
                    onChange={(_, data) => {
                      setSelectedSchool(data?._id)
                    }}
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    noOptionsText={t('form.placeholder.no_options')}
                    renderOption={(props, option) => (
                      <li {...props} key={option._id}>
                        {option?.schoolName || ''}
                      </li>
                    )}
                  />
                </Grid>

                <Grid item lg={4}>
                  {/* <CustomAutocomplete
                    fullWidth
                    options={Array.isArray(selectedKid) ? selectedKid : []} // Ensure you're passing an array
                    getOptionLabel={option => `${option.first_name} ${option.last_name}`}
                    renderInput={params => (
                      <CustomTextField {...params} placeholder={t('form.placeholder.select_kids')} />
                    )}
                    onChange={(_, data) => {
                      console.log('Selected Kid ID:', data?._id)
                      setSelectedKid(data?._id) // Store the selected kid's ID
                    }}
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    noOptionsText={t('form.placeholder.no_options')}
                    renderOption={(props, option) => (
                      <li {...props} key={option._id}>
                        {`${option.first_name} ${option.last_name}`}
                      </li>
                    )}
                  /> */}
                  <CustomAutocomplete
                    fullWidth
                    options={Array.isArray(kidsList) ? kidsList : []} // Use the full list of kids
                    getOptionLabel={option => `${option.first_name} ${option.last_name}`}
                    renderInput={params => (
                      <CustomTextField {...params} placeholder={t('form.placeholder.select_kids')} />
                    )}
                    onChange={(_, data) => {
                      if (data) {
                        console.log('Selected Kid ID:', data._id)
                        setSelectedKid(data) // Store the entire selected kid object
                      } else {
                        setSelectedKid(null) // If removed, reset selection
                      }
                    }}
                    value={selectedKid} // Ensure the selected value is correctly managed
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    noOptionsText={t('form.placeholder.no_options')}
                    renderOption={(props, option) => (
                      <li {...props} key={option._id}>
                        {`${option.first_name} ${option.last_name}`}
                      </li>
                    )}
                  />
                </Grid>

                <Grid item lg={4}>
                  <AppReactDatepicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    selected={startDate}
                    id='date-range-picker'
                    onChange={handleOnChange}
                    shouldCloseOnSelect={false}
                    customInput={<CustomInput label='' start={startDate} end={endDate} />}
                  />
                </Grid>

                <Grid item lg={4}>
                  <Button
                    variant='contained'
                    type='button'
                    onClick={handleSubmit} // Add the submit handler
                    disabled={isSubmitting} // Disable the button while submitting
                  >
                    {isSubmitting ? t('form.button.submitting') : t('form.button.confirm')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {isGetSchoolListLoading && (
            <div className='text-center'>
              <CircularProgress className='ml-1' size={20} />
            </div>
          )}

          <Card className='overflow-visible'>
            <AppFullCalendar className='app-calendar'>
              <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
                {event?.orders?.length > 0 ? (
                  <Calendar events={event.orders} />
                ) : (
                  <div className='flex justify-center items-center h-32 text-gray-500'>No orders available</div>
                )}
              </div>
            </AppFullCalendar>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default FoodChartCreation
