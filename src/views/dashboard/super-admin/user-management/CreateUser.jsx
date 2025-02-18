'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter, useParams, usePathname } from 'next/navigation'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  CircularProgress,
  Typography,
  InputLabel
} from '@mui/material'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isCancel } from 'axios'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'

// Component Imports
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  apiResponseErrorHandling,
  getPanelName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { PHONE_NUMBER_DEFAULT_COUNTRY_CODE } from '@/utils/constants'

/**
 * Page
 */
const CreateUser = props => {
  // Props
  const { mode, dictionary, id } = props

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()
  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  // States
  const [userData, setUserData] = useState()

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    role: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.role),
    email: yup
      .string()
      .required()
      .email(dictionary?.form?.validation?.email_address)
      .label(dictionary?.form?.label?.email),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo),
    // address: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.address),
    // schoolName: yup.string().required(dictionary?.form?.validation?.required),
    schoolName: yup.string().when('role', {
      is: 'school_role',
      then: () => yup.string().required(dictionary?.form?.validation?.required)
    }),
    companyName: yup.string().when('role', {
      is: 'vendor_role',
      then: () => yup.string().required(dictionary?.form?.validation?.required)
    }),
    schoolId: yup
      .object()
      .nullable()
      .when('role', {
        is: role => ['teacher_role', 'school_otherers_role'].includes(role),
        then: () => yup.object().required(dictionary?.form?.validation?.required)
      }),
    google_address: yup.object().required(dictionary?.form?.validation?.required),
    // permissions: yup.array().of(
    //   yup.object().shape({
    //     permission: yup.string().required(),
    //     subPermissions: yup.array().of(yup.string()).required()
    //   })
    // )
    // permissions: yup.array().of(
    //   yup.object().shape({
    //     permission: yup.string(),
    //     subPermissions: yup.array().of(yup.string())
    //     // .required()
    //     // .min(1, 'At least one SubPermission is required when a Permission is selected')
    //   })
    // )
    permissions: yup.array().of(
      yup.object().shape({
        permission: yup.string(),
        subPermissions: yup.array().of(yup.string())
      })
    )
  })

  // const formDefaultValues = {
  //   first_name: 'M',
  //   last_name: 'K',
  //   role: '',
  //   email: 'mk+1@gmail.com',
  //   phoneNo: '+919904250770',
  //   address: 'rajkot',
  //   permissions: []
  //   // permissions: [
  //   //   { permission: '1', subPermissions: [] },
  //   //   { permission: '2', subPermissions: [] }
  //   // ]
  // }

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    role: '',
    email: '',
    phoneNo: '',
    countryCode: '',
    // address: '',
    schoolName: '',
    companyName: '',
    google_address: null,
    permissions: [],
    schoolId: null
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: formDefaultValues
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const watchPermissions = watch('permissions')

  const onSubmit = values => {
    const locationData = Object.fromEntries(
      Object.entries(values?.google_address).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const apiFormData = {
      ...values,
      permissions: values?.permissions?.filter(item => item?.permission && Object.keys(item).length > 0),
      ...locationData,
      google_address: undefined,
      schoolId: values?.schoolId?._id
    }

    // console.log('onSubmit: values: ', values)
    // console.log('apiFormData: ', apiFormData)

    // return

    setIsFormSubmitLoading(true)
    let axiosApiCallUrl = API_ROUTER.SUPER_ADMIN_USER.CREATE_USER

    if (id) {
      axiosApiCallUrl = API_ROUTER.SUPER_ADMIN_USER.SPECIFIC_USER_WITH_ID(id)
    }

    axiosApiCall({
      method: id ? 'patch' : 'post',
      url: axiosApiCallUrl,
      data: apiFormData
    })
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
        // reset(formDefaultValues)
        router.push(getLocalizedUrl(`/${panelName}/user-management`, locale))
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
   * Fetch role: Start
   */
  const [isGetRoleListLoading, setIsGetRoleListLoading] = useState(false)
  const getRoleListController = useRef()
  const [roles, setRoles] = useState([])

  const fetchRoleList = () => {
    setIsGetRoleListLoading(true)

    if (getRoleListController.current) {
      getRoleListController.current?.abort()
    }

    getRoleListController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.ROLE.GET_ROLE, {
        signal: getRoleListController?.current?.signal
      })
      .then(response => {
        setIsGetRoleListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setRoles(responseBodyData?.roles)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetRoleListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch role: End */

  /**
   * Fetch role permissions: Start
   */
  const [isGetRolePermissionListLoading, setIsGetRolePermissionListLoading] = useState(false)
  const getRolePermissionListController = useRef()
  const [permissions, setPermissions] = useState([])

  const fetchRolePermissionList = (id = null) => {
    if (!id) {
      return
    }

    setIsGetRolePermissionListLoading(true)

    if (getRolePermissionListController.current) {
      getRolePermissionListController.current?.abort()
    }

    getRolePermissionListController.current = new AbortController()

    setPermissions([])
    axiosApiCall
      .get(API_ROUTER.ROLE.GET_ROLE_PERMISSION(id), {
        signal: getRolePermissionListController?.current?.signal
      })
      .then(response => {
        setIsGetRolePermissionListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setPermissions(responseBodyData?.permissions)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetRolePermissionListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch role permissions: End */

  /**
   * Role change handler: Start
   */
  const role = watch('role')

  const handleRoleChange = event => {
    setValue('role', event?.target?.value)
  }

  useEffect(() => {
    setValue('permissions', [])
    fetchRolePermissionList(role)

    if (['teacher_role', 'school_otherers_role']?.includes(role) && schools?.length === 0) {
      fetchSchoolList()
    }
  }, [role])
  /** Role change handler: End */

  /**
   * Fetch user data: Start
   */
  const [isFetchUserDataLoading, setIsFetchUserDataLoading] = useState(false)
  const fetchUserDataController = useRef()

  const fetchUserData = (id = null) => {
    if (!id) {
      return
    }

    setIsFetchUserDataLoading(true)

    if (fetchUserDataController.current) {
      fetchUserDataController.current?.abort()
    }

    fetchUserDataController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_USER.SPECIFIC_USER_WITH_ID(id), {
        signal: fetchUserDataController?.current?.signal
      })
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        const userDataObj = responseBodyData?.userData

        setUserData(userDataObj)
        // console.log('userDataObj: ', userDataObj)
        setIsFetchUserDataLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFetchUserDataLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch user data: End */

  /**
   * Set user data: Start
   */
  const isFormDataSet = useRef(false)

  useEffect(() => {
    if (id && !isFormDataSet.current && userData && roles?.length > 0) {
      isFormDataSet.current = true

      reset({
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        role: userData?.role?._id || '',
        email: userData?.email || '',
        phoneNo: userData?.phoneNo || '',
        countryCode: userData?.countryCode || PHONE_NUMBER_DEFAULT_COUNTRY_CODE,
        // address: userData?.address || '',
        schoolName: userData?.schoolName || '',
        companyName: userData?.companyName || '',
        google_address: { ...userData?.location, description: userData?.location?.address },
        schoolId: userData?.schoolId ? userData?.schoolId : null
      })
    }
  }, [userData, roles])
  /** Set user data: End */

  /**
   * Set user selected permission data: Start
   */
  const isFormUserPermissionDataSet = useRef(false)

  useEffect(() => {
    if (id && !isFormUserPermissionDataSet?.current && userData && roles?.length > 0 && permissions?.length > 0) {
      isFormUserPermissionDataSet.current = true

      permissions.forEach((permission, permissionIndex) => {
        userData.permissions.forEach((userPermission, userPermissionIndex) => {
          if (permission?._id === userPermission?.permission._id) {
            setValue(`permissions.${permissionIndex}.permission`, userPermission?.permission._id)
            setValue(
              `permissions.${permissionIndex}.subPermissions`,
              userPermission.subPermissions.map(subPermission => subPermission?._id) || []
            )
          }
        })
      })
    }
  }, [userData, roles, permissions])
  /** Set user selected permission data: End */

  /**
   * Auto select all the permissions based on selected specific roles: Start
   */
  useEffect(() => {
    if (
      !id &&
      role &&
      ['school_role', 'vendor_role', 'parent_role', 'teacher_role', 'school_otherers_role']?.includes(role) &&
      permissions?.length > 0
    ) {
      permissions.forEach((permission, permissionIndex) => {
        setValue(`permissions.${permissionIndex}.permission`, permission?._id)
        setValue(
          `permissions.${permissionIndex}.subPermissions`,
          permission?.subPermissions?.map(subPermission => subPermission?._id) || []
        )
      })
    }
  }, [role, permissions])
  /** Auto select all the permissions based on selected specific roles: End */

  /**
   * Fetch Schools: Start
   */
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)
  const getSchoolListController = useRef()
  const [schools, setSchools] = useState([])

  const fetchSchoolList = () => {
    setIsGetSchoolListLoading(true)

    if (getSchoolListController.current) {
      getSchoolListController.current?.abort()
    }

    getSchoolListController.current = new AbortController()

    setSchools([])
    axiosApiCall
      .get(API_ROUTER.GET_SCHOOLS, {
        signal: getSchoolListController?.current?.signal
      })
      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setSchools(responseBodyData?.users)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch Schools: End */

  /**
   * Google address auto complete: Start
   */
  // const google_address = watch('google_address')

  // useEffect(() => {
  //   console.log('google_address: ', google_address)
  // }, [google_address])
  /** Google address auto complete: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    fetchRoleList()
    fetchUserData(id)

    return () => {
      try {
        if (getRoleListController?.current) {
          getRoleListController?.current?.abort()
        }
      } catch (error) {}

      try {
        if (getRolePermissionListController?.current) {
          getRolePermissionListController?.current?.abort()
        }
      } catch (error) {}

      try {
        if (fetchUserDataController?.current) {
          fetchUserDataController?.current?.abort()
        }
      } catch (error) {}

      try {
        if (getSchoolListController?.current) {
          getSchoolListController?.current?.abort()
        }
      } catch (error) {}
    }
  }, [])
  /** Page Life Cycle: End */

  return (
    <Card className='common-block-dashboard'>
      <CardContent className='p-0'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12} className=''>
            <div className='common-block-title'>
              <div>
                <CardHeader
                  className='p-0'
                  title={
                    <h4>
                      {id
                        ? dictionary?.page?.user_management?.update_user?.update_user
                        : dictionary?.page?.user_management?.create_user?.create_user}

                      {(isFetchUserDataLoading || isGetRoleListLoading || isGetSchoolListLoading) && (
                        <CircularProgress className='ml-1' size={20} sx={{ color: 'primary' }} />
                      )}
                    </h4>
                  }
                />
              </div>

              <div className='button-group-block'>
                <div className='button-group-block-inner'>
                  <Button
                    variant='contained'
                    type='submit'
                    className='theme-common-btn'
                    disabled={
                      isFetchUserDataLoading ||
                      isFormSubmitLoading ||
                      isGetRoleListLoading ||
                      isGetRolePermissionListLoading ||
                      isGetSchoolListLoading
                    }
                  >
                    {id ? dictionary?.form?.button?.update : dictionary?.form?.button?.create}
                    {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
                  </Button>
                </div>
                <div className='button-group-block-inner'>
                  <Button
                    variant='contained'
                    color='secondary'
                    type='reset'
                    className='theme-common-btn-second'
                    onClick={() => {
                      router.push(`/${locale}/${panelName}/user-management`)
                    }}
                    disabled={isFormSubmitLoading}
                    sx={{ backgroundColor: `var(--nh-primary-light-color)` }}
                  >
                    {dictionary?.form?.button?.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Grid>

          <Grid container spacing={6} className='common-form-dashboard'>
            <Grid item xs={12} sm={6}>
              <div className='form-group'>
                <Controller
                  name='first_name'
                  className='form-group'
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
            <Grid item xs={12}>
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
                      InputProps={{ readOnly: id ? true : false }}
                      disabled={id ? true : false}
                    >
                      <MenuItem disabled value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.role}</Typography>
                      </MenuItem>
                      {roles?.map(item => (
                        <MenuItem value={item?._id} key={item?._id}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </div>
            </Grid>
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
                      disabled={id ? true : false}
                      {...(errors.email && { error: true, helperText: errors.email.message })}
                    />
                  )}
                />
              </div>
            </Grid>
            {/* <Grid item xs={12}>
              <div className='form-group'>
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
              </div>
            </Grid> */}

            <Grid item xs={12} sm={6} className='nh-phone-input-wrapper'>
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
                      // {...field}
                      value={field?.value}
                      country={userData?.countryCode || PHONE_NUMBER_DEFAULT_COUNTRY_CODE}
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
                      // disableCountryGuess={true}
                      containerClass='nh-phone-input-container'
                      inputClass='w-full nh-phone-input-element'
                      // dropdownStyle={{
                      //   bottom: '100%' // Opens the dropdown upwards
                      // }}
                    />
                  )}
                />
                {errors.phoneNo && <FormHelperText error>{errors?.phoneNo?.message}</FormHelperText>}
                {errors.countryCode && <FormHelperText error>{errors?.countryCode?.message}</FormHelperText>}
              </div>
            </Grid>

            {/* <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.address}
                      placeholder={dictionary?.form?.placeholder?.address}
                      {...(errors.address && { error: true, helperText: errors.address.message })}
                    />
                  )}
                />
              </Grid> */}

            {role === 'school_role' && (
              <Grid item xs={12}>
                <div className='form-group'>
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
                </div>
              </Grid>
            )}

            {role === 'vendor_role' && (
              <Grid item xs={12}>
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
                        {...(errors.companyName && { error: true, helperText: errors.companyName.message })}
                      />
                    )}
                  />
                </div>
              </Grid>
            )}

            {['teacher_role', 'school_otherers_role']?.includes(role) && (
              <Grid item xs={12}>
                <div className='form-group'>
                  <Controller
                    name='schoolId'
                    control={control}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        fullWidth
                        options={schools}
                        getOptionLabel={option => option?.schoolName || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label={dictionary?.form?.label?.school_name}
                            placeholder={dictionary?.form?.placeholder?.school_name}
                            {...(errors.schoolId && { error: true, helperText: errors.schoolId.message })}
                          />
                        )}
                        onChange={(_, data) => {
                          field.onChange(data)
                        }}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        noOptionsText={dictionary?.form?.placeholder?.no_options}
                        renderOption={(props, option) => (
                          <li {...props} key={option._id}>
                            {option?.schoolName || ''}
                          </li>
                        )}
                        disabled={id ? true : false}
                      />
                    )}
                  />
                </div>
              </Grid>
            )}

            <Grid item xs={12}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='google_address'
                  control={control}
                  render={({ field }) => (
                    <GoogleAddressAutoComplete
                      {...field}
                      fullWidth
                      onChange={(_, data) => {
                        // console.log('_', _)
                        // console.log('GoogleAddressAutoComplete: data', data)

                        // field.onChange(data)
                        field.onChange(data?.details_for_api)
                      }}
                      renderInput={params => (
                        <CustomTextField
                          label={
                            role === 'school_role'
                              ? dictionary?.form?.label?.school_address
                              : dictionary?.form?.label?.address
                          }
                          placeholder={
                            role === 'school_role'
                              ? dictionary?.form?.placeholder?.school_address
                              : dictionary?.form?.placeholder?.address
                          }
                          {...params}
                          {...(errors?.google_address && { error: true, helperText: errors?.google_address?.message })}
                          // {...(errors?.address && { error: true, helperText: errors?.address?.message })}
                          // {...(errors?.country && { error: true, helperText: errors?.country?.message })}
                          // {...(errors?.state && { error: true, helperText: errors?.state?.message })}
                          // {...(errors?.city && { error: true, helperText: errors?.city?.message })}
                          // {...(errors?.district && { error: true, helperText: errors?.district?.message })}
                          // {...(errors?.latitude && { error: true, helperText: errors?.latitude?.message })}
                          // {...(errors?.longitude && { error: true, helperText: errors?.longitude?.message })}
                        />
                      )}
                      noOptionsText={dictionary?.common?.no_locations}
                    />
                  )}
                />
                {/* <GoogleAddressAutoComplete /> */}
                {/* {errors.google_address && <FormHelperText error>{errors?.google_address?.message}</FormHelperText>} */}
                {errors.address && <FormHelperText error>{errors?.address?.message}</FormHelperText>}
                {errors.country && <FormHelperText error>{errors?.country?.message}</FormHelperText>}
                {errors.state && <FormHelperText error>{errors?.state?.message}</FormHelperText>}
                {errors.city && <FormHelperText error>{errors?.city?.message}</FormHelperText>}
                {errors.district && <FormHelperText error>{errors?.district?.message}</FormHelperText>}
                {errors.latitude && <FormHelperText error>{errors?.latitude?.message}</FormHelperText>}
                {errors.longitude && <FormHelperText error>{errors?.longitude?.message}</FormHelperText>}
              </div>
            </Grid>

            <Grid
              item
              xs={12}
              className={
                ['school_role', 'vendor_role', 'parent_role', 'teacher_role', 'school_otherers_role']?.includes(role)
                  ? 'hidden'
                  : ''
              }
            >
              <div className='form-group'>
                <FormLabel>{dictionary?.form?.label?.permission}</FormLabel>
                {isGetRolePermissionListLoading && (
                  <Grid container spacing={6}>
                    <Grid item xs={12} className='text-center mb-6'>
                      <CircularProgress size={20} sx={{ color: 'primary' }} />
                    </Grid>
                  </Grid>
                )}
              </div>

              {!isGetRolePermissionListLoading && !role && (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography color='text.disabled' className='mb-6'>
                      {dictionary?.form?.placeholder?.role}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {!isGetRolePermissionListLoading && role && permissions?.length === 0 && (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography color='text.disabled' className='mb-6'>
                      <i>N/A</i>
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={6}>
                {permissions.map((permission, index) => (
                  <Grid key={permission._id} item xs={12} sm={6} md={6} lg={4} xl={4}>
                    <div key={permission._id} className='p-4 border rounded mb-4'>
                      <div>
                        <Controller
                          control={control}
                          name={`permissions.${index}.permission`}
                          render={({ field }) => (
                            <div>
                              {/* {JSON.stringify(field)}
                                {permission._id} */}

                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    value={permission?._id}
                                    onChange={e => {
                                      const isChecked = e?.target?.checked

                                      field?.onChange(isChecked ? permission?._id : '')

                                      if (!isChecked) {
                                        // Uncheck all sub-permissions when the main permission is unchecked
                                        setValue(`permissions.${index}.subPermissions`, [])
                                      }
                                    }}
                                    checked={field?.value === permission?._id}
                                  />
                                }
                                label={permission?.name}
                              />
                            </div>
                          )}
                        />
                      </div>

                      {/* Sub-permissions */}
                      <div className='ml-6'>
                        <Controller
                          control={control}
                          name={`permissions.${index}.subPermissions`}
                          render={({ field }) => (
                            <div>
                              {permission?.subPermissions?.map(subPermission => (
                                <FormControlLabel
                                  key={subPermission?._id}
                                  control={
                                    <Checkbox
                                      {...field}
                                      value={subPermission?._id}
                                      onChange={e => {
                                        const value = e?.target?.value

                                        if (e?.target?.checked) {
                                          field?.onChange([...(field?.value || []), value]) // Ensure field.value is always an array
                                        } else {
                                          field?.onChange((field?.value || [])?.filter(v => v !== value))
                                        }
                                      }}
                                      checked={(field?.value || [])?.includes(subPermission?._id)} // Safely check includes
                                      disabled={!watchPermissions?.[index]?.permission}
                                    />
                                  }
                                  label={subPermission?.name}
                                  className='w-full'
                                />
                              ))}
                            </div>
                          )}
                        />
                        {errors.permissions?.[index]?.subPermissions && (
                          <FormHelperText error>{errors?.permissions?.[index]?.subPermissions?.message}</FormHelperText>
                        )}
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* <Grid item xs={12}>
              {JSON.stringify(errors)}
            </Grid> */}
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateUser
