'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { Button, Card, CardContent, CircularProgress, Grid, MenuItem, Select, Typography } from '@mui/material'

// Third-party Imports
import { addDays, format } from 'date-fns'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { isCancel } from 'axios'

// Util Imports
import { useTranslation } from '@/utils/getDictionaryClient'
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError, toastSuccess } from '@/utils/globalFunctions'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Component Imports
import Calendar from './Calendar'
import AddEditVendorDialog from './AddEditVendorDialog'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import { profileState } from '@/redux-store/slices/profile'
import { API_ROUTER } from '@/utils/apiRoutes'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'

/**
 * Page
 */
const FoodChartCreation = props => {
  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { user = null } = useSelector(profileState)

  // General States
  const [minDate, setMinDate] = useState()
  const [maxDate, setMaxDate] = useState()
  // const [minDate, setMinDate] = useState(addDays(new Date(), 2))
  // const [maxDate, setMaxDate] = useState(addDays(new Date(), 30))
  const [isChartUpdated, setIsChartUpdated] = useState(false)

  // Calendar States
  const [calendarApi, setCalendarApi] = useState(null)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null)
  const [schoolAdminId, setSchoolAdminId] = useState()

  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)
  const getSchoolListController = useRef()
  const [schools, setSchools] = useState([])

  // console.log('schoolAdminId', schoolAdminId)

  /**
   * Add/Edit/Delete event dialog: Start
   */
  const handleAddEventSidebarToggle = props => {
    setSelectedCalendarEvent(props?.clickedEvent || null)

    setAddEventSidebarOpen(!addEventSidebarOpen)
  }
  /** Add/Edit/Delete event dialog: End */

  /**
   * Date range change handler: Start
   */
  useEffect(() => {
    if (minDate && maxDate && maxDate < minDate) {
      setMaxDate(minDate)
    }
  }, [minDate])

  useEffect(() => {
    if (minDate && maxDate && schoolAdminId) {
      getChartData()
    }
  }, [minDate, maxDate, schoolAdminId])

  useEffect(() => {
    fetchSchoolList()
  }, [])
  /** Date range change handler: End */

  /**
   * Get existing chart data: Start
   */
  const [isGetChartDataLoading, setIsGetChartDataLoading] = useState(false)
  const getGetChartDataController = useRef()

  const getChartData = () => {
    const startDate = format(minDate, 'yyyy-MM-dd')
    const endDate = format(maxDate, 'yyyy-MM-dd')

    setIsGetChartDataLoading(true)
    setCalendarEvents([])
    // console.log('getChartData')

    if (getGetChartDataController.current) {
      getGetChartDataController.current?.abort()
    }

    getGetChartDataController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.DISTRICT.GET_FOODCHART_DATA, {
        signal: getGetChartDataController?.current?.signal,
        params: {
          startDate: startDate,
          endDate: endDate,
          schoolAdminId: schoolAdminId
        }
      })
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response
        const foodChart = responseBodyData?.results || []
        const eventsData = []
        const datesBetween = getDatesBetween(startDate, endDate)

        datesBetween?.forEach((date, dateIndex) => {
          const existingFoodChart = foodChart.find(item => item?.date === date)
          let eventTemp = {}

          if (existingFoodChart) {
            let foodChartEventClass = 'capitalize '

            if (existingFoodChart?.isApproved === 'Reject') {
              foodChartEventClass += ' event-bg-warning'
            } else if (existingFoodChart?.isApproved === 'Approved') {
              foodChartEventClass += ' event-bg-primary bg-green-800/50'
            } else {
              foodChartEventClass += ' event-bg-primary bg-green-600/50'
            }

            eventTemp = {
              id: existingFoodChart?._id,
              title: existingFoodChart?.vendorId?.first_name + ' ' + existingFoodChart?.vendorId?.last_name,
              start: existingFoodChart?.date,
              extendedProps: {
                vendorId: existingFoodChart?.vendorId?._id,
                isApproved: existingFoodChart?.isApproved
              },
              classNames: foodChartEventClass
            }
          } else {
            eventTemp = {
              title: t('form.button.add_vendor'),
              start: date,
              classNames: 'capitalize event-bg-info'
            }
          }

          eventsData?.push(eventTemp)
        })

        setCalendarEvents(eventsData)
        setIsGetChartDataLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetChartDataLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Get existing chart data: End */

  /**
   * Submit Chart data to server: Start
   */
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const onCalendarEventSubmitHandler = () => {
    if (isFormSubmitLoading) {
      return
    }

    setIsFormSubmitLoading(true)

    const calendarEventsFiltered = calendarEvents?.filter(element => {
      return element?.extendedProps?.vendorId ? true : false
    })

    const calendarEventsForAPI = calendarEventsFiltered?.map(element => ({
      vendorId: element?.extendedProps?.vendorId,
      date: element?.start,
      // isRecurring: false,
      isDelete: element?.extendedProps?.isDelete === true ? true : false
    }))

    console.log('calendarEventsForAPI: ', calendarEventsForAPI)

    const apiFormData = {
      details: 'details', // static for temporary
      schoolAdminId: schoolAdminId,
      vendors: calendarEventsForAPI
    }

    axiosApiCall
      .post(API_ROUTER.DISTRICT.POST_FOOD_CHART, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)

        setIsChartUpdated(false)
        getChartData()
        setIsFormSubmitLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Submit Chart data to server: End */

  /**
   * Calendar events handler: Start
   */
  const onEventSubmitHandler = (fnInput = null) => {
    // console.log('in onEventSubmitHandler: fnInput:', fnInput)

    if (fnInput?.extendedProps?.isRecurring && fnInput?.extendedProps?.recurringEndDate) {
      const startDate = fnInput?.start
      const endDate = fnInput?.extendedProps?.recurringEndDate
      const dayOfWeek = moment(fnInput?.start).format('dddd')

      const recurringDays = getRecurringDays(startDate, endDate, dayOfWeek)

      // console.log('Recurring Days:', recurringDays)

      const calendarEventsTemp = calendarEvents.map(item => {
        if (recurringDays?.includes(item?.start) && !item?.id) {
          const modifiedEvent = {
            id: item?.id || '',
            title: fnInput?.title,
            start: item?.start,
            extendedProps: {
              vendorId: fnInput?.extendedProps?.vendorId
            },
            classNames: 'event-bg-primary capitalize'
          }

          return modifiedEvent
        }

        return item
      })

      // console.log('calendarEventsTemp: ', calendarEventsTemp)

      setCalendarEvents(calendarEventsTemp)
    } else {
      setCalendarEvents(prevItems =>
        prevItems.map(item =>
          item?.start === fnInput?.start
            ? { ...item, ...fnInput, id: item?.id || '', classNames: 'event-bg-primary capitalize' }
            : item
        )
      )
    }

    setIsChartUpdated(true)
  }

  const onEventDeleteHandler = (fnInput = null) => {
    // console.log('in onEventDeleteHandler: fnInput:', fnInput)

    // setCalendarEvents(prevItems =>
    //   prevItems.map(item =>
    //     item?.start === fnInput?.start
    //       ? { ...item, ...fnInput, id: item?.id || '', classNames: 'event-bg-error capitalize' }
    //       : item
    //   )
    // )

    setCalendarEvents(prevItems =>
      prevItems.map(item => {
        if (item?.start === fnInput?.start) {
          if (fnInput?.id) {
            return { ...item, ...fnInput, id: item?.id || '', classNames: 'event-bg-error capitalize' }
          }

          return {
            id: '',
            title: t('form.button.add_vendor'),
            start: item?.start,
            extendedProps: {},
            classNames: 'event-bg-info capitalize'
          }
        }

        return item
      })
    )

    setIsChartUpdated(true)
  }
  /** Calendar events handler: End */

  /**
   * General functions: Start
   */
  const getDatesBetween = (startDate, endDate) => {
    let dates = []
    let currentDate = moment(startDate)

    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'))
      currentDate.add(1, 'day')
    }

    return dates
  }

  const getRecurringDays = (startDate, endDate, dayOfWeek) => {
    const start = moment(startDate)
    const end = moment(endDate)
    const recurringDays = []

    // Loop through each day
    while (start.isBefore(end) || start.isSame(end)) {
      if (start.format('dddd') === dayOfWeek) {
        recurringDays.push(start.format('YYYY-MM-DD'))
      }

      start.add(1, 'day') // Move to the next day
    }

    return recurringDays
  }
  /** General functions: End */

  /**
   * Extra testing code: Start
   */
  // useEffect(() => {
  //   console.log('calendarEvents: ', calendarEvents)
  // }, [calendarEvents])
  /** Extra testing code: End */

  const fetchSchoolList = () => {
    setIsGetSchoolListLoading(true)

    if (getSchoolListController.current) {
      getSchoolListController.current?.abort()
    }

    getSchoolListController.current = new AbortController()

    setSchools([])
    axiosApiCall
      .get(API_ROUTER.GET_SCHOOLS, {
        signal: getSchoolListController?.current?.signal
      })
      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setSchools(responseBodyData?.users)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  // console.log('schoolAdminId', schoolAdminId)

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div>
                <Typography variant='h4'>{t('navigation.food_chart_creation')}</Typography>
              </div>
              <div>
                <Grid container spacing={6}>
                  <Grid item lg={4}>
                    <AppReactDatepicker
                      selected={minDate}
                      minDate={addDays(new Date(), 1)}
                      onChange={date => setMinDate(date)}
                      customInput={<CustomTextField fullWidth />}
                      placeholderText={t('form.label.start_date')}
                    />
                  </Grid>
                  <Grid item lg={4}>
                    <AppReactDatepicker
                      selected={maxDate}
                      minDate={minDate}
                      onChange={date => setMaxDate(date)}
                      customInput={<CustomTextField fullWidth />}
                      placeholderText={t('form.label.end_date')}
                    />
                  </Grid>
                  <Grid item lg={4}>
                    <CustomAutocomplete
                      fullWidth
                      options={schools}
                      getOptionLabel={option => option?.schoolName || ''}
                      renderInput={params => (
                        <CustomTextField {...params} placeholder={t('form.placeholder.school_name')} />
                      )}
                      onChange={(_, data) => {
                        setSchoolAdminId(data?._id)
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
                  {isChartUpdated && (
                    <Grid item lg={4}>
                      <Button
                        variant='contained'
                        type='button'
                        disabled={isFormSubmitLoading}
                        onClick={onCalendarEventSubmitHandler}
                      >
                        {t('form.button.confirm')}
                        {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {isGetChartDataLoading && schoolAdminId && (
            <div className='text-center'>
              <CircularProgress className='ml-1' size={20} />
            </div>
          )}
          {minDate && maxDate && user && calendarEvents && !isGetChartDataLoading && schoolAdminId && (
            <Card className='overflow-visible'>
              <AppFullCalendar className='app-calendar'>
                <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
                  <Calendar
                    calendarApi={calendarApi}
                    setCalendarApi={setCalendarApi}
                    handleAddEventSidebarToggle={handleAddEventSidebarToggle}
                    calendarOptions={{
                      validRange: {
                        start: minDate ? `${format(minDate, 'yyyy-MM-dd')} 00:00:00` : null,
                        end: maxDate ? `${format(maxDate, 'yyyy-MM-dd')} 23:59:59` : null
                      },
                      showNonCurrentDates: false,
                      headerToolbar: {
                        start: 'prev, next, title',
                        end: ''
                      },
                      editable: false
                    }}
                    calendarEvents={calendarEvents}
                  />
                </div>

                <AddEditVendorDialog
                  addEventSidebarOpen={addEventSidebarOpen}
                  handleAddEventSidebarToggle={handleAddEventSidebarToggle}
                  selectedCalendarEvent={selectedCalendarEvent}
                  location={user?.location || null}
                  onEventSubmitHandler={onEventSubmitHandler}
                  onEventDeleteHandler={onEventDeleteHandler}
                  maxDate={maxDate}
                />
              </AppFullCalendar>
            </Card>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default FoodChartCreation
