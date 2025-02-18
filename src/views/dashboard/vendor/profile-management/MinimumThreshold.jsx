'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, CircularProgress, Grid } from '@mui/material'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'
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
const MinimumThreshold = ({ dictionary, userData }) => {
  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    minThresHold: yup
      .number(dictionary?.form?.validation?.numeric)
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.minimum_order)
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {}
  })

  const onSubmit = async data => {
    setIsFormSubmitLoading(true)

    axiosApiCall
      .post(API_ROUTER.VENDOR.VENDOR_MIN_THRESHOLD, data)
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
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

  return (
    <Card>
      <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
        <CardHeader
          title={dictionary?.page?.profile_management?.add_minimum_threshold}
          action={
            <Button disabled={isFormSubmitLoading} variant='contained' sx={{ m: 1 }} type='submit'>
              {dictionary?.form?.button?.generate_request}
              {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
            </Button>
          }
          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
        />
        <CardContent>
          <Grid container>
            <Grid item xs={12}>
              <Controller
                name='minThresHold'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.minimum_order}
                    placeholder={dictionary?.form?.placeholder?.minimum_order}
                    {...(errors.minThresHold && { error: true, helperText: errors.minThresHold.message })}
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </form>
    </Card>
  )
}

export default MinimumThreshold
