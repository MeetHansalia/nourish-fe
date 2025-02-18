'use client'
import { useState } from 'react'

import { Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

import { useDispatch } from 'react-redux'

import moment from 'moment'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from '@/utils/getDictionaryClient'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { setCart } from '@/redux-store/slices/global'
import { useRedirect } from '@/hooks/useAppRedirect'
import { PATH_DASHBOARD } from '@/utils/paths'

const AddEventOrderForSchoolView = props => {
  //** Hooks */
  const dispatch = useDispatch()
  const { locale, router, redirectTo } = useRedirect()
  const { t } = useTranslation(locale)

  //** States */
  const [isSubmitting, setIsSubmitting] = useState(false)

  //** Variables */
  const today = new Date()
  const minDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
  const maxDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)

  //** Validation */
  const validationSchema = yup.object().shape({
    eventName: yup
      .string()
      .required(t('form.validation.required'))
      .min(3, t('form.validation.min_length', { field: t('form.label.event_name'), length: 3 }))
      .max(50, t('form.validation.max_length', { field: t('form.label.event_name'), length: 50 }))
      .matches(/^[a-zA-Z0-9\s]+$/, t('form.validation.alphanumeric', { field: t('form.label.event_name') })),
    orderDate: yup
      .string()
      .required(t('form.validation.required', { field: t('form.label.date') }))
      .test('is-valid-date', t('form.validation.invalidDate'), value => !isNaN(Date.parse(value)))
      .test(
        'is-after-min-date',
        value => {
          const formattedMinDate = `${minDate.getMonth() + 1}-${minDate.getDate()}-${minDate.getFullYear()}`

          return t('form.validation.dateMin', { date: formattedMinDate })
        },
        value => new Date(value) >= minDate
      )
      .test(
        'is-before-max-date',
        value => {
          const formattedMaxDate = `${maxDate.getMonth() + 1}-${maxDate.getDate()}-${maxDate.getFullYear()}`

          return t('form.validation.dateMax', { date: formattedMaxDate })
        },
        value => new Date(value) <= maxDate
      )
  })

  //** Default Values */
  const defaultValue = {
    eventName: '',
    orderDate: null
  }

  //** Form */
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultValue
  })

  //** Submit Handler */
  const onSubmit = async data => {
    setIsSubmitting(true)
    const { orderDate } = data
    const parsedDate = moment(orderDate).format('YYYY-MM-DD')

    try {
      const res = await axiosApiCall.post(API_ROUTER.SCHOOL_ADMIN.ADD_EVENT, { ...data, orderDate: parsedDate })

      const { status, message, response, meta } = res?.data

      if (status) {
        dispatch(setCart(response?.cart))
        toastSuccess(message)
        redirectTo(PATH_DASHBOARD.school.orders.addToCart)
      }
    } catch (error) {
      const errorMessage = apiResponseErrorHandling(error)

      if (isVariableAnObject(errorMessage)) {
        setFormFieldsErrors(errorMessage, setError)
      } else {
        toastError(errorMessage)
      }

      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Box>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2} alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant='h5'>{t('page.order_management.add_new_order')}</Typography>
                </Grid>
                <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant='contained' color='primary' type='submit' disabled={isSubmitting}>
                    {t('form.button.submit')}
                    {isSubmitting && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
                  </Button>
                  <Button variant='customLight' onClick={() => router.back()} disabled={isSubmitting}>
                    {t('form.button.cancel')}
                  </Button>
                </Grid>
              </Grid>
              <Grid container spacing={6}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name='orderDate'
                    control={control}
                    render={({ field }) => (
                      <AppReactDatepicker
                        // showTimeSelect
                        // timeFormat='HH:mm'
                        // id='date-time-picker'
                        // dateFormat='MM/dd/yyyy h:mm aa'
                        selected={field.value}
                        onChange={date => field.onChange(date)}
                        minDate={new Date(new Date().setDate(new Date().getDate() + 7))}
                        customInput={
                          <CustomTextField
                            fullWidth
                            label={t('form.label.date')}
                            {...(errors.orderDate && { error: true, helperText: errors.orderDate.message })}
                          />
                        }
                        placeholderText={t('form.placeholder.date')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6} gap={2}>
                  <Controller
                    name='eventName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={t('form.label.event_name')}
                        placeholder={t('form.placeholder.event_name')}
                        {...(errors.eventName && { error: true, helperText: errors.eventName.message })}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default AddEventOrderForSchoolView
