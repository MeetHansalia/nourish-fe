'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { format, parse, isValid } from 'date-fns'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

// Lib Style Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  getPanelName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { getLocalizedUrl } from '@/utils/i18n'
import { PHONE_NUMBER_DEFAULT_COUNTRY_CODE } from '@/utils/constants'

/**
 * Page
 */
const EditDetails = ({ dictionary, userData, setUserData }) => {
  // Hooks
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
    schoolName: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.schoolName),
    google_address: yup.object().required(dictionary?.form?.validation?.required),
    expectedDeliveryTime: yup.string().nullable().label(dictionary?.form?.label?.expected_delivery_time)
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    countryCode: '',
    schoolName: '',
    google_address: null,
    expectedDeliveryTime: null
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: formDefaultValues
  })

  useEffect(() => {
    if (userData?._id) {
      setValue('first_name', userData?.first_name ? userData?.first_name : '')
      setValue('last_name', userData?.last_name ? userData?.last_name : '')
      setValue('schoolName', userData?.schoolName ? userData?.schoolName : '')
      setValue('email', userData?.email ? userData?.email : '')
      setValue('phoneNo', userData?.phoneNo ? userData?.phoneNo : '')
      setValue('countryCode', userData?.countryCode || '')

      if (userData?.location) {
        setValue('google_address', { ...userData?.location, description: userData?.location?.address })
      }

      if (userData?.expectedDeliveryTime) {
        const expectedDeliveryTimeParsed = parse(userData?.expectedDeliveryTime, 'h:mm aa', new Date())

        if (isValid(expectedDeliveryTimeParsed)) {
          setValue('expectedDeliveryTime', expectedDeliveryTimeParsed)
        }
      }
    }
  }, [userData])

  const onSubmit = async data => {
    const locationData = Object.fromEntries(
      Object.entries(data?.google_address || {}).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined,
      expectedDeliveryTime: data?.expectedDeliveryTime
        ? format(data?.expectedDeliveryTime, 'h:mm aa')
        : data?.expectedDeliveryTime
    }

    setIsFormSubmitLoading(true)

    axiosApiCall
      .patch(API_ROUTER.SCHOOL_ADMIN_DASHBOARD, apiFormData)
      .then(response => {
        const responseBody = response?.data

        setUserData(responseBody.response.userData)

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
        router.push(getLocalizedUrl(`/${panelName}`, locale))
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

  return (
    <Card>
      <CardHeader title={dictionary?.page?.common?.edit_information} />
      <CardContent>
        <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
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
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
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
                name='schoolName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    // label={dictionary?.form?.label?.company_name}
                    label={dictionary?.form?.label?.school_name}
                    placeholder={dictionary?.form?.placeholder?.school_name}
                    {...(errors.schoolName && { error: true, helperText: errors.schoolName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
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
            {/* <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
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
                    }}
                    renderInput={params => (
                      <CustomTextField
                        label={dictionary?.form?.label?.school_address}
                        placeholder={dictionary?.form?.placeholder?.school_address}
                        {...params}
                        {...(errors?.google_address && { error: true, helperText: errors?.google_address?.message })}
                      />
                    )}
                    noOptionsText={dictionary?.common?.no_locations}
                  />
                )}
              />
              {/* {errors.google_address && <FormHelperText error>{errors?.google_address?.message}</FormHelperText>} */}
              {errors.address && <FormHelperText error>{errors?.address?.message}</FormHelperText>}
              {errors.country && <FormHelperText error>{errors?.country?.message}</FormHelperText>}
              {errors.state && <FormHelperText error>{errors?.state?.message}</FormHelperText>}
              {errors.city && <FormHelperText error>{errors?.city?.message}</FormHelperText>}
              {errors.district && <FormHelperText error>{errors?.district?.message}</FormHelperText>}
              {errors.latitude && <FormHelperText error>{errors?.latitude?.message}</FormHelperText>}
              {errors.longitude && <FormHelperText error>{errors?.longitude?.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Controller
                name='expectedDeliveryTime'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    selected={value}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={5}
                    onChange={onChange}
                    dateFormat='h:mm aa'
                    customInput={
                      <CustomTextField
                        value={value}
                        onChange={onChange}
                        fullWidth
                        label={dictionary?.form?.label?.expected_delivery_time}
                        placeholder={dictionary?.form?.placeholder?.expected_delivery_time}
                        {...(errors.expectedDeliveryTime && {
                          error: true,
                          helperText: errors.expectedDeliveryTime.message
                        })}
                      />
                    }
                    placeholderText={dictionary?.form?.placeholder?.expected_delivery_time}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} className='flex justify-center gap-2'>
              <Button disabled={isFormSubmitLoading} variant='contained' type='submit'>
                {dictionary?.form?.button?.submit}
                {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
              </Button>
              <Button
                variant='customLight'
                disabled={isFormSubmitLoading}
                type='reset'
                onClick={() => {
                  router.push(getLocalizedUrl(`/${panelName}`, locale))
                }}
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
