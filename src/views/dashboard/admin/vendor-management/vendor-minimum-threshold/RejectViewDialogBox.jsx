'use client'

import { useState } from 'react'

import { Dialog, DialogTitle, DialogContent, Button, Typography, Box, TextField } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError, toastSuccess } from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'

const RejectViewDialogBox = ({ open, setOpen, dialogProps }) => {
  const { selectedRow, setData, dictionary } = dialogProps

  const [loading, setLoading] = useState(false)

  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required('Description is required field')
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      reason: ''
    }
  })

  const onSubmit = async data => {
    const { userId, _id } = selectedRow
    const reason = data.description

    const payload = {
      userId,
      reason,
      approved: false,
      requestUserType: 'vendor_role'
    }

    setLoading(true)

    try {
      const response = await axiosApiCall.patch(API_ROUTER.ADMIN.PATCH_THRESHOLD_REQUEST(_id), payload)

      const responseBody = response?.data

      // if call successfull removing that data from array
      setData(prevData => prevData.filter(item => item._id !== _id))
      toastSuccess(responseBody?.message)
      setOpen(false)
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'An error occurred. Please try again.'

      toastError(errorMessage)
    }
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
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple disabled={loading}>
        <i className='tabler-x' />
      </DialogCloseButton>
      <>
        <DialogTitle>
          <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
            <Typography variant='h6' fontWeight='bold'></Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='subtitle1' gutterBottom>
            {dictionary?.form?.placeholder?.reason}
          </Typography>

          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant='outlined'
                multiline
                rows={4}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Box display='flex' gap={2} justifyContent='center' mt={2}>
            <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={!isValid || loading}>
              {loading ? `${dictionary?.common?.processing}` : `${dictionary?.form?.button?.submit}`}
            </Button>
            <Button variant='customLight' onClick={() => setOpen(false)} disabled={loading}>
              {dictionary?.form?.button?.cancel}
            </Button>
          </Box>
        </DialogContent>
      </>
    </Dialog>
  )
}

export default RejectViewDialogBox
