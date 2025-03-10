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

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormHelperText,
  Grid,
  MenuItem,
  Typography
} from '@mui/material'

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

/**
 * Page
 */
const Form = ({ dictionary, kidData, setKidData, profileUploadedFile }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const pageFormRef = useRef(null)

  // Vars
  const panelName = getPanelName(pathname)

  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedWeightUnit, setSelectedWeightUnit] = useState('')
  const [selectedHeightUnit, setSelectedHeightUnit] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedActivityLevel, setSelectedActivityLevel] = useState('')
  const genders = dictionary?.form?.dropdown.genders
  const height_units = dictionary?.form?.dropdown.height_units
  const weight_units = dictionary?.form?.dropdown.weight_units

  /**
   * Form Validation Schema
   */

  const formValidationSchema = yup.object({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    // class: yup
    //   .string()
    //   .matches(
    //     /^(Nursery|KG1|KG2|[1-9]|1[0-2])$/,
    //     dictionary?.form?.validation?.invalid_class ||
    //       "Class must be 'Nursery', 'KG1', 'KG2', or a number between 1 and 12."
    //   )
    //   .required(dictionary?.form?.validation?.required)
    //   .label(dictionary?.form?.label?.class),
    // grade: yup
    //   .string()
    //   .length(2, dictionary?.form?.validation?.invalid_length || 'Grade must be exactly 2 character.')
    //   .required(dictionary?.form?.validation?.required)
    //   .label(dictionary?.form?.label?.grade),
    age: yup
      .number()
      .typeError(dictionary?.form?.validation?.invalid_number)
      .min(3, dictionary?.form?.validation?.min_age)
      .max(18, dictionary?.form?.validation?.max_age)
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.age),
    gender: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.gender),
    // weight_unit: yup
    //   .string()
    //   .required(dictionary?.form?.validation?.required)
    //   .label(dictionary?.form?.label?.weight_units),
    height_in: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.height_units),
    weight: yup
      .number()
      .typeError(dictionary?.form?.validation?.invalid_weight)
      .min(10, dictionary?.form?.validation?.min_weight)
      .max(150, dictionary?.form?.validation?.max_weight)
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.weight)
      .test(
        'decimal-places',
        dictionary?.form?.validation?.invalid_decimal,
        value => /^\d+(\.\d{1,2})?$/.test(value?.toString()) // Allows up to 2 decimal places
      ),
    height: yup
      .number()
      .typeError(dictionary?.form?.validation?.invalid_height)
      .min(50, dictionary?.form?.validation?.min_height)
      .max(250, dictionary?.form?.validation?.max_height)
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.height)
      .test(
        'decimal-places',
        dictionary?.form?.validation?.invalid_decimal,
        value => /^\d+(\.\d{1,2})?$/.test(value?.toString()) // Allows up to 2 decimal places
      ),
    // allergiesOrDietaryDescription: yup
    //   .string()
    //   .required(dictionary?.form?.validation?.required)
    //   .label(dictionary?.form?.label?.allergies_dietary_description),
    google_address: yup
      .object()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.address),
    schoolId: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.school_name)
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    // class: '',
    // grade: '',
    age: '',
    gender: null,
    weight: '',
    height: '',
    weight_unit: null,
    height_in: null,
    allergiesOrDietaryDescription: '',
    google_address: null,
    schoolId: '',
    activityLevel: ''
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
    if (kidData?._id) {
      setValue('first_name', kidData?.first_name ? kidData?.first_name : '')
      setValue('last_name', kidData?.last_name ? kidData?.last_name : '')
      // setValue('class', kidData?.class ? kidData?.class : '')
      // setValue('grade', kidData?.grade ? kidData?.grade : '')
      setValue('age', kidData?.age ? kidData?.age : '')
      setValue('gender', kidData?.gender ? kidData?.gender : '')
      setValue('weight', kidData?.weight ? kidData?.weight : '')
      setValue('height', kidData?.height ? kidData?.height : '')
      setValue(
        'allergiesOrDietaryDescription',
        kidData?.allergiesOrDietaryDescription ? kidData?.allergiesOrDietaryDescription : ''
      )
      setValue('google_address', { ...kidData?.location, description: kidData?.location?.address })
      setValue('schoolId', kidData?.schoolId ? kidData?.schoolId : '')
      setValue('activityLevel', kidData?.activityLevel ? kidData?.activityLevel : '')

      if (kidData?.location?.latitude && kidData?.location?.longitude) {
        fetchSchoolList(kidData?.location?.latitude, kidData?.location?.longitude)
      }

      setSelectedGender(kidData?.gender ? kidData?.gender : '')
      setSelectedSchool(kidData?.schoolId ? kidData?.schoolId : '')
      setSelectedActivityLevel(kidData?.activityLevel ? kidData?.activityLevel : '')
    }
  }, [kidData])

  const onSubmit = async data => {
    const locationData = Object.fromEntries(
      Object.entries(data?.google_address).filter(([key]) =>
        ['country', 'city', 'state', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    if (profileUploadedFile) {
      data.file = profileUploadedFile
    }

    data.gender = selectedGender
    // data.weight_in = selectedWeightUnit
    data.height_in = selectedHeightUnit
    data.schoolId = selectedSchool
    data.activityLevel = selectedActivityLevel
    data.age = parseInt(data.age)
    locationData.latitude = parseFloat(locationData.latitude)
    locationData.longitude = parseFloat(locationData.longitude)

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined
    }

    setIsFormSubmitLoading(true)

    let axiosApiCallUrl = API_ROUTER.PARENT.KID_DASHBOARD_CREATE

    if (kidData?._id) {
      axiosApiCallUrl = API_ROUTER.PARENT.KID_DASHBOARD_UPDATE(kidData?._id)
    }

    axiosApiCall({
      method: kidData?._id ? 'patch' : 'post',
      url: axiosApiCallUrl,
      data: apiFormData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        const responseBody = response?.data

        setKidData(responseBody.response.userData)
        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
        router.push(getLocalizedUrl(`/${panelName}/kid-profile-management`, locale))
      })
      .catch(error => {
        console.log('error', error)

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

  /**
   * Fetch school: Start
   */
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)
  const getSchoolListController = useRef()
  const [schools, setSchools] = useState([])

  const fetchSchoolList = (latitude, longitude) => {
    setIsGetSchoolListLoading(true)

    if (getSchoolListController.current) {
      getSchoolListController.current?.abort()
    }

    getSchoolListController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.GET_SCHOOLS, {
        signal: getSchoolListController?.current?.signal
      })
      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data

        const responseBodyData = responseBody?.response?.users

        const filteredSchool = responseBodyData?.filter(school => school.schoolName != undefined)

        setSchools(filteredSchool)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch school: End */

  const handleSchoolChange = event => {
    setValue('schoolId', event?.target?.value)
    setSelectedSchool(event?.target?.value)
  }

  const handleActivityLevelChange = event => {
    setValue('activityLevel', event?.target?.value)
    setSelectedActivityLevel(event?.target?.value)
  }

  const handleGenderChange = event => {
    setValue('gender', event?.target?.value)
    setSelectedGender(event?.target?.value)
  }

  const handleWeightUnitChange = event => {
    setValue('weight_unit', event?.target?.value)
    setSelectedWeightUnit(event?.target?.value)
  }

  const handleHeightUnitChange = event => {
    setValue('height_in', event?.target?.value)
    setSelectedHeightUnit(event?.target?.value)
  }

  const handleChangeAddress = locationObj => {
    if (locationObj?.latitude && locationObj?.longitude) {
      fetchSchoolList(locationObj?.latitude, locationObj?.longitude)
    }
  }

  return (
    <Card className='common-block-dashboard'>
      <div className='common-block-title'>
        <CardHeader className='p-0' title={dictionary?.page?.parent_kid_management?.add_kids_details} />
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
            {/* <Grid item xs={4}>
              <div className='form-group'>
                <Controller
                  name='class'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.class}
                      placeholder={dictionary?.form?.placeholder?.class}
                      {...(errors.class && { error: true, helperText: errors.class.message })}
                    />
                  )}
                />
              </div>
            </Grid> */}
            {/* <Grid item xs={4}>
              <div className='form-group'>
                <Controller
                  name='grade'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.grade}
                      placeholder={dictionary?.form?.placeholder?.grade}
                      {...(errors.grade && { error: true, helperText: errors.grade.message })}
                    />
                  )}
                />
              </div>
            </Grid> */}
            <Grid item xs={6}>
              <div className='form-group'>
                <Controller
                  name='age'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.age}
                      placeholder={dictionary?.form?.placeholder?.age}
                      {...(errors.age && { error: true, helperText: errors.age.message })}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='gender'
                  className='diff-select-block'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      className='diff-select-block'
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
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group'>
                <Controller
                  name='weight'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.weight}
                      placeholder={dictionary?.form?.placeholder?.weight}
                      {...(errors.weight && { error: true, helperText: errors.weight.message })}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='weight_unit'
                  className='diff-select-block'
                  control={control}
                  defaultValue='kg'
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      className='diff-select-block'
                      value={field.value || 'kg'}
                      label={dictionary?.form?.label?.weight_units}
                      error={Boolean(errors.weight_unit)}
                      helperText={errors?.weight_unit?.message || ''}
                      SelectProps={{
                        displayEmpty: true,
                        onChange: handleWeightUnitChange
                      }}
                    >
                      <MenuItem disabled value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.weight_units}</Typography>
                      </MenuItem>
                      {weight_units?.map(item => (
                        <MenuItem value={item?.id} key={item?.id}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group'>
                <Controller
                  name='height'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.height}
                      placeholder={dictionary?.form?.placeholder?.height}
                      {...(errors.height && { error: true, helperText: errors.height.message })}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='height_in'
                  className='diff-select-block'
                  control={control}
                  // defaultValue='Cm'
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      className='diff-select-block'
                      value={selectedHeightUnit}
                      label={dictionary?.form?.label?.height_units}
                      error={Boolean(errors.height_in)}
                      helperText={errors?.height_in?.message || ''}
                      SelectProps={{
                        displayEmpty: true,
                        onChange: handleHeightUnitChange
                      }}
                    >
                      <MenuItem disabled value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.height_units}</Typography>
                      </MenuItem>
                      {height_units?.map(item => (
                        <MenuItem value={item?.id} key={item?.id}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className='form-group'>
                <Controller
                  name='allergiesOrDietaryDescription'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.allergies_dietary_description}
                      placeholder={dictionary?.form?.placeholder?.allergies_dietary_description}
                      // {...(errors.allergiesOrDietaryDescription && {
                      //   error: true,
                      //   helperText: errors?.allergiesOrDietaryDescription?.message
                      // })}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
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
                        handleChangeAddress(data?.details_for_api)
                      }}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label={dictionary?.form?.label?.address}
                          placeholder={dictionary?.form?.placeholder?.address}
                          className='autocompate-block-input-inner'
                          error={!!errors.google_address?.address}
                          helperText={errors.google_address?.address?.message}
                          {...(errors.google_address && { error: true, helperText: errors?.google_address?.message })}
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
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='schoolId'
                  className='diff-select-block'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      className='diff-select-block'
                      value={selectedSchool}
                      label={dictionary?.form?.label?.school_name}
                      error={Boolean(errors.schoolId)}
                      helperText={errors?.schoolId?.message || ''}
                      SelectProps={{
                        displayEmpty: true,
                        onChange: handleSchoolChange
                      }}
                      disabled={kidData?.verificationStatus === 'approved'}
                    >
                      <MenuItem disabled value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.school_name}</Typography>
                      </MenuItem>
                      {schools?.map(item => (
                        <MenuItem value={item?._id} key={item?._id}>
                          {item?.schoolName}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='activityLevel'
                  className='diff-select-block'
                  control={control}
                  defaultValue={kidData?.activityLevel || ''}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      className='diff-select-block'
                      value={selectedActivityLevel}
                      label={dictionary?.form?.label?.activity_level}
                      error={Boolean(errors.activityLevel)}
                      helperText={errors?.activityLevel?.message || ''}
                      SelectProps={{
                        displayEmpty: true,
                        onChange: handleActivityLevelChange
                      }}
                      // disabled={kidData?.verificationStatus === 'approved'}
                    >
                      <MenuItem value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.activity_level}</Typography>
                      </MenuItem>
                      <MenuItem value={1.2}>{dictionary?.form?.label?.sedentary} </MenuItem>
                      <MenuItem value={1.55}>{dictionary?.form?.label?.moderate} </MenuItem>
                      <MenuItem value={1.9}>{dictionary?.form?.label?.active1} </MenuItem>
                    </CustomTextField>
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12} className='flex justify-center gap-2'>
              <Button disabled={isFormSubmitLoading} variant='contained' className='theme-common-btn' type='submit'>
                {dictionary?.form?.button?.submit}
                {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
              </Button>
              <Button
                variant='customLight'
                disabled={isFormSubmitLoading}
                type='reset'
                className='theme-common-btn-second'
                onClick={() => {
                  router.push(getLocalizedUrl(`/${panelName}/kid-profile-management`, locale))
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

export default Form
