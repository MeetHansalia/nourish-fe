'use client'

import { useEffect, useState, useRef, forwardRef } from 'react'

import { useParams, usePathname, useRouter } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'

//  Third-party imports should come first
import { addDays, differenceInDays, format, eachDayOfInterval } from 'date-fns'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material'

// Local imports come after third-party imports
import axiosApiCall from '@/utils/axiosApiCall'

import { apiResponseErrorHandling, getPanelName, toastError, toastSuccess } from '@/utils/globalFunctions'

import { getLocalizedUrl } from '@/utils/i18n'

import { useTranslation } from '@/utils/getDictionaryClient'

import { API_ROUTER } from '@/utils/apiRoutes'

import { setDates, getSingleDate } from '@/redux-store/slices/dateSlice'

// Relative imports come last
import Calendar from './Calendar'

import AppFullCalendar from '@/libs/styles/AppFullCalendar'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import CustomTextField from '@/@core/components/mui/TextField'

const DateSelection = ({ dictionary }) => {
  const router = useRouter()

  const dispatch = useDispatch()

  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)

  // const calendarRef = useRef(null)

  const pathname = usePathname()

  const panelName = getPanelName(pathname)

  const [selectedVendor, setSelectedVendor] = useState(null)

  const [kidData, setKidData] = useState(null)

  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const [events, setEvents] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [startDate, setStartDate] = useState(null)

  const [endDate, setEndDate] = useState(null)

  const [calStartDate, setCalStartDate] = useState(null)

  const [calEndDate, setCalEndDate] = useState(null)

  const [selectedDates, setSelectedDates] = useState([])

  const [error, setError] = useState('')

  const [dialogReplaceOpen, setDialogReplaceOpen] = useState(false)

  const [oldCartDate, setOldCartDate] = useState()

  const [orderType, setOrderType] = useState(null)

  const [orderTypeDialog, setOrderTypeDialog] = useState(false)

  const [orderTypeValue, setOrderTypeValue] = useState()

  const singleDate = useSelector(state => state.date.singleDate)

  const userId = useSelector(state => state.profile.user?._id)

  const handleOnChange = dates => {
    const [start, end] = dates

    setStartDate(start)

    if (start && end) {
      const daysSelected = differenceInDays(end, start)

      if (daysSelected > 14) {
        setError('You can select a maximum of 14 days.')

        return
      } else {
        setError('')
      }

      setStartDate(start)
      setEndDate(end)

      // Get all dates in the range and filter out weekends
      const allDates = eachDayOfInterval({ start, end }).filter(date => {
        const day = date.getDay()

        return day !== 0 && day !== 6 // Exclude Sundays (0) and Saturdays (6)
      })

      setSelectedDates(allDates)
    }
  }

  const replaceOrder = async () => {
    try {
      const payload = {
        userId
      }

      // Submit to API
      await axiosApiCall.post(API_ROUTER.STAFF.REMOVE_CART_QUANTITY, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      setDialogReplaceOpen(false)

      if (orderType === 'multiple') {
        fetchLatestMultipleCartDetails()
      } else {
        fetchLatestCartDetails()
      }
    } catch (error) {
      console.error('Error submitting cart item:', error)
    }
  }

  const CustomInput = forwardRef((props, ref) => {
    const { label, start, end, ...rest } = props

    const value = start
      ? `${format(start, 'MM/dd/yyyy')}${end ? ` - ${format(end, 'MM/dd/yyyy')}` : ''}`
      : 'Please select dates'

    return <CustomTextField fullWidth inputRef={ref} {...rest} label={label} value={value} />
  })

  const handleRedirect = () => {
    fetchLatestMultipleCartDetails()
    setOrderType('multiple')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoaded(true)

        if (calStartDate && calEndDate) {
          // const calendarApi = calendarRef.current.getApi()
          // const visibleStart = calendarApi.view.currentStart
          // const visibleEnd = calendarApi.view.currentEnd

          // const formattedStartDate = visibleStart.toISOString().slice(0, 10)

          // const formattedEndDate = visibleEnd.toISOString().slice(0, 10)

          const params = new URLSearchParams({
            startDate: calStartDate,
            endDate: calEndDate
          }).toString()

          const response = await axiosApiCall.get(`${API_ROUTER.STAFF.GET_AVAILABLE_VENDORS}?${params}`)

          const vendors = response.data?.response || []

          // const mappedEvents = vendors.map(item => ({
          //   title: item.vendorId?.first_name || 'Unknown Vendor',
          //   start: item.date,
          //   details: item.details,
          //   id: item.vendorId?._id
          // }))

          // setEvents(mappedEvents)
          setEvents(vendors)

          // toastSuccess(response?.data?.message)
          setOrderTypeDialog(true)
        }
      } catch (error) {
        const errorMessage = apiResponseErrorHandling(error)

        toastError(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    }

    fetchData()
  }, [userId, calStartDate, calEndDate])

  const fetchLatestMultipleCartDetails = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.STAFF.GET_DATE_WISE_CART(userId))

      if ((response?.data?.length || 0) > 0) {
        setOldCartDate(response?.data[0]?.orderDate)
        setDialogReplaceOpen(true)

        return
      }

      const formattedDates = selectedDates.map(date => format(date, 'dd-MMM-EEE'))

      dispatch(setDates(formattedDates))

      if (formattedDates) {
        const url = getLocalizedUrl(`${panelName}/meal-selection/weekly-selection`, locale)

        router.push(url)
      }
    } catch (error) {
      console.error('Error fetching updated cart:', error)
    }
  }

  const fetchLatestCartDetails = async () => {
    try {
      console.log('userId', userId)
      const response = await axiosApiCall.get(API_ROUTER.STAFF.GET_CART_DETAILS(userId))

      setOrderType('single')

      if (response?.data?.orderDate && response?.data?.orderDate !== singleDate) {
        setOldCartDate(response?.data?.orderDate)
        setDialogReplaceOpen(true)

        return
      }

      router.push(getLocalizedUrl(`${panelName}/meal-selection/${selectedVendor}`, locale))
    } catch (error) {
      console.error('Error fetching updated cart:', error)
    }
  }

  const handleReplaceDialogClose = () => {
    setDialogReplaceOpen(false)
    setSelectedVendor(null)
  }

  const checkRun = useRef(false)

  useEffect(() => {
    if (selectedVendor) {
      fetchLatestCartDetails()
    }
  }, [selectedVendor])

  const handleOrderTypeDialogClose = () => {
    setOrderTypeDialog(false)
  }

  const orderTypeSelected = () => {
    setOrderTypeDialog(false)
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card className='common-block-dashboard'>
            <CardContent className='common-form-dashboard p-0'>
              <CardHeader
                className='p-0'
                title={isDataLoaded ? `${kidData?.first_name || ''} ${kidData?.last_name || ''}` : 'Loading...'}
              />

              <Grid container spacing={6}>
                <Grid item xs={12}>
                  {orderTypeValue === 'multiple' && (
                    <div className='form-group'>
                      <AppReactDatepicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        selected={startDate}
                        id='date-range-picker'
                        onChange={handleOnChange}
                        shouldCloseOnSelect={false}
                        minDate={addDays(new Date(), 7)} // Start selection after 7 days
                        maxDate={addDays(new Date(), 21)} // Allow up to 14 days from minDate
                        filterDate={date => {
                          const day = date.getDay()

                          return day !== 0 && day !== 6 // Disable weekends (Sunday = 0, Saturday = 6)
                        }}
                        dayClassName={date => (date.toDateString() === new Date().toDateString() ? 'bold-date' : '')}
                        customInput={<CustomInput label='Date Range' start={startDate} end={endDate} />}
                      />
                      {error && <span style={{ color: 'red' }}>{error}</span>}
                    </div>
                  )}
                </Grid>
              </Grid>
              {orderTypeValue === 'multiple' && (
                <div className='flex justify-center' sx={{ alignItems: 'center' }}>
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{ mt: 2 }}
                    className='theme-common-btn min-width-auto'
                    onClick={handleRedirect}
                    disabled={!startDate || !endDate || isSubmitting}
                  >
                    {isSubmitting ? 'Loading...' : `${dictionary?.common?.weekly_order}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} className='pt-0'>
          <Card className='overflow-visible common-block-dashboard p-0'>
            <AppFullCalendar className='app-calendar'>
              <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
                <Calendar
                  events={events}
                  setCalStartDate={setCalStartDate}
                  setCalEndDate={setCalEndDate}
                  // onOrderNow={handleOrderNow}
                  setSelectedVendor={setSelectedVendor}
                  orderTypeValue={orderTypeValue}
                />
              </div>
            </AppFullCalendar>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={dialogReplaceOpen}
        onClose={handleReplaceDialogClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>{dictionary?.form?.placeholder?.replace_cart_item}?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {dictionary?.dialog?.your_cart_contains_dishes_for} {oldCartDate}.{' '}
            {orderType == 'single' ? dictionary?.dialog?.do_you_want_to_discard : dictionary?.dialog?.do_you_want_to}{' '}
            {orderType == 'single' ? singleDate : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleReplaceDialogClose}>{dictionary?.form?.placeholder?.no}</Button>
          <Button onClick={() => replaceOrder()}>{dictionary?.form?.placeholder?.replace}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={orderTypeDialog}
        onClose={handleOrderTypeDialogClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>{dictionary?.datatable?.column?.select_order_type}?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            <RadioGroup value={orderTypeValue} onChange={e => setOrderTypeValue(e.target.value)}>
              <FormControlLabel value='single' control={<Radio />} label='Single Day Ordering' />
              <FormControlLabel value='multiple' control={<Radio />} label='Multiple Day Ordering' />
            </RadioGroup>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          {/* <Button onClick={handleOrderTypeDialogClose}>{dictionary?.form?.button?.cancel}</Button> */}
          <Button onClick={() => orderTypeSelected()}>{dictionary?.form?.button?.submit}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DateSelection
