'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter, useParams, usePathname } from 'next/navigation'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isCancel } from 'axios'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  Grid,
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
import { useTheme } from '@mui/material/styles'

// Component Imports
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'

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
const AddStaffFormComponent = ({ dictionary }) => {
  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const theme = useTheme()

  // Vars
  const id = 0
  const panelName = getPanelName(pathname)

  // States
  // const [userData, setUserData] = useState()

  /**
   * Page form: Start
   */
  const schema = yup.object({
    first_name: yup.string().required(dictionary?.form?.validation?.required),
    last_name: yup.string().required(dictionary?.form?.validation?.required),
    role: yup.string().required(dictionary?.form?.validation?.required),
    email: yup
      .string()
      .email(dictionary?.form?.validation?.email_address)
      .required(dictionary?.form?.validation?.required),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required),
    // google_address: yup.object().required(dictionary?.form?.validation?.required),
    // permissions: yup.array().of(
    //   yup.object().shape({
    //     permission: yup.string(),
    //     subPermissions: yup.array().of(yup.string())
    //   })
    // )
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    role: '',
    email: '',
    phoneNo: '',
    countryCode: '',
    google_address: null,
    permissions: []
  }

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formDefaultValues
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const watchPermissions = watch('permissions')

  const onSubmit = data => {
    const locationData = Object.fromEntries(
      Object.entries(data.google_address || {}).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined,
      permissions: data?.permissions?.filter(item => item?.permission && Object.keys(item).length > 0)
    }

    // console.log('onSubmit: values: ', data)
    // console.log('apiFormData: ', apiFormData)

    setIsFormSubmitLoading(true)

    axiosApiCall({
      method: 'post',
      url: API_ROUTER.SCHOOL_ADMIN.STAFF_MANAGEMENT(),
      data: apiFormData
    })
      .then(response => {
        toastSuccess(response?.data?.message)
        reset(formDefaultValues)
        router.push(getLocalizedUrl(`/${panelName}/staff-management`, locale))
      })
      .catch(error => {
        setIsFormSubmitLoading(false)
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
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

  // const handleRoleChange = event => {
  //   setValue('role', event?.target?.value)
  // }

  useEffect(() => {
    setValue('permissions', [])
    fetchRolePermissionList(role)
  }, [role])
  /** Role change handler: End */

  /**
   * Set user data: Start
   */
  // const isFormDataSet = useRef(false)

  // useEffect(() => {
  //   if (id && !isFormDataSet.current && userData && roles?.length > 0) {
  //     isFormDataSet.current = true

  //     reset({
  //       first_name: userData?.first_name || '',
  //       last_name: userData?.last_name || '',
  //       role: userData?.role?._id || '',
  //       email: userData?.email || '',
  //       phoneNo: userData?.phoneNo || '',
  //       // address: userData?.address || '',
  //       schoolName: userData?.schoolName || '',
  //       companyName: userData?.companyName || '',
  //       google_address: { ...userData?.location, description: userData?.location?.address },
  //       schoolId: userData?.schoolId ? userData?.schoolId : null
  //     })
  //   }
  // }, [userData, roles])
  /** Set user data: End */

  /**
   * Set user selected permission data: Start
   */
  // const isFormUserPermissionDataSet = useRef(false)

  // useEffect(() => {
  //   if (id && !isFormUserPermissionDataSet?.current && userData && roles?.length > 0 && permissions?.length > 0) {
  //     isFormUserPermissionDataSet.current = true

  //     permissions.forEach((permission, permissionIndex) => {
  //       userData.permissions.forEach((userPermission, userPermissionIndex) => {
  //         if (permission?._id === userPermission?.permission._id) {
  //           setValue(`permissions.${permissionIndex}.permission`, userPermission?.permission._id)
  //           setValue(
  //             `permissions.${permissionIndex}.subPermissions`,
  //             userPermission.subPermissions.map(subPermission => subPermission?._id) || []
  //           )
  //         }
  //       })
  //     })
  //   }
  // }, [userData, roles, permissions])
  /** Set user selected permission data: End */

  /**
   * Auto select all the permissions based on selected specific roles: Start
   */
  useEffect(() => {
    if (!id && role && ['teacher_role', 'school_otherers_role']?.includes(role) && permissions?.length > 0) {
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
   * Page Life Cycle: Start
   */
  useEffect(() => {
    fetchRoleList()
  }, [])
  /** Page Life Cycle: End */

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12} className='flex gap-4'>
            <div className='w-full flex justify-between'>
              <div>
                <CardHeader
                  className='p-0'
                  title={
                    <div>
                      {id
                        ? dictionary?.page?.staff_management?.edit_staff
                        : dictionary?.page?.staff_management?.add_staff}

                      {(isGetRoleListLoading || isGetRolePermissionListLoading) && (
                        <CircularProgress className='ml-1' size={20} sx={{ color: 'primary' }} />
                      )}
                    </div>
                  }
                />
              </div>

              <div>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={isFormSubmitLoading || isGetRoleListLoading || isGetRolePermissionListLoading}
                >
                  {id ? dictionary?.form?.button?.update : dictionary?.form?.button?.add}
                  {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  type='button'
                  onClick={() => {
                    // router.back()
                    router.push(`/${locale}/${panelName}/staff-management`)
                  }}
                  disabled={isFormSubmitLoading}
                  className='ml-2 '
                  sx={{ backgroundColor: `var(--nh-primary-light-color)` }}
                >
                  {dictionary?.form?.button?.cancel}
                </Button>
              </div>
            </div>
          </Grid>

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Controller
                name='first_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.first_name}
                    placeholder={dictionary?.form?.placeholder?.first_name}
                    error={!!errors?.first_name}
                    helperText={errors?.first_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='last_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.last_name}
                    placeholder={dictionary?.form?.placeholder?.last_name}
                    error={!!errors?.last_name}
                    helperText={errors?.last_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary?.form?.label?.role}
                    error={!!errors?.role}
                    helperText={errors?.role?.message}
                    onChange={event => field.onChange(event.target.value)}
                    SelectProps={{
                      displayEmpty: true
                      // onChange: handleRoleChange
                    }}
                    InputProps={{ readOnly: id ? true : false }}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.email_address}
                    placeholder={dictionary?.form?.placeholder?.email_address}
                    error={!!errors?.email}
                    helperText={errors?.email?.message}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <Controller
                name='phoneNo'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.phone_number}
                    placeholder={dictionary?.form?.placeholder?.phone_number}
                    error={!!errors?.phoneNo}
                    helperText={errors?.phoneNo?.message}
                  />
                )}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} className='nh-phone-input-wrapper'>
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
                      // disableCountryGuess={true}
                      containerClass='nh-phone-input-container'
                      inputClass='w-full nh-phone-input-element'
                      inputStyle={{
                        borderColor: errors?.phoneNo ? theme?.palette?.error?.main : undefined
                      }}
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
            <Grid item xs={12} md={6}>
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
                        {...params}
                        {...(errors?.google_address && { error: true, helperText: errors?.google_address?.message })}
                        label={dictionary?.form?.label?.address}
                        placeholder={dictionary?.form?.placeholder?.address}
                        error={!!errors?.google_address}
                        helperText={errors?.google_address?.message}
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
            </Grid>

            <Grid item xs={12} className={'hidden'}>
              <FormLabel>{dictionary?.form?.label?.permission}</FormLabel>
              {isGetRolePermissionListLoading && (
                <Grid container spacing={6}>
                  <Grid item xs={12} className='text-center'>
                    <CircularProgress size={20} sx={{ color: 'primary' }} />
                  </Grid>
                </Grid>
              )}

              {!isGetRolePermissionListLoading && !role && (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography color='text.disabled'>{dictionary?.form?.placeholder?.role}</Typography>
                  </Grid>
                </Grid>
              )}

              {!isGetRolePermissionListLoading && role && permissions?.length === 0 && (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography color='text.disabled'>
                      <i>N/A</i>
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={6}>
                {permissions.map((permission, index) => (
                  <Grid key={permission._id} item xs={12} md={4}>
                    <div key={permission._id} className='p-4 border rounded mb-4'>
                      <div>
                        <Controller
                          control={control}
                          name={`permissions.${index}.permission`}
                          render={({ field }) => (
                            <div>
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
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddStaffFormComponent
