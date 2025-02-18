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

const ReviewDialog = ({ open = false, handleClose = () => {}, orderData = {}, updateOrderReviewStatus = () => {} }) => {
  //** HOOKS */
  const { locale } = useRedirect()
  const { t } = useTranslation(locale)

  //** STATES */
  const [rating, setRating] = useState(3)
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

      const res = await axiosApiCall.post(API_ROUTER.PARENT.REVIEW_MEAL, payload)

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

    let orderDetails = orderData?.orderItems?.map(item => `${item?.dishId?.name}-${item?.quantity}`).join(', ')

    return [
      { label: t('form.label.vendor_name'), value: orderData?.vendorId?.first_name },
      { label: t('form.label.kid_name'), value: orderData?.kidId?.first_name },
      { label: t('page.common.order_date'), value: orderData?.orderDate },
      { label: t('page.common.details'), value: orderDetails }
    ]
  }, [orderData])

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => handleClose(false)}
      maxWidth='sm'
      scroll='body'
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          borderRadius: 1,
          padding: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: 500
        }
      }}
    >
      <IconButton
        onClick={() => handleClose(false)}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          background: '#F4F4F4',
          color: '#000',
          '&:hover': {
            background: '#E0E0E0'
          }
        }}
        aria-label='close'
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle
        variant='h6'
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          paddingBottom: 1
        }}
      >
        {t('page.common.review')}
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
                  onChange={(event, newValue) => setRating(newValue)}
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
                  label={t('page.common.review')}
                  variant='outlined'
                  fullWidth
                  error={!!errors.reviewDescription}
                  helperText={errors.reviewDescription?.message}
                />
              )}
            />
          </Box>
        </Box>
        <Box display='flex' justifyContent='center' mt={3} gap={2}>
          <Button variant='contained' disabled={loading} onClick={handleSubmit(onSubmit)}>
            {t('form.button.submit')}
          </Button>
          <Button variant='customLight' disabled={loading}>
            {t('form.button.later')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewDialog
