'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams, useSearchParams } from 'next/navigation'

// MUI Imports
import { Card, CircularProgress, Grid } from '@mui/material'

import { isCancel } from 'axios'

// Util Imports
import { useTranslation } from '@/utils/getDictionaryClient'
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError, toastSuccess } from '@/utils/globalFunctions'

// Component Imports
import Calendar from './Calendar'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import { API_ROUTER } from '@/utils/apiRoutes'
import LocationSelectorForm from '../LocationSelectorForm'

/**
 * Page
 */
const MealMonitoring = props => {
  // Hooks
  const { lang: locale, dictionary: dictionary } = useParams()
  const { t } = useTranslation(locale)

  // Calendar States
  const [calendarApi, setCalendarApi] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [isGetChartDataLoading, setIsGetChartDataLoading] = useState(false)
  const [schoolId, setSchoolId] = useState(null) // Store selected schoolId
  const [kidName, setKidName] = useState(null)

  const getGetChartDataController = useRef()

  const getChartData = async schoolId => {
    setIsGetChartDataLoading(true)
    setCalendarEvents([])

    if (getGetChartDataController.current) {
      getGetChartDataController.current.abort()
    }

    getGetChartDataController.current = new AbortController()

    try {
      const params = kidName ? { kidName } : {}

      const response = await axiosApiCall.get(API_ROUTER.ADMIN.GET_SCHOOL_ORDERS(schoolId), {
        params,
        signal: getGetChartDataController.current.signal
      })

      const foodChart = response?.data?.response?.orders || []

      const eventsData = foodChart.map(order => {
        let eventClass = 'capitalize '

        if (order?.orderStatus === 'Reject') {
          eventClass += 'event-bg-warning'
        } else if (order?.orderStatus === 'Approved') {
          eventClass += 'event-bg-primary bg-green-800/50'
        } else {
          eventClass += 'event-bg-primary bg-green-600/50'
        }

        return {
          id: order._id,
          title: `${order?.orderItems[0]?.dishId?.name || 'Unknown Dish'} - ${order?.orderStatus || 'Pending'}`,
          start: order.orderDate,
          extendedProps: {
            vendorId: order?.vendorId?._id,
            vendorName: `${order?.vendorId?.first_name || ''} ${order?.vendorId?.last_name || ''}`,
            dishName: order?.orderItems?.dishId?.name || 'Unknown Dish'
          },
          classNames: eventClass
        }
      })

      setCalendarEvents(eventsData)
    } catch (error) {
      if (!isCancel(error)) {
        const errorMessage = apiResponseErrorHandling(error)

        toastError(errorMessage)
      }
    } finally {
      setIsGetChartDataLoading(false)
    }
  }

  const searchParams = useSearchParams()

  const selectedData = {
    country: searchParams.get('countryId')
      ? { _id: searchParams.get('countryId'), name: searchParams.get('countryName') }
      : null,
    state: searchParams.get('stateId')
      ? { _id: searchParams.get('stateId'), name: searchParams.get('stateName') }
      : null,
    district: searchParams.get('districtId')
      ? { _id: searchParams.get('districtId'), districtName: searchParams.get('districtName') }
      : null,
    school: searchParams.get('schoolId')
      ? { _id: searchParams.get('schoolId'), name: searchParams.get('schoolName') }
      : null,
    ...(searchParams.get('kidName') && { kidName: searchParams.get('kidName') })
  }

  useEffect(() => {
    if (schoolId) {
      getChartData(schoolId)
    }
  }, [schoolId, kidName])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <LocationSelectorForm
            dictionary={dictionary}
            showButton={false}
            spacing={2}
            lg={3}
            selectedParamData={selectedData}
            onSchoolSelect={setSchoolId}
            setKidName={setKidName}
          />
        </Grid>

        <Grid item xs={12}>
          {/* {isGetChartDataLoading && (
            <div className='text-center'>
              <CircularProgress className='ml-1' size={20} />
            </div>
          )} */}
          {calendarEvents && (
            <Card className='overflow-visible'>
              <AppFullCalendar className='app-calendar'>
                <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
                  <Calendar
                    calendarApi={calendarApi}
                    setCalendarApi={setCalendarApi}
                    calendarOptions={{
                      showNonCurrentDates: false,
                      headerToolbar: {
                        start: 'prev, next, title',
                        end: ''
                      },
                      editable: false,
                      eventClick: null
                    }}
                    calendarEvents={calendarEvents}
                  />
                </div>
              </AppFullCalendar>
            </Card>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default MealMonitoring
