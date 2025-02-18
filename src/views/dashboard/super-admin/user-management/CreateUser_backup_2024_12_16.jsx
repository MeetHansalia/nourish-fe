'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter, useSearchParams, useParams } from 'next/navigation'

// MUI Imports
import { Button, Card, CardContent, Grid, Box, MenuItem, Checkbox, FormControlLabel } from '@mui/material'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isCancel } from 'axios'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

/**
 * Page
 */

const CreateUser = ({ mode, dictionary, id }) => {
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  // states
  const [roleResponse, setRoleResponse] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [permission, setPermission] = useState([])
  const [selectPermission, setSelectPermission] = useState([])
  const [selectSubPermission, setSelectSubPermission] = useState([])
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(null)
  const [userData, setUserData] = useState([])

  /**
   * Form Validation Schema
   */

  const formValidationSchema = yup.object({
    // first_name: yup
    //   .string()
    //   .required(dictionary?.form?.validation?.required)
    //   .label(dictionary?.form?.label?.first_name),
    // last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    // role: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.role),
    // email: yup
    //   .string()
    //   .required()
    //   .email(dictionary?.form?.validation?.email_address)
    //   .label(dictionary?.form?.label?.email),
    // phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo),
    // address: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.address)
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      role: userData?.role?._id || '',
      email: userData?.email || '',
      phoneNo: userData?.phoneNo || '',
      address: userData?.address || ''
    }
  })

  useEffect(() => {
    axiosApiCall
      .get('/v1/role')
      .then(response => {
        setRoleResponse(response.data.response)
      })
      .catch(error => {
        console.error('Error fetching roles:', error)
      })
  }, [])

  const handleRoleChange = event => {
    setSelectedRole(event.target.value)
  }

  // useEffect(() => {
  //   if (userData) {
  //     setSelectedRole(userData?.role?._id)
  //   }
  // }, [])

  useEffect(() => {
    if (selectedRole) {
      axiosApiCall
        .get(`/v1/role/role-permissions/${selectedRole}`)
        .then(response => {
          setPermission(response?.data?.response)
        })
        .catch(error => {
          console.error('Error fetching roles:', error)
        })
    }
  }, [selectedRole])

  useEffect(() => {
    if (id) {
      axiosApiCall
        .get(`/v1/user-management/${id}`)
        .then(response => {
          const userData = response?.data?.response?.userData

          setUserData(userData)
          setSelectedRole(userData?.role?._id)
          // Use react-hook-form reset to set the form values
          reset({
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            role: userData?.role?._id || '',
            email: userData?.email || '',
            phoneNo: userData?.phoneNo || '',
            address: userData?.address || ''
          })
        })
        .catch(error => {
          console.error('Error fetching user:', error)
        })
    }

    return
  }, [])

  const onSubmit = data => {
    setIsFormSubmitLoading(true)

    const permissionsData = selectPermission.map(permission => ({
      permission: permission, // The permission ID
      subPermissions: selectSubPermission || [] // Sub-permissions for each permission
    }))

    const userData = {
      ...data,
      role: selectedRole,
      permissions: permissionsData
    }

    axiosApiCall
      .post('/v1/super-admin-user-management/create-user', userData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)

        // Optionally reset the form or show success message
        reset()
        const queryParams = Object?.fromEntries(searchParams?.entries())
        const queryString = new URLSearchParams({ ...queryParams }).toString()
        const pathname = getLocalizedUrl('/user-management', locale)
        const redirectURL = `${pathname}?${queryString}`

        router.push(redirectURL)
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

  const handleChange1 = (event, mainPermissionId) => {
    const isChecked = event.target.checked
    const newSelectPermission = [...selectPermission]
    const newSelectSubPermission = [...selectSubPermission]

    if (isChecked) {
      if (!newSelectPermission.includes(mainPermissionId)) {
        newSelectPermission.push(mainPermissionId)
      }

      const subPermissionIds = permission
        .find(permission => permission._id === mainPermissionId)
        ?.subPermissions.map(sub => sub._id)

      subPermissionIds.forEach(subId => {
        if (!newSelectSubPermission.includes(subId)) {
          newSelectSubPermission.push(subId)
        }
      })
    } else {
      const index = newSelectPermission.indexOf(mainPermissionId)

      if (index !== -1) {
        newSelectPermission.splice(index, 1)
      }

      const subPermissionIds = permission
        .find(permission => permission._id === mainPermissionId)
        ?.subPermissions.map(sub => sub._id)

      subPermissionIds.forEach(subId => {
        const subIndex = newSelectSubPermission.indexOf(subId)

        if (subIndex !== -1) {
          newSelectSubPermission.splice(subIndex, 1)
        }
      })
    }

    setSelectPermission(newSelectPermission)
    setSelectSubPermission(newSelectSubPermission)
  }

  const handleChange2 = (event, mainPermissionId, subPermissionId) => {
    const isChecked = event.target.checked
    const newSelectSubPermission = [...selectSubPermission]

    if (isChecked) {
      if (!newSelectSubPermission.includes(subPermissionId)) {
        newSelectSubPermission.push(subPermissionId)
      }
    } else {
      const index = newSelectSubPermission.indexOf(subPermissionId)

      if (index !== -1) {
        newSelectSubPermission.splice(index, 1)
      }
    }

    setSelectSubPermission(newSelectSubPermission)

    const allSubPermissions = permission
      .find(permission => permission._id === mainPermissionId)
      ?.subPermissions.map(sub => sub._id)

    if (allSubPermissions?.some(subId => !newSelectSubPermission.includes(subId))) {
      const newSelectPermission = selectPermission.filter(id => id !== mainPermissionId)

      setSelectPermission(newSelectPermission)
    } else if (newSelectSubPermission.length === allSubPermissions?.length) {
      if (!selectPermission.includes(mainPermissionId)) {
        setSelectPermission([...selectPermission, mainPermissionId])
      }
    }
  }

  const onUpdateSubmit = data => {
    setIsFormSubmitLoading(true)

    const permissionsData = selectPermission.map(permission => ({
      permission: permission, // The permission ID
      subPermissions: selectSubPermission || [] // Sub-permissions for each permission
    }))

    const userGetData = {
      ...data,
      role: selectedRole,
      permissions: permissionsData
    }

    axiosApiCall
      .patch(`/v1/user-management/${id}`, userGetData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)

        // Optionally reset the form or show success message
        reset()
        const queryParams = Object?.fromEntries(searchParams?.entries())
        const queryString = new URLSearchParams({ ...queryParams }).toString()
        const pathname = getLocalizedUrl('/user-management', locale)
        const redirectURL = `${pathname}?${queryString}`

        router.push(redirectURL)
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

  // const children = (
  //   <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
  //     {permission?.map((item, index) =>
  //       item?.subPermissions?.map((subitem, ind) => (
  //         <FormControlLabel
  //           key={`${index}-${ind}`}
  //           label={subitem?.name}
  //           control={
  //             <Checkbox
  //               checked={selectSubPermission.includes(subitem._id)}
  //               onChange={e => handleChange2(e, item._id, subitem._id)}
  //             />
  //           }
  //         />
  //       ))
  //     )}
  //   </Box>
  // )

  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' padding={3}>
      <Card>
        <CardHeader
          title={
            userData?._id
              ? dictionary?.page?.user_management?.update_user?.update_user
              : dictionary?.page?.user_management?.create_user?.create_user
          }
        />

        <CardContent>
          <form onSubmit={handleSubmit(id ? onUpdateSubmit : onSubmit)}>
            <Grid item xs={12} className='flex gap-4'>
              <Button variant='contained' type='submit'>
                {userData?._id ? dictionary?.form?.button?.update : dictionary?.form?.button?.create}
              </Button>
              <Button
                variant='tonal'
                color='secondary'
                type='reset'
                onClick={() => {
                  router.push('/user-management')
                }}
              >
                {dictionary?.form?.button?.cancel}
              </Button>
            </Grid>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Controller
                  name='first_name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      defaultValue={userData?.first_name ? userData?.first_name : ''}
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.first_name}
                      placeholder={dictionary?.form?.placeholder?.first_name}
                      {...(errors.first_name && { error: true, helperText: errors.first_name.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='last_name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      defaultValue={userData?.last_name ? userData?.last_name : ''}
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
                  name='role'
                  control={control}
                  rules={{
                    required: { value: true, message: 'Please Select Role' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      value={selectedRole}
                      select
                      fullWidth
                      label={dictionary?.form?.label?.role}
                      {...field}
                      error={Boolean(errors.role)}
                      onChange={e => {
                        field.onChange(e)
                        handleRoleChange(e)
                      }}
                      helperText={errors.role ? errors.role.message : ''}
                    >
                      {roleResponse.map(item => (
                        <MenuItem value={item?._id} key={item?._id}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      defaultValue={userData?.email ? userData?.email : ''}
                      {...field}
                      fullWidth
                      type='email'
                      label={dictionary?.form?.label?.email_address}
                      placeholder={dictionary?.form?.placeholder?.email_address}
                      {...(errors.email && { error: true, helperText: errors.email.message })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='phoneNo'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      defaultValue={userData?.phoneNo ? userData?.phoneNo : ''}
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.phone_number}
                      placeholder={dictionary?.form?.placeholder?.phone_number}
                      {...(errors.phoneNo && { error: true, helperText: errors.phoneNo.message })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      defaultValue={userData?.address ? userData?.address : ''}
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.address}
                      placeholder={dictionary?.form?.placeholder?.address}
                      {...(errors.address && { error: true, helperText: errors.address.message })}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <CardHeader title={dictionary?.form?.label?.permission} />
            {permission.map(mainPermission => (
              <div key={mainPermission._id}>
                <FormControlLabel
                  label={mainPermission.name}
                  control={
                    <Checkbox
                      checked={selectPermission.includes(mainPermission._id)}
                      onChange={e => handleChange1(e, mainPermission._id)}
                    />
                  }
                />
                {/* {children} */}
                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                  {mainPermission?.subPermissions?.map((item, index) => {
                    return (
                      <FormControlLabel
                        key={`${index}-${index}`}
                        label={item?.name}
                        control={
                          <Checkbox
                            checked={selectSubPermission.includes(item._id)}
                            onChange={e => handleChange2(e, item._id, item._id)}
                          />
                        }
                      />
                    )
                  })}
                </Box>
              </div>
            ))}
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CreateUser
