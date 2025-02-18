// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Switch,
  Typography
} from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { useInView } from 'react-intersection-observer'
import { isCancel } from 'axios'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { addDays, format } from 'date-fns'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@/@core/components/mui/Avatar'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'
import { useTranslation } from '@/utils/getDictionaryClient'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { API_ROUTER } from '@/utils/apiRoutes'

/**
 * Page
 */
const AddEventSidebar = props => {
  // Props
  const {
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    selectedCalendarEvent,
    location,
    onEventSubmitHandler,
    onEventDeleteHandler,
    maxDate
  } = props

  // States

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    title: yup.string().required(t('form.validation.required')),
    vendorId: yup.string().required(t('form.validation.required')),
    isRecurring: yup.boolean(),
    recurringEndDate: yup
      .date()
      .nullable()
      .when('isRecurring', {
        is: true,
        then: () => yup.date().required(t('form.validation.required'))
      })
  })

  const defaultValues = {
    id: '',
    title: '',
    vendorId: '',
    start: null,
    extendedProps: {},
    isRecurring: false,
    recurringEndDate: null
  }

  const {
    control,
    setValue,
    reset,
    clearErrors,
    handleSubmit,
    watch,
    getValues,
    formState: { errors }
  } = useForm({ resolver: yupResolver(formValidationSchema), defaultValues: defaultValues })

  const vendorId = watch('vendorId')
  const isRecurring = watch('isRecurring')

  useEffect(() => {
    const selectedVendor = vendors?.find(item => item['_id'] === vendorId)

    if (selectedVendor) {
      setValue('title', selectedVendor?.first_name + ' ' + selectedVendor?.last_name)
    }
  }, [vendorId])

  useEffect(() => {
    // console.log('selectedCalendarEvent: ', selectedCalendarEvent)

    reset({
      id: selectedCalendarEvent?.id || '',
      title: selectedCalendarEvent?.title || '',
      vendorId: selectedCalendarEvent?.extendedProps?.vendorId || '',
      start: selectedCalendarEvent?.startStr || '',
      extendedProps: selectedCalendarEvent?.extendedProps || {},
      isRecurring: false,
      recurringEndDate: null
    })
  }, [selectedCalendarEvent])

  const onSubmit = data => {
    // console.log('in onSubmit: data: ', data)

    const modifiedEvent = {
      id: data?.id || '',
      title: data.title,
      start: data.start,
      extendedProps: {
        ...data?.extendedProps,
        vendorId: data?.vendorId,
        isDelete: false,
        isRecurring: data?.isRecurring,
        recurringEndDate:
          data?.isRecurring && data?.recurringEndDate ? format(data?.recurringEndDate, 'yyyy-MM-dd') : null
      }
    }

    // console.log('modifiedEvent: ', modifiedEvent)

    if (typeof onEventSubmitHandler === 'function') {
      onEventSubmitHandler(modifiedEvent)
    }

    handleSidebarClose()
  }
  /** Page form: End */

  /**
   * Fetch near by Vendors: Start
   */
  const { ref: vendorListRef, inView: vendorListInView, entry: vendorListEntry } = useInView({ threshold: 0 })
  const [isGetNearByVendorsListLoading, setIsGetNearByVendorsListLoading] = useState(false)
  const getNearByVendorsListController = useRef()
  const [vendors, setVendors] = useState([])

  const vendorsListApiInputDefaultValue = {
    page: 1,
    limit: 10,
    hasMore: true,
    searchQuery: ''
    // lat: location?.latitude || '',
    // lng: location?.longitude || ''
  }

  const [vendorsListApiInput, setVendorsListApiInput] = useState(vendorsListApiInputDefaultValue)

  const getNearByVendorsList = () => {
    if (isGetNearByVendorsListLoading) {
      return
    }

    setIsGetNearByVendorsListLoading(true)

    if (getNearByVendorsListController.current) {
      getNearByVendorsListController.current?.abort()
    }

    getNearByVendorsListController.current = new AbortController()

    if (vendorsListApiInput?.page === 1) {
      setVendors([])
    }

    axiosApiCall
      .get(API_ROUTER.STATE.GET_NEAR_BY_VENDORS, {
        signal: getNearByVendorsListController?.current?.signal,
        params: {
          ...vendorsListApiInput,
          hasMore: undefined
        }
      })
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        // console.log('responseBodyData: ', responseBodyData)

        const vendorsData = responseBodyData?.vendors

        if (vendorsData?.length > 0) {
          setVendorsListApiInput(prevPagination => ({
            ...prevPagination,
            page: prevPagination?.page + 1
          }))
          setVendors(prevData => [...prevData, ...vendorsData])
        } else {
          setVendorsListApiInput(prevPagination => ({
            ...prevPagination,
            hasMore: false
          }))
        }

        setIsGetNearByVendorsListLoading(false)
      })
      .catch(error => {
        setIsGetNearByVendorsListLoading(false)

        if (!isCancel(error)) {
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  useEffect(() => {
    if (vendorListInView && vendorsListApiInput?.hasMore && addEventSidebarOpen && vendors?.length > 0) {
      getNearByVendorsList()
    }
  }, [vendorListInView])

  useEffect(() => {
    if (vendorListInView && vendorsListApiInput?.hasMore && addEventSidebarOpen && vendors?.length > 0) {
      getNearByVendorsList()
    }
  }, [vendors])
  /** Fetch near by Vendors: End */

  /**
   * Delete calendar event: Start
   */
  const deleteCalendarEventButtonClickHandler = () => {
    const data = getValues()

    const modifiedEvent = {
      id: data?.id || '',
      title: data.title,
      start: data.start,
      extendedProps: {
        ...data?.extendedProps,
        vendorId: data?.vendorId,
        isDelete: true,
        isRecurring: false,
        recurringEndDate: null
      }
    }

    if (typeof onEventDeleteHandler === 'function') {
      onEventDeleteHandler(modifiedEvent)
    }

    handleSidebarClose()
  }
  /** Delete calendar event: End */

  /**
   * General functions: Start
   */
  const handleSidebarClose = () => {
    clearErrors()
    handleAddEventSidebarToggle()

    try {
      if (getNearByVendorsListController.current) {
        getNearByVendorsListController.current?.abort()
      }
    } catch (error) {}

    setVendors([])
    setVendorsListApiInput(vendorsListApiInputDefaultValue)
  }
  /** General functions: End */

  /**
   * Recurring Flow: Start
   */
  const selectedDateDayFilter = date => {
    return date?.getDay() === selectedCalendarEvent?.start?.getDay()
  }
  /** Recurring Flow: End */

  /**
   * Vendor search feature: Start
   */
  const handleChange = e => {
    setIsGetNearByVendorsListLoading(false)

    if (getNearByVendorsListController.current) {
      getNearByVendorsListController.current?.abort()
    }

    setVendorsListApiInput(prevPagination => ({
      ...prevPagination,
      searchQuery: e?.target?.value || '',
      page: 1,
      hasMore: true
    }))
  }

  useEffect(() => {
    let getNearByVendorsListTimer = null

    if (addEventSidebarOpen) {
      getNearByVendorsListTimer = setTimeout(() => {
        if (getNearByVendorsListController.current) {
          getNearByVendorsListController.current?.abort()
        }

        getNearByVendorsList()
      }, 500)
    }

    return () => {
      clearTimeout(getNearByVendorsListTimer)
    }
  }, [vendorsListApiInput?.searchQuery])
  /** Vendor search feature: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    if (addEventSidebarOpen) {
      getNearByVendorsList()
    } else {
      if (getNearByVendorsListController.current) {
        getNearByVendorsListController.current?.abort()
      }
    }
  }, [addEventSidebarOpen])
  /** Page Life Cycle: End */

  return (
    <Dialog
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {t('page.food_chart_creation.vendor_near_by')}
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pli-16'>
        <DialogCloseButton onClick={handleSidebarClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className='flex flex-col gap-6'>
          <Grid container spacing={6}>
            <Grid item xs={12} className='hidden'>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    InputProps={{
                      readOnly: true
                    }}
                    readOnly
                    fullWidth
                    label='Title'
                    {...(errors?.title && { error: true, helperText: errors?.title?.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                placeholder={t('datatable.common.search_placeholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
                }}
                // value={searchTerm}
                value={vendorsListApiInput?.searchQuery}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl error={Boolean(errors?.vendorId)} className='w-full'>
                <Controller
                  name='vendorId'
                  className='role-radio-block w-full'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup className='role-radio-block w-full' row {...field} name='radio-buttons-group'>
                      <div
                        className='
                        p-2 w-full h-60 
                        overflow-y-auto border rounded-lg 
                        scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200
                      '
                      >
                        {vendors?.map((vendor, index) => (
                          <FormControlLabel
                            key={index}
                            labelPlacement='start'
                            value={vendor?._id}
                            control={<Radio name='vendorId' />}
                            className='w-full justify-between ml-2'
                            label={
                              <div className='flex w-full items-center gap-3'>
                                <CustomAvatar src={vendor?.avatar} size={34} />
                                <div className='flex flex-col'>
                                  <Typography className='font-medium' color='text.primary'>
                                    {`${vendor?.first_name} ${vendor?.last_name}`}
                                  </Typography>
                                </div>
                              </div>
                            }
                          />
                        ))}

                        {isGetNearByVendorsListLoading && (
                          <div className='text-center w-full'>
                            <CircularProgress />
                          </div>
                        )}
                        {!isGetNearByVendorsListLoading && !vendorsListApiInput?.hasMore && vendors?.length === 0 && (
                          <div className='text-center w-full'>{t('datatable.common.no_data_available')}</div>
                        )}
                        {/* {!vendorsListApiInput?.hasMore && <p style={{ textAlign: 'center' }}>You have seen it all!</p>} */}
                        {vendorsListApiInput?.hasMore && <div ref={vendorListRef} style={{ height: '2px' }} />}
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.vendorId && <FormHelperText error>{errors?.vendorId?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* <Grid item xs={12}>
              <Controller
                name='start'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    selected={value}
                    readOnly={false}
                    dateFormat={'yyyy-MM-dd'}
                    onChange={onChange}
                    customInput={<CustomTextField InputProps={{ readOnly: false }} label='Start Date' fullWidth />}
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12}>
              <Controller
                name='isRecurring'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} name='isRecurring' />}
                    label={t('form.label.is_recurring')}
                  />
                )}
              />
            </Grid>

            {isRecurring && (
              <Grid item xs={12}>
                <Controller
                  name='recurringEndDate'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AppReactDatepicker
                      selected={value}
                      minDate={addDays(selectedCalendarEvent?.start, 1)}
                      maxDate={maxDate}
                      dateFormat={'yyyy-MM-dd'}
                      onChange={onChange}
                      customInput={
                        <CustomTextField
                          label={t('form.label.end_date')}
                          fullWidth
                          {...(errors?.recurringEndDate && {
                            error: true,
                            helperText: errors?.recurringEndDate?.message
                          })}
                        />
                      }
                      filterDate={selectedDateDayFilter}
                    />
                  )}
                />
                {/* {errors?.recurringEndDate && <FormHelperText error>{errors?.recurringEndDate?.message}</FormHelperText>} */}
              </Grid>
            )}

            {/* <Grid item xs={12}>
              {JSON.stringify(errors)}
            </Grid> */}
            {/* <Grid item xs={12}>
              {JSON.stringify(vendorsListApiInput)}
            </Grid> */}

            <Grid item xs={12}>
              <div className='flex items-center gap-4'>
                <Button type='submit' variant='contained'>
                  {t('form.button.submit')}
                </Button>

                <Button
                  variant='contained'
                  color='secondary'
                  type='button'
                  onClick={handleSidebarClose}
                  sx={{ backgroundColor: `var(--nh-primary-light-color)` }}
                >
                  {t('form.button.cancel')}
                </Button>

                {selectedCalendarEvent?.extendedProps?.vendorId && (
                  <Button
                    variant='contained'
                    color='error'
                    startIcon={<i className='tabler-trash' />}
                    onClick={deleteCalendarEventButtonClickHandler}
                  >
                    {t('form.button.delete')}
                  </Button>
                )}
              </div>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEventSidebar
