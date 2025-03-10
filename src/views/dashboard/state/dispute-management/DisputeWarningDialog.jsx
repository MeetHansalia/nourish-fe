'use client'

import React, { useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  TextareaAutosize
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { format } from 'date-fns'

import { isCancel } from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

const DisputeWarningDialog = ({ dictionary, open, onClose, details, refreshData }) => {
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  // Default Values
  const formDefaultValues = {
    vendorName: `${details?.vendorId?.first_name} ${details?.vendorId?.last_name}` || '',
    orderDetails: details?.issue_topic || '',
    orderDate: details?.issueDate || '',
    schoolName: `${details?.userId?.first_name} ${details?.userId?.last_name}` || '',
    description: ''
  }

  // Validation Schema
  const formValidationSchema = yup.object().shape({
    vendorName: yup.string().required(dictionary?.form?.validation?.vendor_name),
    orderDetails: yup.string().required(dictionary?.form?.validation?.order_details),
    orderDate: yup.string().required(dictionary?.form?.validation?.order_date),
    schoolName: yup.string().required(dictionary?.form?.validation?.name),
    description: yup.string().required(dictionary?.form?.validation?.description)
  })

  const {
    control,
    register,
    setError,

    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: formDefaultValues
    // mode: 'onBlur', // Validate only when a field loses focus
    // reValidateMode: 'onBlur'
  })

  const handleCancel = () => {
    reset()
    onClose()
  }

  const onSubmit = async data => {
    const apiFormData = {
      disputeDate: format(new Date(), 'yyyy-MM-dd'),
      description: data?.description,
      issueId: details?._id,
      vendorId: details?.vendorId?._id
    }

    axiosApiCall
      .post(API_ROUTER?.ADMIN?.CREATE_DISPUTE, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
        refreshData()
        onClose()
        reset(formDefaultValues)
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

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible', padding: '16px' } }}
    >
      <DialogCloseButton onClick={onClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        {dictionary?.form?.label?.dispute_warning}
      </DialogTitle>
      <DialogContent>
        <form noValidate onClick={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Vendor Name */}
            <Grid item xs={12}>
              <Controller
                name='vendorName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    InputProps={{
                      readOnly: true
                    }}
                    label={dictionary?.form?.label?.vendor_names}
                    placeholder={dictionary?.form?.label?.vendor_names}
                    {...(errors.vendorName && { error: true, helperText: errors.vendorName.message })}
                  />
                )}
              />
            </Grid>

            {/* Order Details */}
            <Grid item xs={12}>
              <Controller
                name='orderDetails'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    InputProps={{
                      readOnly: true
                    }}
                    label={dictionary?.form?.label?.order_details}
                    placeholder={dictionary?.form?.label?.order_details}
                    {...(errors.orderDetails && { error: true, helperText: errors.orderDetails.message })}
                  />
                )}
              />
            </Grid>

            {/* Order Date */}
            <Grid item xs={12}>
              <Controller
                name='orderDate'
                control={control}
                render={({ field }) => (
                  <AppReactDatepicker
                    // disabled
                    readOnly
                    // disabled={availableDates?.length === 0}
                    selected={details?.issueDate}
                    // minDate={new Date()}
                    // onChange={date => {
                    //   field.onChange(date)

                    //   setSelectedDate(date)
                    // }}
                    // includeDates={availableDates}
                    placeholderText={dictionary?.form?.label?.order_date}
                    customInput={
                      <CustomTextField
                        {...field}
                        InputProps={{
                          readOnly: true
                        }}
                        fullWidth
                        label={dictionary?.form?.label?.order_date}
                        placeholder={dictionary?.form?.label?.order_date}
                        {...(errors.orderDate && { error: true, helperText: errors.orderDate.message })}
                      />
                    }
                  />
                  // </CustomTextField>
                )}
              />
            </Grid>

            {/* School Name */}
            <Grid item xs={12}>
              <Controller
                name='schoolName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    InputProps={{
                      readOnly: true
                    }}
                    label={dictionary?.form?.label?.disputer_name}
                    placeholder={dictionary?.form?.label?.disputer_name}
                    {...(errors.schoolName && { error: true, helperText: errors.schoolName.message })}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <>
                    <Typography fontStyle={{ fontSize: 'inherit', color: 'inherit' }} variant='inherit'>
                      {dictionary?.dialog?.description}
                    </Typography>
                    <TextareaAutosize
                      {...field}
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
                        fontFamily: 'inherit'
                      }}
                      value={field.value || ''} // Ensure controlled value
                      onChange={e => {
                        field.onChange(e.target.value) // Register changes in react-hook-form
                      }}
                      onBlur={field.onBlur} // Register blur event for validation
                    />
                    {errors.description && (
                      <Typography color='error' variant='caption'>
                        {errors.description.message}
                      </Typography>
                    )}
                  </>
                )}
              />
              {/* <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={3}
                    label={dictionary?.form?.label?.description}
                    placeholder={dictionary?.form?.placeholder?.type_here}
                    {...(errors.description && { error: true, helperText: errors.description.message })}
                  />
                )}
              /> */}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: '16px' }}>
        <Button
          disabled={isFormSubmitLoading}
          variant='contained'
          color='primary'
          type='submit'
          onClick={handleSubmit(onSubmit)}
        >
          {dictionary?.form?.button?.send}
        </Button>
        <Button color='secondary' variant='contained' onClick={handleCancel}>
          {dictionary?.form?.button?.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DisputeWarningDialog
