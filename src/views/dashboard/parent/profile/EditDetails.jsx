'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter, usePathname, useParams } from 'next/navigation'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import * as yup from 'yup'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

import { setProfile } from '@/redux-store/slices/profile'

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
const EditDetails = ({ dictionary, userData, setUserData, profileUploadedFile, selectedAvatar }) => {
  // Hooks
  const router = useRouter()
  const dispatch = useDispatch()
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const theme = useTheme()

  // Vars
  const panelName = getPanelName(pathname)

  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  // const [selectedGender, setSelectedGender] = useState('')
  // const genders = dictionary?.form?.dropdown.genders

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
    // schoolName: yup
    //   .string()
    //   .required(dictionary?.form?.validation?.required)
    //   .label(dictionary?.form?.label?.school_name),
    email: yup
      .string()
      .required()
      .email(dictionary?.form?.validation?.email_address)
      .label(dictionary?.form?.label?.email),
    // gender: yup.string(),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo)
    //   google_address: yup
    //     .object()
    //     .required(dictionary?.form?.validation?.required)
    //     .label(dictionary?.form?.label?.address)
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    countryCode: ''
    // google_address: null
    // schoolName: null,
    // gender: null
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
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
      setValue('email', userData?.email ? userData?.email : '')
      setValue('phoneNo', userData?.phoneNo ? userData?.phoneNo : '')
      setValue('countryCode', userData?.countryCode || '')
      // setValue('google_address', { ...userData?.location, description: userData?.location?.address })
      // setValue('gender', userData?.gender ? userData?.gender : '')
      // setValue('schoolName', userData?.schoolName ? userData?.schoolName : '')
      // setSelectedGender(userData?.gender ? userData?.gender : '')
    }
  }, [userData])

  const onSubmit = async data => {
    const locationData = Object.fromEntries(
      Object.entries(data?.google_address ?? {}).filter(([key]) =>
        ['country', 'city', 'state', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    if (profileUploadedFile && !selectedAvatar) {
      // data.profileImage = profileUploadedFile
      data.file = profileUploadedFile
    }

    // data.gender = selectedGender
    // locationData.latitude = parseFloat(locationData.latitude)
    // locationData.longitude = parseFloat(locationData.longitude)

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined,
      avtar: selectedAvatar
    }

    setIsFormSubmitLoading(true)
    axiosApiCall
      .patch(API_ROUTER.PARENT.PARENT_DASHBOARD, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const responseBody = response?.data

        setUserData(responseBody.response.userData)
        dispatch(setProfile(responseBody.response.userData))
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

  // const handleGenderChange = event => {
  //   setValue('gender', event?.target?.value)
  //   setSelectedGender(event?.target?.value)
  // }

  return (
    <Card className='common-block-dashboard'>
      <div className='common-block-title'>
        <CardHeader className='p-0' title={dictionary?.page?.common?.add_your_details} />
      </div>
      <CardContent className='p-0 common-form-dashboard'>
        <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <div className='form-group'>
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
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className='form-group'>
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
              </div>
            </Grid>
            {/* <Grid item xs={12}>
              <Controller
              name='schoolName'
              control={control}
              render={({ field }) => (
              <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.school_name}
                  placeholder={dictionary?.form?.placeholder?.school_name}
                  {...(errors.schoolName && { error: true, helperText: errors.schoolName.message })}
                />
              )}
            />
          </Grid> */}
            <Grid item xs={12} sm={6}>
              <div className='form-group'>
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
              </div>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Controller
                name='phoneNo'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.contact_no}
                    placeholder={dictionary?.form?.placeholder?.contact_no}
                    {...(errors.phoneNo && { error: true, helperText: errors.phoneNo.message })}
                  />
                )}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6} className='nh-phone-input-wrapper'>
              <div className='form-group'>
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
              </div>
            </Grid>
            {/* <Grid item xs={6}>
            <Controller
              name='gender'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  value={selectedGender}
                  label={dictionary?.form?.label?.gender}
                  error={Boolean(errors.gender)}
                  helperText={errors?.gender?.message || ''}
                  SelectProps={{
                    displayEmpty: true,
                    onChange: handleGenderChange
                  }}
                >
                  <MenuItem disabled value=''>
                    <Typography color='text.disabled'>{dictionary?.form?.placeholder?.gender}</Typography>
                  </MenuItem>
                  {genders?.map(item => (
                    <MenuItem value={item?.id} key={item?.id}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid> */}
            {/* <Grid item xs={12}>
              <div className='form-group'>
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
              </div>
            </Grid> */}

            <Grid item xs={12} className='flex justify-center gap-2'>
              <Button disabled={isFormSubmitLoading} variant='contained' className='theme-common-btn' type='submit'>
                {dictionary?.form?.button?.submit}
                {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
              </Button>
              <Button
                variant='customLight'
                type='reset'
                className='theme-common-btn-second'
                disabled={isFormSubmitLoading}
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
