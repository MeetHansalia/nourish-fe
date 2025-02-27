'use client'

// MUI Imports
import { useMemo, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { Grid, TextField } from '@mui/material'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { useTranslation } from '@/utils/getDictionaryClient'
import { useRedirect } from '@/hooks/useAppRedirect'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const ReviewDialog = ({ selectedRow, open = false, orderData = selectedRow, setOpen }) => {
  //** HOOKS */
  const { locale } = useRedirect()
  const { t } = useTranslation(locale)

  //** STATES */
  const [rating, setRating] = useState(orderData?.reviewNumber || 0)
  const [loading, setLoading] = useState(false)

  //** VALIDATION SCHEMA */
  const schema = yup.object().shape({
    reviewDescription: yup
      .string()
      .nullable()
      .matches(/^[a-zA-Z0-9\s.!?]+$/, {
        message: t('form.validation.alphanumeric', { field: t('page.common.review') }),
        excludeEmptyString: true
      })
  })

  //** HOOK FORM */
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError
  } = useForm({
    defaultValues: { reviewDescription: '' },
    resolver: yupResolver(schema)
  })

  //** SUBMIT HANDLER */
  const onSubmit = async data => {
    setLoading(true)

    try {
      let payload = {
        orderId: orderData?._id,
        reviewNumber: rating,
        ...data
      }

      const res = await axiosApiCall.post(API_ROUTER.STAFF.REVIEW_MEAL, payload)

      const { status, message, response, meta } = res?.data

      if (status) {
        toastSuccess(message)
        updateOrderReviewStatus(orderData?._id)
        reset()
        handleClose()
      }
    } catch (error) {
      console.error('ReviewDialog ~ error:', error)
      const errorMessage = apiResponseErrorHandling(error)

      if (isVariableAnObject(errorMessage)) {
        setFormFieldsErrors(errorMessage, setError)
      } else {
        toastError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  //** MEMO */
  const orderInfo = useMemo(() => {
    if (!orderData) {
      return []
    }

    let orderDetails = orderData?.orderId?.orderItems?.map(item => `${item?.dishId?.name}-${item?.quantity}`).join(', ')

    return [
      { label: t('form.label.vendor_name'), value: orderData?.orderId?.vendorId?.first_name },
      { label: t('form.label.reviewedBy'), value: orderData?.reviewBy?.first_name },
      { label: t('page.common.order_date'), value: orderData?.orderId?.orderDate },
      { label: t('page.common.details'), value: orderDetails }
    ]
  }, [orderData])

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
      <DialogTitle>
        <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
          <Typography variant='h6' fontWeight='bold'>
            {t('page.common.review')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        <Box display='flex' flexDirection='column' gap={1.5} sx={{ p: 10 }}>
          {orderInfo?.map(({ label, value }) => (
            <Typography key={label}>
              <strong>{label} :</strong> {value || 'N/A'}
            </Typography>
          ))}
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item sx={{ paddingTop: '0 !important' }}>
                <Typography gutterBottom>
                  <strong>{t('page.common.rating')} :</strong>{' '}
                </Typography>
              </Grid>
              <Grid item sx={{ paddingTop: '0 !important' }}>
                <Rating
                  name='meal-review'
                  value={rating}
                  // onChange={(event, newValue) => setRating(newValue)}
                  disabled
                  size='small'
                  sx={{
                    color: 'primary.main',
                    '& .MuiRating-iconFilled': {
                      color: 'primary.main'
                    },
                    '& .MuiRating-iconHover': {
                      color: 'primary.light'
                    },
                    '& .MuiRating-icon': {
                      color: 'primary.light'
                    },
                    fontSize: '1rem'
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Box mt={2}>
            <Controller
              name='reviewDescription'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  minRows={3}
                  value={orderData?.reviewDescription}
                  label={t('page.common.review')}
                  variant='outlined'
                  fullWidth
                  disabled
                  error={!!errors.reviewDescription}
                  helperText={errors.reviewDescription?.message}
                />
              )}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewDialog
