'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter, usePathname, useParams } from 'next/navigation'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import * as yup from 'yup'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  InputLabel,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess,
  getPanelName
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { PHONE_NUMBER_DEFAULT_COUNTRY_CODE } from '@/utils/constants'

/**
 * Page
 */
const EditDetails = ({ dictionary, userData, setUserData }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const theme = useTheme()

  // Vars
  const panelName = getPanelName(pathname)

  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  // Refs
  const phoneInputCountry = useRef(userData?.countryCode || PHONE_NUMBER_DEFAULT_COUNTRY_CODE)

  /**
   * Weekdays validation scheme: Start
   */
  const weekdaysKeys = Object.keys(dictionary?.day_names?.full_names)

  const daySchema = yup.object().shape({
    open_time: yup.string().nullable(),
    close_time: yup
      .string()
      .test('close_time-required', dictionary?.form?.validation?.required, function (value) {
        const { open_time } = this.parent

        if (open_time && !value) {
          return false // Fail validation if open_time exists and close_time is empty
        }

        return true // Pass validation
      })
      .test('close_time-lessthan', dictionary?.form?.validation?.end_time_lessthan, function (value) {
        const { open_time } = this.parent

        if (open_time > value) {
          return false
        }

        return true
      })
  })

  const weekdaysSchema = weekdaysKeys?.reduce((acc, day) => {
    acc[day] = daySchema // Assigns the same schema to each weekday

    return acc
  }, {})

  // useEffect(() => {
  //   console.log('weekdaysSchema: ', weekdaysSchema)
  // }, [weekdaysSchema])
  /** Weekdays validation scheme: End */

  /**
   * Form Validation Schema
   */
  const formValidationSchema = yup.object({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    email: yup
      .string()
      .required()
      .email(dictionary?.form?.validation?.email_address)
      .label(dictionary?.form?.label?.email),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo),
    companyName: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.companyName),
    description: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.description),
    google_address: yup
      .object()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.address),
    venues: yup.array().of(
      yup.object().shape({
        // google_address: yup
        //   .object()
        //   .required(dictionary?.form?.validation?.required)
        //   .label(dictionary?.form?.label?.address),
        location: yup
          .object()
          // .nullable()
          .required(dictionary?.form?.validation?.required)
          .label(dictionary?.form?.label?.address),
        monday: yup.object().shape({
          open_time: yup.string().nullable(),
          close_time: yup
            .string()
            .test('close_time-required', dictionary?.form?.validation?.required, function (value) {
              const { open_time } = this.parent

              if (open_time && !value) {
                return false // Fail validation if open_time exists and close_time is empty
              }

              return true // Pass validation
            })
            .test('close_time-lessthan', dictionary?.form?.validation?.end_time_lessthan, function (value) {
              const { open_time } = this.parent

              if (open_time > value) {
                return false
              }

              return true
            })
        }),
        ...weekdaysSchema
      })
    )
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    countryCode: '',
    companyName: '',
    description: '',
    google_address: null,
    venues: [],
    no_of_venue: 0
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
    setError
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: formDefaultValues
  })

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'venues' // unique name for your Field Array
  })

  useEffect(() => {
    append({ name: 'venues' })
  }, [])

  useEffect(() => {
    if (userData?._id) {
      setValue('first_name', userData?.first_name ? userData?.first_name : '')
      setValue('last_name', userData?.last_name ? userData?.last_name : '')
      setValue('companyName', userData?.companyName ? userData?.companyName : '')
      setValue('email', userData?.email ? userData?.email : '')
      setValue('phoneNo', userData?.phoneNo ? userData?.phoneNo : '')
      setValue('countryCode', userData?.countryCode || '')
      setValue('description', userData?.description ? userData?.description : '')
      setValue('google_address', { ...userData?.location, description: userData?.location?.address })
    }

    if (userData.venues) {
      remove()
      let indexVenue = 0

      Object.values(userData.venues).map(function (venue) {
        append({ name: 'venues' })

        if (venue?.location) {
          // setValue('venues.' + indexVenue + '.google_address', {
          //   ...venue?.location,
          //   description: venue?.location?.address
          // })
          setValue('venues.' + indexVenue + '.location', {
            ...venue?.location,
            description: venue?.location?.address
          })
        }

        venue.openingTimes &&
          Object.keys(venue.openingTimes).map(function (day) {
            let timesObj = venue.openingTimes[day]

            setValue('venues.' + indexVenue + '.' + day + '.open_time', convertTime12to24(timesObj.openingTime))
            setValue('venues.' + indexVenue + '.' + day + '.close_time', convertTime12to24(timesObj.closingTime))
          })
        indexVenue++
      })

      setValue('no_of_venue', userData?.venues?.length || 0)
    }
  }, [userData])

  const onSubmit = async data => {
    // console.log('data: ', JSON.stringify(data))

    let formattedVenue = []

    data.venues.map(function (vendor, i) {
      let dayTimeObj = {}

      Object.keys(dictionary?.day_names?.full_names).map(function (day_name, day_name_index) {
        if (vendor[day_name]['open_time']) {
          dayTimeObj[day_name] = {
            openingTime: convertTime24to12(vendor[day_name]['open_time']),
            closingTime: convertTime24to12(vendor[day_name]['close_time'])
          }
        }
      })

      // const locationData = Object.fromEntries(
      //   Object.entries(vendor?.google_address || {}).filter(([key]) =>
      //     ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address', 'coordinates'].includes(key)
      //   )
      // )
      const locationData = Object.fromEntries(
        Object.entries(vendor?.location || {}).filter(([key]) =>
          ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address', 'coordinates'].includes(key)
        )
      )

      locationData.coordinates = [locationData.longitude, locationData.latitude]

      formattedVenue.push({
        location: locationData,
        openingTimes: dayTimeObj
      })
    })

    const locationData = Object.fromEntries(
      Object.entries(data?.google_address || {}).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    locationData.latitude = parseFloat(locationData.latitude)
    locationData.longitude = parseFloat(locationData.longitude)

    // delete data.no_of_venue
    // data.venues = formattedVenue

    const apiFormData = {
      ...data,
      ...locationData,
      no_of_venue: undefined,
      venues: formattedVenue,
      google_address: undefined
    }

    setIsFormSubmitLoading(true)

    axiosApiCall
      .patch(API_ROUTER.VENDOR.VENDOR_EDIT, apiFormData)
      .then(response => {
        const responseBody = response?.data

        setUserData(responseBody.response.userData)

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  const convertTime24to12 = timeString => {
    const [hourString, minute] = timeString.split(':')
    const hour = +hourString % 24
    let formattedHour = hour % 12 || 12

    return (formattedHour < 10 ? '0' + formattedHour : formattedHour) + ':' + minute + (hour < 12 ? ' AM' : ' PM')
  }

  const convertTime12to24 = timeString => {
    const [time, modifier] = timeString.split(' ')
    let [hours, minutes] = time.split(':')

    if (hours === '12') {
      hours = '00'
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12
    }

    return `${hours}:${minutes}`
  }

  const handleAddVenue = () => {
    setValue('no_of_venue', fields.length + 1)
    append({ name: 'vendor_data' })
  }

  const handleRemoveVenue = index => {
    setValue('no_of_venue', fields.length - 1)
    remove(index)
  }

  return (
    <Card>
      <CardHeader title={dictionary?.page?.common?.edit_information} />
      <CardContent>
        <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='first_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.first_name}
                    placeholder={dictionary?.form?.placeholder?.first_name}
                    {...(errors.first_name && { error: true, helperText: errors.first_name.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='last_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.last_name}
                    placeholder={dictionary?.form?.placeholder?.last_name}
                    {...(errors.last_name && { error: true, helperText: errors.last_name.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='companyName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.company_name}
                    placeholder={dictionary?.form?.placeholder?.company_name}
                    {...(errors.companyName && { error: true, helperText: errors.companyName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label={dictionary?.form?.label?.email_address}
                    placeholder={dictionary?.form?.placeholder?.email_address}
                    disabled
                    {...(errors.email && { error: true, helperText: errors.email.message })}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Controller
                name='phoneNo'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.phone_number}
                    placeholder={dictionary?.form?.placeholder?.phone_number}
                    {...(errors.phoneNo && { error: true, helperText: errors.phoneNo.message })}
                  />
                )}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6} className='nh-phone-input-wrapper'>
              <InputLabel
                htmlFor='phoneNo'
                className={`inline-flex ${!errors?.phoneNo ? 'text-textPrimary' : ''}  nh-phone-input-label`}
                error={!!errors?.phoneNo}
              >
                {dictionary?.form?.label?.phone_number}
              </InputLabel>
              <Controller
                in='phoneNo'
                name='phoneNo'
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    // {...field}
                    value={field?.value}
                    country={phoneInputCountry.current}
                    onChange={(value, countryData) => {
                      const dialCode = countryData?.dialCode || ''
                      const countryCode = countryData?.countryCode || ''
                      const formattedNumber = ('+' + value)?.replace(dialCode, dialCode + '-')

                      setValue('countryCode', countryCode)
                      field.onChange(formattedNumber)
                    }}
                    enableSearch
                    inputProps={{ autoComplete: 'off', ref: field?.ref }}
                    specialLabel=''
                    countryCodeEditable={false}
                    disableCountryCode={false}
                    // disableCountryGuess={true}
                    containerClass='nh-phone-input-container'
                    inputClass='w-full nh-phone-input-element'
                    inputStyle={{
                      borderColor: errors?.phoneNo ? theme?.palette?.error?.main : undefined
                    }}
                  />
                )}
              />
              {errors.phoneNo && <FormHelperText error>{errors?.phoneNo?.message}</FormHelperText>}
              {errors.countryCode && <FormHelperText error>{errors?.countryCode?.message}</FormHelperText>}
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='google_address'
                control={control}
                render={({ field }) => (
                  <GoogleAddressAutoComplete
                    {...field}
                    fullWidth
                    onChange={(_, data) => {
                      field.onChange(data?.details_for_api)

                      clearErrors('address')
                      clearErrors('country')
                      clearErrors('state')
                      clearErrors('city')
                      clearErrors('district')
                      clearErrors('latitude')
                      clearErrors('longitude')
                    }}
                    renderInput={params => (
                      <CustomTextField
                        label={dictionary?.form?.label?.address}
                        placeholder={dictionary?.form?.placeholder?.address}
                        className='autocompate-block-input-inner'
                        {...params}
                        {...(errors.google_address && {
                          error: true,
                          helperText: errors.google_address.message
                        })}
                      />
                    )}
                  />
                )}
              />
              {errors.address && <FormHelperText error>{errors?.address?.message}</FormHelperText>}
              {errors.country && <FormHelperText error>{errors?.country?.message}</FormHelperText>}
              {errors.state && <FormHelperText error>{errors?.state?.message}</FormHelperText>}
              {errors.city && <FormHelperText error>{errors?.city?.message}</FormHelperText>}
              {errors.district && <FormHelperText error>{errors?.district?.message}</FormHelperText>}
              {errors.latitude && <FormHelperText error>{errors?.latitude?.message}</FormHelperText>}
              {errors.longitude && <FormHelperText error>{errors?.longitude?.message}</FormHelperText>}
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.business_description}
                    placeholder={dictionary?.form?.placeholder?.business_description}
                    {...(errors.description && { error: true, helperText: errors.description.message })}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={6} sx={{ pt: 6 }}>
            <Grid item xs={12}>
              <Divider />
              <Typography variant='h5' sx={{ pt: 4 }}>
                {dictionary?.page?.profile_management?.venue_details}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='no_of_venue'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    disabled
                    label={dictionary?.form?.label?.no_of_venue}
                    placeholder={dictionary?.form?.placeholder?.no_of_venue}
                    {...(errors.no_of_venue && { error: true, helperText: errors.no_of_venue.message })}
                  />
                )}
              />
            </Grid>
          </Grid>

          {fields.map((fieldOfHookForm, index) => {
            return (
              <span key={fieldOfHookForm.id}>
                <Grid container spacing={6} sx={{ pt: 6 }}>
                  <Grid item xs={12}>
                    {/* <Controller
                      name={`venues.${index}.google_address`}
                      control={control}
                      render={({ field }) => (
                        <GoogleAddressAutoComplete
                          {...field}
                          fullWidth
                          onChange={(_, data) => {
                            field.onChange(data?.details_for_api || null)

                            // if (!data?.details_for_api) {
                            //   setValue(`venues.${index}.google_address`, data?.details_for_api || null)
                            // }
                          }}
                          renderInput={params => (
                            <CustomTextField
                              label={`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.address}`}
                              placeholder={dictionary?.form?.placeholder?.address}
                              className='autocompate-block-input-inner'
                              {...params}
                              {...(errors.venues?.[index]?.google_address && {
                                error: true,
                                helperText: errors.venues?.[index]?.google_address.message
                              })}
                            />
                          )}
                        />
                      )}
                      defaultValue={null}
                    /> */}
                    <Controller
                      name={`venues.${index}.location`}
                      control={control}
                      render={({ field }) => (
                        <GoogleAddressAutoComplete
                          {...field}
                          fullWidth
                          onChange={(_, data) => {
                            field.onChange(data?.details_for_api || null)
                          }}
                          renderInput={params => (
                            <CustomTextField
                              label={`${dictionary?.form?.label?.venue}-${index + 1} ${dictionary?.form?.label?.address}`}
                              placeholder={dictionary?.form?.placeholder?.address}
                              className='autocompate-block-input-inner'
                              {...params}
                              {...(errors.venues?.[index]?.location && {
                                error: true,
                                helperText: errors.venues?.[index]?.location.message
                              })}
                            />
                          )}
                        />
                      )}
                      defaultValue={null}
                    />
                    {errors?.venues?.[index]?.location?.address && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.address?.message}</FormHelperText>
                    )}
                    {errors?.venues?.[index]?.location?.country && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.country?.message}</FormHelperText>
                    )}
                    {errors?.venues?.[index]?.location?.state && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.state?.message}</FormHelperText>
                    )}
                    {errors?.venues?.[index]?.location?.city && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.city?.message}</FormHelperText>
                    )}
                    {errors?.venues?.[index]?.location?.district && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.district?.message}</FormHelperText>
                    )}
                    {errors?.venues?.[index]?.location?.latitude && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.latitude?.message}</FormHelperText>
                    )}
                    {errors?.venues?.[index]?.location?.longitude && (
                      <FormHelperText error>{errors?.venues?.[index]?.location?.longitude?.message}</FormHelperText>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ pt: 2 }}>
                  <Grid item xs={12}>
                    <div className='d-flex justify-content-between'>
                      <h5>
                        {dictionary?.form?.label?.venue +
                          ' -' +
                          (index + 1) +
                          ' ' +
                          dictionary?.form?.label?.opening_hours}
                      </h5>
                      {index != 0 && <Chip label='x' variant='outlined' onClick={() => handleRemoveVenue(index)} />}
                    </div>
                  </Grid>

                  {dictionary?.day_names?.full_names &&
                    Object.keys(dictionary?.day_names?.full_names).map(day_name => (
                      <Grid item xs={6} sm={4} md={4} lg={3} xl={2} key={'days-' + day_name}>
                        <Controller
                          name={`venues.${index}.${day_name}.open_time`}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              type='time'
                              {...field}
                              fullWidth
                              label={dictionary?.day_names?.full_names[day_name]}
                              placeholder={dictionary?.form?.placeholder?.open}
                              className={'pb-2'}
                              onChange={e => {
                                field.onChange(e.target.value)
                                clearErrors(`venues.${index}.openingTimes.${day_name}.openingTime`)
                              }}
                              {...(errors.venues?.[index]?.[day_name]?.open_time && {
                                error: true,
                                helperText: errors.venues?.[index]?.[day_name]?.open_time.message
                              })}
                            />
                          )}
                          defaultValue=''
                        />
                        {errors?.venues?.[index]?.openingTimes?.[day_name]?.openingTime && (
                          <FormHelperText error>
                            {errors?.venues?.[index]?.openingTimes?.[day_name]?.openingTime?.message}
                          </FormHelperText>
                        )}

                        <Controller
                          name={`venues.${index}.${day_name}.close_time`}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              type='time'
                              {...field}
                              fullWidth
                              placeholder={dictionary?.form?.placeholder?.close}
                              onChange={e => {
                                field.onChange(e.target.value)
                                clearErrors(`venues.${index}.openingTimes.${day_name}.closingTime`)
                              }}
                              {...(errors.venues?.[index]?.[day_name]?.close_time && {
                                error: true,
                                helperText: errors.venues?.[index]?.[day_name]?.close_time.message
                              })}
                            />
                          )}
                          defaultValue=''
                        />

                        {errors?.venues?.[index]?.openingTimes?.[day_name]?.closingTime && (
                          <FormHelperText error>
                            {errors?.venues?.[index]?.openingTimes?.[day_name]?.closingTime?.message}
                          </FormHelperText>
                        )}
                      </Grid>
                    ))}
                </Grid>
              </span>
            )
          })}

          <Grid container sx={{ pt: 5 }} spacing={20} direction='column' alignItems='center' justifyContent='center'>
            <Grid item xs={12}>
              <Button
                variant='contained'
                sx={{ m: 1 }}
                type='button'
                color='primary'
                onClick={() => {
                  handleAddVenue()
                }}
                disabled={isFormSubmitLoading}
              >
                {dictionary?.form?.button?.add_venue}
              </Button>
              <Button disabled={isFormSubmitLoading} variant='contained' sx={{ m: 1 }} type='submit'>
                {dictionary?.form?.button?.submit}
                {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
              </Button>
              <Button
                variant='customLight'
                color='secondary'
                type='reset'
                onClick={() => {
                  router.push(getLocalizedUrl(`/${panelName}`, locale))
                }}
                sx={{ m: 1 }}
                disabled={isFormSubmitLoading}
              >
                {dictionary?.form?.button?.cancel}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default EditDetails
