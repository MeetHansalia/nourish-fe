'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { Button, Card, CardContent, CircularProgress, Grid, TextField } from '@mui/material'

// Third-party Imports
import { useSelector } from 'react-redux'
import { isCancel } from 'axios'

// Util Imports
import { useTranslation } from '@/utils/getDictionaryClient'
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'

// Component Imports
import Calendar from './Calendar'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import { API_ROUTER } from '@/utils/apiRoutes'
import { profileState } from '@/redux-store/slices/profile'

/**
 * Page
 */
const MealMonitoring = props => {
  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { user = null } = useSelector(profileState)

  // Calendar States
  const [calendarApi, setCalendarApi] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [std, setStd] = useState('')
  const [grade, setGrade] = useState('')
  const [kidName, setKidName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getGetChartDataController = useRef()

  const getChartData = async (schoolId, std, grade, kidName) => {
    setIsLoading(true)
    setCalendarEvents([])

    if (getGetChartDataController.current) {
      getGetChartDataController.current.abort()
    }

    getGetChartDataController.current = new AbortController()

    try {
      const response = await axiosApiCall.get(API_ROUTER.STAFF.GET_SCHOOL_ORDERS(schoolId), {
        signal: getGetChartDataController.current.signal,
        params: { std, grade, kidName }
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
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getChartData(user?.schoolId, '', '', '')
  }, [])

  return (
    <>
      <Card sx={{ fontFamily: 'Mulish, sans-serif' }}>
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={3}>
              <TextField
                label='Standard'
                value={std}
                onChange={e => setStd(e.target.value)}
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label='Grade'
                value={grade}
                onChange={e => setGrade(e.target.value)}
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label='Kid Name'
                value={kidName}
                onChange={e => setKidName(e.target.value)}
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={1.5}>
              <Button
                variant='contained'
                color='primary'
                size='large'
                onClick={() => getChartData(user?.schoolId, std, grade, kidName)}
                disabled={!std && !grade && !kidName} // Disable if all inputs are empty
                sx={{ height: '40px', width: '100%' }}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={1.5}>
              <Button
                variant='outlined'
                color='secondary'
                size='large'
                onClick={() => {
                  setStd('')
                  setGrade('')
                  setKidName('')
                  getChartData(user?.schoolId)
                }}
                disabled={!std && !grade && !kidName} // Disable if all inputs are empty
                sx={{ height: '40px', width: '100%' }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={6} className='mt-4'>
        <Grid item xs={12}>
          {isLoading && (
            <div className='text-center'>
              <CircularProgress className='ml-1' size={20} />
            </div>
          )}
          {calendarEvents && !isLoading && (
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
                      editable: false
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
