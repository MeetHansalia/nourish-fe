'use client'

import { useState } from 'react'

import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { isCancel } from 'axios'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import CustomTextField from '@/@core/components/mui/TextField'

const ChangePasswordDialog = ({ open, setOpen, dialogProps }) => {
  const { dictionary } = dialogProps

  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .matches(/\d/, 'Password must contain at least one number'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required')
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async data => {
    const payload = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    }

    setLoading(true)

    try {
      const response = await axiosApiCall.patch(API_ROUTER.PATCH_CHANGE_PASSWORD, payload)

      toastSuccess(response?.data?.message || 'Password changed successfully')
      reset()
      setOpen(false)
      setLoading(false)
    } catch (error) {
      if (!isCancel(error)) {
        setLoading(false)
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
        }
      }
    }
  }

  const togglePasswordVisibility = field => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (!loading && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
          setOpen(false)
        }
      }}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton
        onClick={() => {
          setOpen(false)
          reset()
        }}
        disableRipple
        disabled={loading}
      >
        <i className='tabler-x' />
      </DialogCloseButton>
      <>
        <DialogTitle>
          <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
            <Typography variant='h6' fontWeight='bold'>
              {dictionary?.common?.change_password}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Controller
            name='oldPassword'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label={dictionary?.form?.label?.old_password}
                placeholder={dictionary?.form?.placeholder?.enter_old_password}
                type={showPassword.oldPassword ? 'text' : 'password'}
                fullWidth
                margin='normal'
                error={!!errors.oldPassword}
                helperText={errors.oldPassword?.message}
                variant='outlined'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => togglePasswordVisibility('oldPassword')} edge='end'>
                        {showPassword.oldPassword ? <i className='tabler-eye' /> : <i className='tabler-eye-off' />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
            disabled={loading}
          />

          <Controller
            name='newPassword'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label={dictionary?.form?.label?.new_password}
                placeholder={dictionary?.form?.placeholder?.enter_new_password}
                type={showPassword.newPassword ? 'text' : 'password'}
                fullWidth
                margin='normal'
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => togglePasswordVisibility('newPassword')} edge='end'>
                        {showPassword.newPassword ? <i className='tabler-eye' /> : <i className='tabler-eye-off' />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
            disabled={loading}
          />

          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label={dictionary?.form?.label?.confirm_password}
                placeholder={dictionary?.form?.placeholder?.enter_confirm_password}
                type={showPassword.confirmPassword ? 'text' : 'password'}
                fullWidth
                margin='normal'
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => togglePasswordVisibility('confirmPassword')} edge='end'>
                        {showPassword.confirmPassword ? <i className='tabler-eye' /> : <i className='tabler-eye-off' />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
            disabled={loading}
          />

          <Box display='flex' gap={2} justifyContent='center' mt={2}>
            <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={!isValid || loading}>
              {loading ? `${dictionary?.common?.processing}` : `${dictionary?.form?.button?.submit}`}
            </Button>
            <Button
              variant='customLight'
              onClick={() => {
                setOpen(false)
                reset()
              }}
              disabled={loading}
            >
              {dictionary?.form?.button?.cancel}
            </Button>
          </Box>
        </DialogContent>
      </>
    </Dialog>
  )
}

export default ChangePasswordDialog
