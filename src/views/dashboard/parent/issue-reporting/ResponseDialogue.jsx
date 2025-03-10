'use client'

import React, { useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress
} from '@mui/material'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { isCancel } from 'axios'

import { getSession } from 'next-auth/react'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomTextField from '@/@core/components/mui/TextField'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

const ReponseDialogue = ({
  dictionary,
  open,
  onClose,
  data,
  onSubmit,
  setOpen,
  isDetails,
  isDispute,
  isVendor,
  refreshData
}) => {
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState('')

  // Validation schema
  const schema = yup.object().shape({
    response: yup.string().required(dictionary?.form?.validation?.required)
  })

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      response: ''
    }
  })

  useEffect(() => {
    getRole()
  }, [])

  useEffect(() => {
    reset({ response: '' }) // Reset response field when dialog is opened
  }, [data, reset])

  const getRole = async () => {
    const session = await getSession()
    const userRole = session?.user?.role || ''

    setUserId(session?.user?._id)
    setRole(userRole)
  }

  const handleFormSubmit = formData => {
    setIsFormSubmitLoading(true)

    const apiFormData = {
      response: formData?.response
    }

    if (role === 'vendor_role') {
      sendResponseAsVendor(apiFormData)
    } else if (role === 'parent_role' || role === 'teacher_role') {
      sendResponseAsParent(apiFormData)
    } else if (role === 'admin_role') {
      sendResponseAsAdmin(apiFormData)
    } else {
      sendResponseAsAdmin(apiFormData)
    }
  }

  const sendResponseAsAdmin = async apiFormData => {
    const apiUrl = `${API_ROUTER?.ADMIN?.DISPUTE_RESPONSE}?disputeId=${data?.disputeId._id}`

    axiosApiCall
      .patch(apiUrl, apiFormData)
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
        refreshData()
        reset()
        onClose()
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
            reset()
            onClose()
          }
        }
      })
  }

  const sendResponseAsParent = async apiFormData => {
    const apiUrl = `${API_ROUTER?.PARENT?.ISSUE_RESPONSE}?disputeId=${data?.disputeId}`

    axiosApiCall
      .patch(apiUrl, apiFormData)
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
        refreshData()
        reset()
        onClose()
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
            reset()
            onClose()
          }
        }
      })
  }

  const sendResponseAsVendor = async apiFormData => {
    const apiUrl = `${API_ROUTER?.VENDOR?.DISPUTE_VENDOR_RESPONSE}/${data?._id}`

    axiosApiCall
      .patch(apiUrl, apiFormData)
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
        refreshData()
        reset()
        onClose()
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
            reset()
            onClose()
          }
        }
      })
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => setOpen(false)}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => onClose()} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle>
        <Box display='flex' justifyContent='center' alignItems='center'>
          {isDetails
            ? role == 'vendor_role'
              ? dictionary?.dialog?.warning
              : dictionary?.dialog?.response_Detail
            : dictionary?.dialog?.response}
        </Box>
      </DialogTitle>
      {isDetails ? (
        <DialogContent sx={{ overflow: 'visible', paddingBottom: 2 }}>
          <Box display='flex' flexDirection='column' gap={3} sx={{ overflow: 'visible', paddingLeft: 18 }}>
            {/* Description */}
            <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
              {`${dictionary?.dialog?.description}:`}
              <Typography component='span' sx={{ fontWeight: 'normal', color: '#666', marginLeft: 1 }}>
                {role === 'vendor_role' ? data?.issueId?.issue_description : data?.issue_description}
              </Typography>
            </Typography>
            {/* Vendor Response */}
            {data?.replies?.length > 0 &&
              data?.replies?.map((reply, index) => (
                <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }} key={index}>
                  {`${
                    reply?.sender === userId
                      ? dictionary?.common?.your
                      : reply?.repliedBy === 'parent_role'
                        ? 'Parent'
                        : reply?.repliedBy === 'admin_role'
                          ? 'Authority Warning'
                          : reply?.repliedBy
                  } ${dictionary?.dialog?.response}:`}{' '}
                  <Typography component='span' sx={{ fontWeight: 'normal', color: '#666', marginLeft: 1 }}>
                    {/* Add Response */}
                    {reply?.message || 'N/A'}
                  </Typography>
                </Typography>
              ))}
          </Box>
        </DialogContent>
      ) : (
        <DialogContent sx={{ overflow: 'visible', paddingBottom: 2 }}>
          <Box display='flex' flexDirection='column' gap={2}>
            {/* Dispute Name Field */}
            {!isDispute && (
              <TextField
                label={dictionary?.dialog?.issue_name}
                variant='outlined'
                fullWidth
                value={data?.issue_topic || ''}
                InputProps={{
                  readOnly: true
                }}
              />
            )}

            {/* Response Field */}
            <Controller
              name='response'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label={dictionary?.dialog?.response}
                  variant='outlined'
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={dictionary?.dialog?.type_here}
                  error={!!errors.response}
                  helperText={errors.response?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
      )}

      <DialogActions>
        {!isDetails && (
          <Button
            disabled={isFormSubmitLoading}
            variant='contained'
            color='primary'
            onClick={handleSubmit(handleFormSubmit)}
            sx={{ minWidth: '120px' }}
          >
            {dictionary?.form?.button?.submit}
            {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
          </Button>
        )}

        <Button variant='contained' color='success' onClick={onClose} sx={{ minWidth: '120px' }}>
          {dictionary?.form?.button?.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ReponseDialogue
