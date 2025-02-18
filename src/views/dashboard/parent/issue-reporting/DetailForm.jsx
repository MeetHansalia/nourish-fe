'use client'

// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports

import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import * as yup from 'yup'

// MUI Imports

import { t } from 'i18next'

import { Button, Card, CardHeader, CircularProgress, Grid, MenuItem, TextareaAutosize, Typography } from '@mui/material'

// MUI Imports

// Component Imports
import { apiBaseUrl } from 'next-auth/client/_utils'

import { getServerSession } from 'next-auth'

import { set } from 'date-fns'

import CustomTextField from '@/@core/components/mui/TextField'

import { authOptions } from '@/libs/auth'

// Util Imports

import axiosApiCall from '@/utils/axiosApiCall'

import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import primaryColorConfig from '@/configs/primaryColorConfig'

import theme from '@/@core/theme'
import { API_ROUTER } from '@/utils/apiRoutes'
import { USER_PANELS } from '@/utils/constants'

//redux
/**
 * Page
 */

const DetailForm = ({ dictionary, kidData, staticIssues, refreshData, role }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const pageFormRef = useRef(null)

  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const [selectedDate, setSelectedDate] = useState('')

  console.log('role', role)
  const normalizeRole = role => (Array.isArray(role) ? role[0] : role || '')

  /**
   * Form Validation Schema
   */

  let formValidationSchema = yup.object({
    // childId: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.select_child),
    childId: yup
      .string()
      .nullable()
      .when('role', (role, schema) => {
        const normalizedRole = Array.isArray(role) ? role[0] : role

        return normalizedRole === 'parent_role'
          ? schema.required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.select_child)
          : schema.nullable()
      }),
    issue_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.select_issue),
    date: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.issue_date),
    description: yup
      .string()
      .required(dictionary?.form?.validation?.issueDescription)
      .label(dictionary?.form?.label?.delivery_issue)
  })

  const formDefaultValues = {
    childId: '',
    issue_name: null,
    date: '',
    description: '',
    role: role
    // issueId: '',
    // date: '',
    // issueDescription: ''
  }

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: formDefaultValues,
    context: { role }
  })

  const onSubmit = async data => {
    const dateObject = new Date(data?.date)

    // Ensure it is treated as UTC and convert to ISO format
    const utcDate = new Date(
      Date.UTC(
        dateObject.getFullYear(),
        dateObject.getMonth(),
        dateObject.getDate(),
        dateObject.getHours(),
        dateObject.getMinutes(),
        dateObject.getSeconds()
      )
    )

    const isoDate = utcDate.toISOString()

    // data.childId = selectedChild
    console.log('orderData', orderData)

    const selectedOrder = await orderData.find(item => {
      // Extract only the date part (YYYY-MM-DD) from the item date
      const itemDateOnly = new Date(item?.orderDate).toISOString().split('T')[0]

      // Extract only the date part from isoDate
      const isoDateOnly = new Date(isoDate).toISOString().split('T')[0]

      return itemDateOnly === isoDateOnly
    })

    console.log('selectedOrder', selectedOrder)

    const issueSlug = staticIssues.find((item, index) => item?.name === data?.issue_name)?.slug

    console.log('issueSlug', issueSlug)

    const apiFormData = {
      issue_topic: data?.issue_name,
      issue_topic_slug: issueSlug,
      issueDate: isoDate,
      issue_description: data?.description,
      vendorId: selectedOrder?.vendorId,
      orderId: selectedOrder?.orderId
    }

    if (role === 'parent_role') {
      apiFormData.kidId = data.childId
    }

    console.log('selectedChild: ', data, apiFormData)

    axiosApiCall
      .post(API_ROUTER?.PARENT?.ISSUE_CREATE, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
        refreshData()
        reset(formDefaultValues)
        setSelectedDate(formDefaultValues.date)
      })
      .catch(error => {
        console.log('error: ', error)

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

  useEffect(() => {
    if (role && role !== 'parent_role') {
      getStaffAvailableDates()
    }
  }, [role])

  /**
   * Fetch school: Start
   */
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)

  /** Fetch school: End */

  /** Fetch Available Dates */
  const [isGetAvailableDatesLoading, setIsGetAvailableDatesLoading] = useState(false)
  const getAvailableDatesController = useRef()
  const [availableDates, setAvailableDates] = useState([])
  const [orderData, setOrderData] = useState([])

  const getAvailableDates = kidId => {
    setIsGetAvailableDatesLoading(true)

    if (getAvailableDatesController.current) {
      getAvailableDatesController.current?.abort()
    }

    getAvailableDatesController.current = new AbortController()

    const url = `${API_ROUTER?.PARENT?.GET_AVAILABLE_DATES}/${kidId}`

    axiosApiCall
      .get(url, {
        signal: getAvailableDatesController?.current?.signal
      })
      .then(response => {
        setIsGetAvailableDatesLoading(false)

        const responseBody = response?.data

        console.log('responseBody: ', responseBody)

        const responseBodyData = responseBody?.response?.orderData

        setOrderData(responseBodyData)
        const dateArray = responseBodyData?.map(item => item?.orderDate)

        console.log('dateArray: ', dateArray)

        setAvailableDates(dateArray)
      })
      // .catch(error => {
      //   if (!isCancel(error)) {
      //     setIsGetAvailableDatesLoading(false)
      //     const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

      //     toastError(apiResponseErrorHandlingData)
      //   }
      // })
      .catch(error => {
        console.log('error', error)

        if (!isCancel(error)) {
          setIsGetAvailableDatesLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  const getStaffAvailableDates = () => {
    setIsGetAvailableDatesLoading(true)

    if (getAvailableDatesController.current) {
      getAvailableDatesController.current?.abort()
    }

    getAvailableDatesController.current = new AbortController()

    const url = `${API_ROUTER?.PARENT?.GET_STAFF_AVAILABLE_DATES}`

    axiosApiCall
      .get(url, {
        signal: getAvailableDatesController?.current?.signal
      })
      .then(response => {
        setIsGetAvailableDatesLoading(false)

        const responseBody = response?.data

        console.log('responseBody: ', responseBody)

        const responseBodyData = responseBody?.response?.orderData

        setOrderData(responseBodyData)
        const dateArray = responseBodyData?.map(item => item?.orderDate)

        console.log('dateArray: ', dateArray)

        setAvailableDates(dateArray)
      })
      .catch(error => {
        console.log('error', error)

        if (!isCancel(error)) {
          setIsGetAvailableDatesLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  /** Fetch Available Dates: End */

  const handleSchoolChange = event => {
    setValue('schoolId', event?.target?.value)
    setSelectedSchool(event?.target?.value)
  }

  const handleKidChange = event => {
    console.log('event: ', event?.target?.value)
    setSelectedDate('')
    setValue('date', '')
    getAvailableDates(event?.target?.value)
  }

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader
        title={dictionary?.page?.issue_reporting?.issue_report}
        action={
          <>
            <Button
              disabled={isFormSubmitLoading}
              variant='contained'
              sx={{ m: 1 }}
              type='submit'
              onClick={handleSubmit(onSubmit)}
            >
              {dictionary?.form?.button?.submit}
              {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
            </Button>

            <Button
              style={{
                backgroundColor: primaryColorConfig[0].light,
                borderColor: primaryColorConfig[0].light,
                color: 'white'
              }}
              variant='outlined'
              type='reset'
              onClick={() => {
                reset()
              }}
              sx={{ m: 1 }}
            >
              {dictionary?.form?.button?.cancel}
            </Button>
          </>
        }
      />
      <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 5 }}>
          {role === 'parent_role' && (
            <Grid item xs={12}>
              <Controller
                name='childId'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary?.form?.placeholder?.select_child}
                    {...(errors.childId && { error: true, helperText: errors.childId.message })}
                    SelectProps={{
                      displayEmpty: true
                    }}
                    onChange={event => {
                      field.onChange(event) // Update react-hook-form state
                      handleKidChange(event) // Trigger API call
                    }}
                  >
                    {kidData?.length > 0 ? (
                      <MenuItem disabled value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.select_child}</Typography>
                      </MenuItem>
                    ) : (
                      <MenuItem disabled value=''>
                        <Typography color='text.disabled'>{dictionary?.form?.placeholder?.no_child_found}</Typography>
                      </MenuItem>
                    )}
                    {kidData?.map(item => (
                      <MenuItem value={item?._id} key={item?._id}>
                        {`${item?.first_name} ${item?.last_name}`}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
          )}

          <Grid item xs={6}>
            <Controller
              name='issue_name'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  label={dictionary?.form?.label?.select_issue}
                  {...(errors.issue_name && { error: true, helperText: errors.issue_name.message })}
                  SelectProps={{
                    displayEmpty: true
                  }}
                >
                  <MenuItem disabled value=''>
                    <Typography color='text.disabled'>{dictionary?.form?.placeholder?.select_issue}</Typography>
                  </MenuItem>
                  {staticIssues?.map(item => (
                    <MenuItem value={item?.name} key={item?.name}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='date'
              control={control}
              render={({ field }) => (
                <AppReactDatepicker
                  disabled={availableDates?.length === 0}
                  selected={selectedDate}
                  onChange={date => {
                    field.onChange(date)

                    setSelectedDate(date)
                  }}
                  includeDates={availableDates}
                  customInput={
                    <CustomTextField
                      disabled={isGetAvailableDatesLoading || availableDates?.length === 0}
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.issue_date}
                      placeholder={dictionary?.form?.placeholder?.issue_date}
                      {...(errors.date && { error: true, helperText: errors.date.message })}
                    />
                  }
                  placeholderText={t('form.label.start_date')}
                />
                // </CustomTextField>
              )}
            />
          </Grid>
          <Grid item marginTop={2} xs={12}>
            <TextareaAutosize
              aria-label='minimum height'
              minRows={3}
              placeholder={dictionary?.form?.placeholder?.delivery_issue}
              style={{
                width: '100%',
                border: errors.description ? '1px solid red' : '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                outline: 'none',
                color: 'var(--mui-palette-text-primary)',
                fontFamily: 'inherit'
              }}
              {...register('description')}
            />
            {errors.description && (
              <Typography color='error' variant='caption'>
                {errors.description.message}
              </Typography>
            )}
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default DetailForm
