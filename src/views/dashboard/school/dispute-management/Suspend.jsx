'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports

import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

// MUI Imports
import { Button, Card, CardHeader, CircularProgress, Grid, TextareaAutosize, Typography } from '@mui/material'

import { format } from 'date-fns'

import CustomTextField from '@/@core/components/mui/TextField'

import axiosApiCall from '@/utils/axiosApiCall'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import primaryColorConfig from '@/configs/primaryColorConfig'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

// Page
const Suspend = ({ dictionary }) => {
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [vendorData, setVendorData] = useState([])

  const router = useRouter()

  const validationSchema = yup.object().shape({
    fromDate: yup
      .date()
      .nullable()
      .required(dictionary?.form?.validation?.start_date)
      .label(dictionary?.form?.placeholder?.select_start_date),
    toDate: yup
      .date()
      .nullable()
      .required(dictionary?.form?.validation?.end_date)
      .test('is-greater', dictionary?.form?.validation?.end_date_greater_than_start_date, function (value) {
        const { fromDate } = this.parent

        return value > fromDate
      })
      .label(dictionary?.form?.placeholder?.select_end_date),
    description: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.description)
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      fromDate: null,
      toDate: null,
      description: ''
    }
  })

  const onSubmit = data => {
    setIsFormSubmitLoading(true)

    const apiFormData = {
      reason: data?.description,
      suspendStartDate: format(data?.fromDate, 'yyyy-MM-dd'),
      suspendEndDate: format(data?.toDate, 'yyyy-MM-dd')
    }

    const apiUrl = `${API_ROUTER?.ADMIN?.SUSPEND_VENDOR}/${vendorData?._id}`

    axiosApiCall
      .patch(apiUrl, apiFormData)
      .then(response => {
        const responseBody = response?.data

        localStorage.removeItem('disputeParam')

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
        router.back()
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

  useEffect(() => {
    const param = localStorage.getItem('disputeParam')

    setVendorData(JSON.parse(param))
  }, [])

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader
        title={`${dictionary?.datatable?.button?.suspend} ${vendorData?.first_name} ${vendorData?.last_name}`}
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
                localStorage.removeItem('disputeParam')
                router.back()
              }}
              sx={{ m: 1 }}
            >
              {dictionary?.form?.button?.cancel}
            </Button>
          </>
        }
      />
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 5 }}>
          {/* From Date */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
              {dictionary?.form?.label?.select_duration}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name='fromDate'
              control={control}
              render={({ field }) => (
                <AppReactDatepicker
                  selected={fromDate}
                  onChange={date => {
                    field.onChange(date)
                    setFromDate(date)
                  }}
                  maxDate={toDate}
                  minDate={new Date()}
                  placeholderText={dictionary?.form?.placeholder?.select_start_date}
                  customInput={
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.from_date}
                      placeholder={dictionary?.form?.placeholder?.select_start_date}
                      error={!!errors.fromDate}
                      helperText={errors.fromDate?.message}
                    />
                  }
                />
              )}
            />
          </Grid>

          {/* To Date */}
          <Grid item xs={12} sm={6}>
            <Controller
              name='toDate'
              control={control}
              render={({ field }) => (
                <AppReactDatepicker
                  selected={toDate}
                  onChange={date => {
                    field.onChange(date)
                    setToDate(date)
                  }}
                  minDate={fromDate}
                  placeholderText={dictionary?.form?.placeholder?.select_end_date}
                  customInput={
                    <CustomTextField
                      {...field}
                      fullWidth
                      placeholder={dictionary?.form?.placeholder?.select_end_date}
                      error={!!errors.toDate}
                      helperText={errors.toDate?.message}
                    />
                  }
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
              {dictionary?.form?.label?.description}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextareaAutosize
              aria-label='minimum height'
              minRows={3}
              placeholder={dictionary?.dialog?.type_here}
              style={{
                width: '100%',
                border: errors.description ? '1px solid red' : '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                outline: 'none',
                color: 'var(--mui-palette-text-primary)',
                fontFamily: 'inherit',
                fontSize: 'inherit'
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

export default Suspend
