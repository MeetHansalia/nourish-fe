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
  MenuItem,
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
const EditDetails = ({ dictionary, userData, setUserData, selectedFile }) => {
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
    state: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.state),
    district: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.district),
    google_address: yup.object().required(dictionary?.form?.validation?.required)
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    countryCode: '',
    state: '',
    google_address: null,
    district: '',
    role: '',
    language: ''
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    mode: 'onSubmit',
    defaultValues: formDefaultValues
  })

  useEffect(() => {
    if (userData?._id) {
      setValue('first_name', userData?.first_name ? userData?.first_name : '')
      setValue('last_name', userData?.last_name ? userData?.last_name : '')
      setValue('state', userData?.location?.state ? userData?.location?.state : '')
      setValue('district', userData?.location?.district ? userData?.location?.district : '')
      setValue('email', userData?.email ? userData?.email : '')
      setValue('phoneNo', userData?.phoneNo ? userData?.phoneNo : '')
      setValue('countryCode', userData?.countryCode || '')
      setValue('language', locale || '')
      setValue('role', dictionary?.page?.common?.district || '')

      if (userData?.location) {
        setValue('google_address', { ...userData?.location, description: userData?.location?.address })
      }
    }

    // fetchRoleList()
  }, [userData])

  const [isGetRoleListLoading, setIsGetRoleListLoading] = useState(false)
  const getRoleListController = useRef()
  const [roles, setRoles] = useState([])

  // const fetchRoleList = () => {
  //   setIsGetRoleListLoading(true)

  //   if (getRoleListController.current) {
  //     getRoleListController.current?.abort()
  //   }

  //   getRoleListController.current = new AbortController()

  //   axiosApiCall
  //     .get(API_ROUTER.ROLE.GET_ROLE, {
  //       signal: getRoleListController?.current?.signal
  //     })
  //     .then(response => {
  //       setIsGetRoleListLoading(false)

  //       const responseBody = response?.data
  //       const responseBodyData = responseBody?.response

  //       setRoles(responseBodyData?.roles)
  //     })
  //     .catch(error => {
  //       if (!isCancel(error)) {
  //         setIsGetRoleListLoading(false)
  //         const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

  //         toastError(apiResponseErrorHandlingData)
  //       }
  //     })
  // }

  const onSubmit = async data => {
    const locationData = Object.fromEntries(
      Object.entries(data?.google_address || {}).filter(([key]) =>
        ['country', 'city', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined,
      file: selectedFile
    }

    delete apiFormData.language
    delete apiFormData.role

    setIsFormSubmitLoading(true)

    axiosApiCall
      .patch(API_ROUTER.UPDATE_PROFILE, apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' } // ✅ Correct headers
      })
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

  const handleRoleChange = event => {
    setValue('role', event?.target?.value)
  }

  return (
    <Card>
      <CardHeader title={dictionary?.page?.common?.edit_information} />
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
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
                    {...field}
                    country={phoneInputCountry.current}
                    onChange={(value, countryData) => {
                      const dialCode = countryData?.dialCode || ''
                      const countryCode = countryData?.countryCode || ''
                      const formattedNumber = ('+' + value)?.replace(dialCode, dialCode + '-')

                      setValue('countryCode', countryCode)
                      field.onChange(formattedNumber)
                    }}
                    enableSearch
                    inputProps={{ autoComplete: 'off' }}
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
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    disabled
                    label={dictionary?.form?.label?.role}
                    placeholder={dictionary?.form?.placeholder?.role}
                    {...(errors.role && { error: true, helperText: errors.role.message })}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <div className='form-group'>
                <Controller
                  name='role'
                  className='select-input-common'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      className='select-input-common'
                      label={dictionary?.form?.label?.role}
                      error={Boolean(errors.role)}
                      helperText={errors?.role?.message || ''}
                      SelectProps={{
                        displayEmpty: true,
                        onChange: handleRoleChange
                      }}
                      InputProps={{ readOnly: userData?._id ? true : false }}
                      disabled={userData?._id ? true : false}
                    >
                      <MenuItem value="super_admin" selected>
                        <Typography >Super Admin</Typography>
                      </MenuItem>
                       {roles?.map(item => (
                        <MenuItem value={item?._id} key={item?._id} selected={userData?.role === item?._id}>
                          Super Admin
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </div>
            </Grid> */}
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Controller
                name='language'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    disabled
                    label={dictionary?.form?.label?.language}
                    placeholder={dictionary?.form?.placeholder?.language}
                    {...(errors.language && { error: true, helperText: errors.language.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Controller
                name='state'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.state}
                    placeholder={dictionary?.form?.placeholder?.state}
                    {...(errors.state && { error: true, helperText: errors.state.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Controller
                name='district'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.district}
                    placeholder={dictionary?.form?.placeholder?.district}
                    {...(errors.district && { error: true, helperText: errors.district.message })}
                  />
                )}
              />
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
                        label={dictionary?.form?.label?.address}
                        placeholder={dictionary?.form?.placeholder?.address}
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
              {errors.city && <FormHelperText error>{errors?.city?.message}</FormHelperText>}
              {errors.latitude && <FormHelperText error>{errors?.latitude?.message}</FormHelperText>}
              {errors.longitude && <FormHelperText error>{errors?.longitude?.message}</FormHelperText>}
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
