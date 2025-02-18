'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel
} from '@mui/material'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isCancel } from 'axios'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

// Util Imports
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'
import { PHONE_NUMBER_DEFAULT_COUNTRY_CODE } from '@/utils/constants'

// Component Imports
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'
import GoogleMaps from '../../../components/nourishubs/GoogleMaps'

/**
 * Page
 */
const VendorSignUp = ({ mode, dictionary, adc }) => {
  // Hooks

  const router = useRouter()
  const { lang: locale } = useParams()

  // Vars
  const signUpUrl = getLocalizedUrl('/signup', locale)

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    first_name: yup.string().required(dictionary?.form?.validation?.required),
    last_name: yup.string().required(dictionary?.form?.validation?.required),
    email: yup
      .string()
      .email(dictionary?.form?.validation?.email_address)
      .required(dictionary?.form?.validation?.required),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required),
    // .matches(
    //   /^\+([1-9]{1,4})\s?(\([0-9]{1,5}\))?[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,4}$/,
    //   dictionary?.form?.validation?.phone_number
    // ),
    companyName: yup.string().required(dictionary?.form?.validation?.required),
    google_address: yup.object().required(dictionary?.form?.validation?.required),
    password: yup.string().required(dictionary?.form?.validation?.required),
    confirm_password: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .oneOf([yup.ref('password'), null], dictionary?.form?.validation?.passwords_must_match),
    // address: yup.string().required(dictionary?.form?.validation?.required),
    privacy_policy_checkbox: yup.bool().oneOf([true], dictionary?.form?.validation?.agree_privacy_policy) // Ensure the checkbox is checked
  })

  const defaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    countryCode: '',
    companyName: '',
    google_address: null,
    password: '',
    confirm_password: '',
    // country: '',
    // city: '',
    // state: '',
    // district: '',
    // latitude: '',
    // longitude: '',
    // address: '',
    // schoolName: '',
    // schoolAddress: '',
    privacy_policy_checkbox: false
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: defaultValues
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(null)
  const [placeDetails, setPlaceDetails] = useState(null)
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')

  const onSubmit = async values => {
    setIsFormSubmitLoading(true)

    const apiFormData = new FormData(pageFormRef?.current)

    try {
      // apiFormData?.delete('confirm_password')
      apiFormData.delete('privacy_policy_checkbox')
    } catch (error) {}

    const formDataObject = Object.fromEntries(apiFormData.entries())

    const locationData = Object.fromEntries(
      Object.entries(values?.google_address || {}).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const payload = {
      type: 'vendor_role',
      data: {
        ...formDataObject,
        ...locationData,
        google_address: undefined,
        phoneNo: values?.phoneNo,
        countryCode: values?.countryCode
        // country: country,
        // city: city,
        // state: state,
        // district: district,
        // latitude: placeDetails.geometry.location.lat(),
        // longitude: placeDetails.geometry.location.lng(),
        // address: placeDetails.formatted_address
      }
    }

    axiosApiCall
      .post(API_ROUTER.AUTH.SIGN_UP, payload)
      .then(response => {
        setIsFormSubmitLoading(false)
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        const pathname = getLocalizedUrl(
          `/verify-login?email=${encodeURIComponent(responseBody?.response?.email)}`,
          locale
        )

        toastSuccess(responseBody?.message)
        reset(defaultValues)
        router.push(pathname)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            // setFormFieldsErrors(apiResponseErrorHandlingData, setError)

            const apiResponseErrorHandlingDataConverted = Object.fromEntries(
              Object.entries(apiResponseErrorHandlingData)?.map(([key, value]) => [
                key?.startsWith('data.') ? key?.replace('data.', '') : key,
                value
              ])
            )

            setFormFieldsErrors(apiResponseErrorHandlingDataConverted, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)
  /** Page form: End */

  return (
    <div className='two-common-signup'>
      <div className='left-side-common'>
        <div className='left-side-common-img'>
          <img src='/images/nourishubs/front/banner-sign-up-2.jpg' alt='banner'></img>
        </div>
        <div className='left-side-text'>
          <h1>{dictionary?.page?.signUpVendor?.join_string}</h1>
          <p>{dictionary?.page?.signUpVendor?.community_string}</p>
        </div>
      </div>
      <div className='right-side-common'>
        <div className='right-side-common-inner'>
          <div className='form-title'>
            <h2>{dictionary?.common?.get_started}</h2>
            <p>{dictionary?.page?.signUpVendor?.solution_string}</p>
          </div>
          <div className='common-bg-box'>
            <form noValidate autoComplete='off' action={() => {}} onSubmit={handleSubmit(onSubmit)} ref={pageFormRef}>
              <div className='two-block-form'>
                <div className='form-group'>
                  <Controller
                    name='first_name'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        autoFocus
                        fullWidth
                        label={dictionary?.form.label?.first_name}
                        placeholder={dictionary?.form?.placeholder?.first_name}
                        {...(errors?.first_name && { error: true, helperText: errors?.first_name?.message })}
                      />
                    )}
                  />
                </div>
                <div className='form-group'>
                  <Controller
                    name='last_name'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={dictionary?.form?.label.last_name}
                        placeholder={dictionary?.form?.placeholder?.last_name}
                        {...(errors?.last_name && { error: true, helperText: errors?.last_name?.message })}
                      />
                    )}
                  />
                </div>
              </div>
              <div className='two-block-form'>
                <div className='form-group'>
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='email'
                        label={dictionary?.form?.label.email}
                        placeholder={dictionary?.form?.placeholder?.email_address}
                        {...(errors?.email && { error: true, helperText: errors?.email?.message })}
                      />
                    )}
                  />
                </div>
                {/* <div className='form-group'>
                  <Controller
                    name='phoneNo'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={dictionary?.form?.label?.phone_number}
                        placeholder={dictionary?.form?.placeholder?.phone_number}
                        {...(errors?.phoneNo && { error: true, helperText: errors?.phoneNo?.message })}
                      />
                    )}
                  />
                </div> */}
                <div className='form-group'>
                  <InputLabel htmlFor='phoneNo' className='inline-flex text-textPrimary nh-phone-input-label'>
                    {dictionary?.form?.label?.phone_number}
                  </InputLabel>
                  <Controller
                    in='phoneNo'
                    name='phoneNo'
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        value={field?.value}
                        country={PHONE_NUMBER_DEFAULT_COUNTRY_CODE}
                        onChange={(value, countryData) => {
                          const dialCode = countryData?.dialCode || ''
                          const countryCode = countryData?.countryCode || ''
                          const formattedNumber = ('+' + value)?.replace(dialCode, dialCode + '-')

                          setValue('countryCode', countryCode)
                          field.onChange(formattedNumber)
                        }}
                        enableSearch
                        inputProps={{
                          autoComplete: 'off',
                          ref: field?.ref
                        }}
                        specialLabel=''
                        countryCodeEditable={false}
                        disableCountryCode={false}
                        disableCountryGuess={true}
                        containerClass='nh-phone-input-container'
                        inputClass='w-full nh-phone-input-element'
                      />
                    )}
                  />
                  {errors.phoneNo && <FormHelperText error>{errors?.phoneNo?.message}</FormHelperText>}
                  {errors.countryCode && <FormHelperText error>{errors?.countryCode?.message}</FormHelperText>}
                </div>
              </div>
              <div className='two-block-form'>
                <div className='form-group'>
                  <Controller
                    name='companyName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={dictionary?.form?.label?.company_name}
                        placeholder={dictionary?.form?.placeholder?.company_name}
                        {...(errors?.companyName && { error: true, helperText: errors?.companyName?.message })}
                      />
                    )}
                  />
                </div>

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
                            {...params}
                            {...(errors?.google_address && {
                              error: true,
                              helperText: errors?.google_address?.message
                            })}
                          />
                        )}
                        noOptionsText={dictionary?.common?.no_locations}
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
                </div>
              </div>

              {/* <GoogleMaps
                setPlaceDetails={setPlaceDetails}
                setCountry={setCountry}
                setState={setState}
                setCity={setCity}
                setDistrict={setDistrict}
                error={!!errors.address}
                helperText={errors.address?.message}
              /> */}

              <div className='two-block-form eye-password-two'>
                <div className='form-group '>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type={isPasswordShown ? 'text' : 'password'}
                        label={dictionary?.form?.label?.password}
                        placeholder={dictionary?.form?.placeholder?.password}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment className='eye-password-icon' position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                              >
                                <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        {...(errors?.password && { error: true, helperText: errors?.password?.message })}
                      />
                    )}
                  />
                </div>
                <div className='form-group'>
                  <Controller
                    name='confirm_password'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type={isConfirmPasswordShown ? 'text' : 'password'}
                        label={dictionary?.form?.label?.confirm_password}
                        placeholder={dictionary?.form?.placeholder?.confirm_password}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment className='eye-password-icon' position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowConfirmPassword}
                                onMouseDown={e => e.preventDefault()}
                              >
                                <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        {...(errors?.confirm_password && {
                          error: true,
                          helperText: errors?.confirm_password?.message
                        })}
                      />
                    )}
                  />
                </div>
              </div>

              <div className='last-check-btn-block'>
                <FormControl error={Boolean(errors.isAgreePrivacyAndTerms)}>
                  <Controller
                    name='privacy_policy_checkbox'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field?.value} />}
                        label={dictionary?.form.label?.agree_privacy_policy}
                      />
                    )}
                  />
                  {errors.privacy_policy_checkbox && (
                    <FormHelperText error>{errors?.privacy_policy_checkbox?.message}</FormHelperText>
                  )}
                </FormControl>
                {/* <Button className='fill-btn-common width-auto'>Sign Up</Button> */}
                <Button disabled={isFormSubmitLoading} className='fill-btn-common width-auto' type='submit'>
                  {dictionary?.common?.sign_up}
                  {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorSignUp
