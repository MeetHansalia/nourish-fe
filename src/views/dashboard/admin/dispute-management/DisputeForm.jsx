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

const DisputeForm = ({ dictionary, role }) => {
  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Form Validation Schema
   */

  const formValidationSchema = yup.object().shape({
    disputerName: yup.string().required('Disputer Name is required'),
    disputeRaisedTo: yup.string().required('Dispute Raised To is required'),
    disputeDescription: yup.string().required('Dispute Description is required'),
    resolutionDescription: yup.string().required('Resolution Description is required')
  })

  const formDefaultValues = {
    disputerName: '',
    disputeRaisedTo: '',
    disputeDescription: '',
    resolutionDescription: ''
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

  // Simulated dropdown data
  const disputerOptions = [
    { _id: '1', first_name: 'John', last_name: 'Doe' },
    { _id: '2', first_name: 'Jane', last_name: 'Smith' }
  ]

  const disputeRaisedOptions = [
    { _id: '1', name: 'Authority 1' },
    { _id: '2', name: 'Authority 2' }
  ]

  const onSubmit = data => {
    setIsSubmitting(true)
    console.log('Form Data:', data)

    reset()
  }

  const handleCancel = () => {
    reset()
  }

  //   const handleKidChange = event => {
  //     console.log('event: ', event?.target?.value)
  //     setSelectedDate('')
  //     setValue('date', '')
  //     getAvailableDates(event?.target?.value)
  //   }

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader
        title={dictionary?.page?.dispute_management?.dispute_resolution || 'Dispute Add'}
        action={
          <>
            <Button
              disabled={isFormSubmitLoading}
              variant='contained'
              sx={{ m: 1 }}
              type='submit'
              onClick={handleSubmit(onSubmit)}
            >
              {dictionary?.form?.button?.submit || 'Submit'}
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
                handleCancel()
              }}
              sx={{ m: 1 }}
            >
              {dictionary?.form?.button?.cancel || 'Cancel'}
            </Button>
          </>
        }
      />
      <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} style={{ padding: '16px' }}>
          {/* Disputer Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name='disputerName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  InputProps={{
                    readOnly: true
                  }}
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.disputer_name}
                  {...(errors.disputerName && { error: true, helperText: errors.disputerName.message })}
                />
              )}
            />
          </Grid>

          {/* Dispute Raised To */}
          <Grid item xs={12} sm={6}>
            <Controller
              name='disputeRaisedTo'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  InputProps={{
                    readOnly: true
                  }}
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.dispute_raise || 'Dispute Raised To Name'}
                  {...(errors.disputeRaisedTo && { error: true, helperText: errors.disputeRaisedTo.message })}
                />
              )}
            />
          </Grid>

          {/* Dispute Description */}
          <Grid item marginTop={2} xs={12}>
            <TextareaAutosize
              aria-label='minimum height'
              minRows={3}
              placeholder={dictionary?.form?.placeholder?.disputeDescription || 'Enter Dispute Description'}
              style={{
                width: '100%',
                border: errors.disputeDescription ? '1px solid red' : '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                outline: 'none',
                color: 'var(--mui-palette-text-primary)',
                fontFamily: 'inherit'
              }}
              {...register('disputeDescription')}
            />
            {errors.disputeDescription && (
              <Typography color='error' variant='caption'>
                {errors.disputeDescription.message}
              </Typography>
            )}
          </Grid>

          {/* Resolution Description */}
          <Grid item marginTop={2} xs={12}>
            <TextareaAutosize
              aria-label='minimum height'
              minRows={3}
              placeholder={dictionary?.form?.placeholder?.resolutionDescription || 'Enter Resolution Description'}
              style={{
                width: '100%',
                border: errors.resolutionDescription ? '1px solid red' : '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                outline: 'none',
                color: 'var(--mui-palette-text-primary)',
                fontFamily: 'inherit'
              }}
              {...register('resolutionDescription')}
            />
            {errors.resolutionDescription && (
              <Typography color='error' variant='caption'>
                {errors.resolutionDescription.message}
              </Typography>
            )}
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default DisputeForm
