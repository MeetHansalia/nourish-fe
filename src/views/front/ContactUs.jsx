'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { Checkbox, FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Controller, useForm } from 'react-hook-form'
import { isCancel } from 'axios'

// Core Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

/**
 * Page
 */
const ContactUs = ({ mode, dictionary }) => {
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
    phoneNo: yup
      .string()
      // .required(dictionary?.form?.validation?.required)
      .nullable()
      .notRequired(),
    // .matches(
    //   /^\+([1-9]{1,4})\s?(\([0-9]{1,5}\))?[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,4}$/,
    //   dictionary?.form?.validation?.phone_number
    // ),
    // .test(
    //   'valid-phone-number',
    //   dictionary?.form?.validation?.phone_number,
    //   value => !value || /^\+([1-9]{1,4})\s?(\([0-9]{1,5}\))?[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,4}$/.test(value)
    // ),
    role: yup.string().required(dictionary?.form?.validation?.required),
    country: yup.object().required(dictionary?.form?.validation?.required),
    message: yup.string().required(dictionary?.form?.validation?.required),
    privacy_policy_checkbox: yup.bool().oneOf([true], dictionary?.form?.validation?.agree_privacy_policy) // Ensure the checkbox is checked
  })

  const defaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    role: '',
    country: null,
    message: '',
    privacy_policy_checkbox: false
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: defaultValues
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const onSubmit = async values => {
    // console.log('onSubmit: ', values)

    setIsFormSubmitLoading(true)
    const apiFormData = new FormData(pageFormRef?.current)

    try {
      apiFormData?.delete('privacy_policy_checkbox')
      apiFormData?.set('countryId', values?.country?._id)
    } catch (error) {}

    axiosApiCall
      .post(`/v1/contactus`, apiFormData)
      .then(response => {
        setIsFormSubmitLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
        reset(defaultValues)
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
  /** Page form: End */

  /**
   * Get Country List: Start
   */
  const [countryOptions, setCountryOptions] = useState([])
  const [isGetCountryListLoading, setIsGetCountryListLoading] = useState(true)
  const getCountryListController = useRef()

  const getCountryList = () => {
    setIsGetCountryListLoading(true)

    const apiFormData = {}

    if (getCountryListController.current) {
      getCountryListController.current?.abort()
    }

    getCountryListController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.GET_COUNTRIES, {
        signal: getCountryListController?.current?.signal
      })
      .then(response => {
        const responseBody = response.data
        const responseBodyData = responseBody.response

        setCountryOptions(responseBodyData?.countries || [])
        setIsGetCountryListLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetCountryListLoading(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Get Country List: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getCountryList()

    return () => {
      //
    }
  }, [])
  /** Page Life Cycle: End */

  return (
    <div className='two-common-signup'>
      <div className='left-side-common'>
        <div className='left-side-common-img'>
          <img src='/images/nourishubs/front/banner-sign-up-3.jpg' alt='banner'></img>
        </div>
        <div className='left-side-text' data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
          <h1>{dictionary?.page?.contactUs?.join_string}</h1>
          <p>{dictionary?.page?.contactUs?.sign_up_string}</p>
        </div>
      </div>
      <div className='right-side-common' data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
        <div className='right-side-common-inner'>
          <div className='form-title'>
            <h2>{dictionary?.navigation?.contact_us}</h2>
            <p>{dictionary?.page?.contactUs?.assist_string}</p>
          </div>
          <div className='common-bg-box'>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} ref={pageFormRef}>
              <div className='two-block-form'>
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
                        label={dictionary?.form?.label?.last_name}
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
                        label={dictionary?.form?.label?.email}
                        placeholder={dictionary?.form?.placeholder?.email_address}
                        {...(errors?.email && { error: true, helperText: errors?.email?.message })}
                      />
                    )}
                  />
                </div>
                <div className='form-group'>
                  <Controller
                    name='phoneNo'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={dictionary?.form?.label?.phone_number_optional}
                        placeholder={dictionary?.form?.placeholder?.phone_number}
                        {...(errors?.phoneNo && { error: true, helperText: errors?.phoneNo?.message })}
                      />
                    )}
                  />
                </div>
              </div>
              <div className='two-block-form two-block-form-diff'>
                <div className='form-group diff-error'>
                  <FormControl error={Boolean(errors?.role)}>
                    <FormLabel>{dictionary?.form?.label?.your_role}</FormLabel>
                    <Controller
                      name='role'
                      className='role-radio-block'
                      control={control}
                      render={({ field }) => (
                        <RadioGroup className='role-radio-block' row {...field} name='radio-buttons-group'>
                          <FormControlLabel
                            value='school'
                            control={<Radio name='role' />}
                            label={dictionary?.form?.label?.role_option_school}
                          />
                          <FormControlLabel
                            value='parent'
                            control={<Radio name='role' />}
                            label={dictionary?.form?.label?.role_option_parent}
                          />
                          <FormControlLabel
                            value='vendor'
                            control={<Radio name='role' />}
                            label={dictionary?.form?.label?.role_option_vendor}
                          />
                        </RadioGroup>
                      )}
                    />
                    {errors.role && <FormHelperText error>{errors?.role?.message}</FormHelperText>}
                  </FormControl>
                </div>
                <div className='form-group'>
                  <Controller
                    name='country'
                    control={control}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        // open
                        fullWidth
                        options={countryOptions}
                        id='autocomplete-custom'
                        className='autocompate-block-input'
                        getOptionLabel={option => option?.name + ` (${option?.code})` || ''}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        loading={isGetCountryListLoading}
                        renderInput={params => (
                          <CustomTextField
                            label={dictionary?.form?.label?.country}
                            placeholder={dictionary?.form?.placeholder?.country}
                            className='autocompate-block-input-inner'
                            {...params}
                            {...(errors?.country && { error: true, helperText: errors?.country?.message })}
                            {...(errors?.countryId && { error: true, helperText: errors?.countryId?.message })}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option?._id}>
                            <img
                              key={option?.code}
                              className='mie-4 flex-shrink-0'
                              alt=''
                              width='20'
                              loading='lazy'
                              src={`https://flagcdn.com/w20/${option?.code?.toLowerCase()}.png`}
                              srcSet={`https://flagcdn.com/w40/${option?.code?.toLowerCase()}.png 2x`}
                            />
                            {option?.name} ({option?.code})
                          </li>
                        )}
                        onChange={(_, data) => field.onChange(data)} // Update the field value on selection
                      />
                    )}
                  />
                  {/* {errors.country && <FormHelperText error>{errors?.country?.message}</FormHelperText>} */}
                </div>
              </div>
              <div className='form-group'>
                <Controller
                  name='message'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      className='text-area-block'
                      {...field}
                      fullWidth
                      rows={4}
                      multiline
                      label={dictionary?.form?.label.message}
                      placeholder={dictionary?.form?.placeholder?.message}
                      {...(errors?.message && { error: true, helperText: errors?.message?.message })}
                    />
                  )}
                />
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

                <Button
                  disabled={isFormSubmitLoading}
                  className='fill-btn-common width-auto'
                  variant='contained'
                  type='submit'
                >
                  {dictionary?.common?.submit}
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

export default ContactUs
