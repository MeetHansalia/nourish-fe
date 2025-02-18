'use client'

// MUI Imports
import { useMemo, useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useSelector, useDispatch } from 'react-redux'
import Rating from '@mui/material/Rating'

import { Box, Button, Grid, IconButton, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import CloseIcon from '@mui/icons-material/Close'

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'

import { useTranslation } from '@/utils/getDictionaryClient'
import { useRedirect } from '@/hooks/useAppRedirect'
import {
  reviewDialogState,
  setDialogData,
  setIsCompleteOrderApiCall,
  setIsDialogFromDeliveryPage,
  setIsDialogShow,
  setIsFromPendingApi,
  setIsRefreshReviewList
} from '@/redux-store/slices/reviewDialog'

import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { getPathnameWithoutPanel } from '@/app/server/actions'
import { USER_PANELS } from '@/utils/constants'

const GlobalReviewDialog = () => {
  const [isOpenDialog, setIsOpenDialog] = useState(false)

  const { isDialogShow, dialogData, isFromPendingApi, isCompleteOrderApiCall } = useSelector(reviewDialogState)

  const dispatch = useDispatch()
  const router = useRouter()

  const { locale } = useRedirect()
  const { t } = useTranslation(locale)
  const [dialogDetailData, setDialogDetailData] = useState(dialogData)
  const [isLoading, setIsLoading] = useState(false)

  // const abortController = useRef(null)

  useEffect(() => {
    if (isDialogShow) {
      setDialogDetailData(dialogData)
      setIsOpenDialog(true)
    }
  }, [isDialogShow])

  useEffect(() => {
    if (!dialogData) {
      if (isFromPendingApi) {
        getPendingReviewList()
      }

      dispatch(setIsFromPendingApi(true))
    }
  }, [])

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
        orderId: dialogDetailData?.order?._id,
        reviewNumber: rating,
        ...data
      }

      const res = await axiosApiCall.post(API_ROUTER.SCHOOL_ADMIN.REVIEW_MEAL, payload)

      const { status, message, response, meta } = res?.data

      if (status) {
        toastSuccess(message)
        dispatch(setIsDialogShow(false))
        dispatch(setDialogData(null))
        dispatch(setIsRefreshReviewList({ orderId: dialogDetailData?.order?._id, isRefresh: true }))
        reset()
        setIsOpenDialog(false)
      }
    } catch (error) {
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

  const onClickLaterReview = async () => {
    try {
      const res = await axiosApiCall.post(API_ROUTER.SCHOOL_ADMIN.REVIEW_LATER)

      const { status, message, response, meta } = res?.data

      if (status) {
        setIsOpenDialog(false)
        dispatch(setIsDialogShow(false))
        dispatch(setDialogData(null))
        reset()
      }
    } catch (error) {
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

  const getPendingReviewList = async () => {
    try {
      const res = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.GET_PENDING_REVIEW_LIST)
      const { status, response } = res?.data

      if (status && response?.order) {
        setDialogDetailData(response)
        setIsOpenDialog(true)
      }
      // const responseVendor = response?.data?.response?.vendors || []

      // setVendorList(responseVendor)
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message)
      }
    }
  }

  // const getAllCompletedOrders = async () => {
  //   if (abortController.current) {
  //     abortController.current.abort()
  //   }

  //   abortController.current = new AbortController()

  //   const orderBy = sorting.reduce((acc, { id, desc }) => {
  //     acc[id] = desc ? -1 : 1

  //     return acc
  //   }, {})

  //   const orderByString = Object.keys(orderBy).length > 0 ? JSON.stringify(orderBy) : null

  //   setIsLoading(true)

  //   try {
  //     const response = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.GET_ALL_COMPLETE_ORDERS, {
  //       params: {
  //         page,
  //         limit: itemsPerPage,
  //         kidId: selectedKid === 'all' ? null : selectedKid,
  //         vendorId: selectedVendor === 'all' ? null : selectedVendor,
  //         isReviewed: isReviewed === 'all' ? null : isReviewed,
  //         orderDate: orderDate,
  //         orderBy: orderByString
  //       },
  //       signal: abortController.current.signal
  //     })

  //     const responseOrderList = response?.data?.response?.completeOrdersList || []
  //     const meta = response?.data?.meta || {}

  //     setData(responseOrderList)
  //     setTotalCount(meta.totalFiltered || 0)
  //     setTotalPages(meta.totalPage || 1)

  //     if (responseOrderList.length === 0 && page > 1) {
  //       setPage(prevPage => prevPage - 1)
  //     }
  //   } catch (error) {
  //     if (error.name !== 'AbortError') {
  //       toastError(error?.response?.data?.message)
  //     }
  //   }

  //   setIsLoading(false)
  // }

  const handleDialogClose = async e => {
    e.preventDefault() // Prevent the default anchor behavior
    const pathnameWithoutPanel = await getPathnameWithoutPanel()

    dispatch(setIsDialogShow(false))
    dispatch(setDialogData(null))
    dispatch(setIsFromPendingApi(false))
    dispatch(setIsDialogFromDeliveryPage(false))

    if (pathnameWithoutPanel === '/feedback') {
      setIsOpenDialog(false)
      dispatch(setIsCompleteOrderApiCall(!isCompleteOrderApiCall))
    } else {
      setIsOpenDialog(false)
      router.push(`/${locale}/${USER_PANELS?.school}/feedback`)
    }
  }

  //** MEMO */
  const orderInfo = useMemo(() => {
    if (!dialogDetailData?.order) {
      return []
    }

    let orderDetails = dialogDetailData?.order?.orderItems
      ?.map(item => `${item?.dishId?.name}-${item?.quantity}`)
      .join(', ')

    return [
      {
        label: t('form.label.vendor_name'),
        value: `${dialogDetailData?.order?.vendorId?.first_name} ${dialogDetailData?.order?.vendorId?.last_name}`
      },

      ...(dialogDetailData?.order?.kidId
        ? [
            {
              label: t('form.label.kid_name'),
              value: `${dialogDetailData?.order?.kidId?.first_name} ${dialogDetailData?.order?.kidId?.last_name}`
            }
          ]
        : []),
      { label: t('page.common.order_date'), value: dialogDetailData?.order?.orderDate },
      { label: t('page.common.details'), value: orderDetails }
    ]
  }, [dialogDetailData?.order])

  //** MEMO */

  return (
    <Dialog
      fullWidth
      open={isOpenDialog}
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
        onClick={onClickLaterReview}
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
          <Button variant='customLight' disabled={loading} onClick={onClickLaterReview}>
            {t('form.button.later')}
          </Button>
        </Box>
        {/* Bottom Right Message */}
        {dialogDetailData?.totalOrders > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            <a
              onClick={handleDialogClose}
              style={{
                textDecoration: 'none',
                fontSize: 'inherit',
                cursor: 'pointer'
              }}
            >
              {(dialogDetailData?.totalOrders ?? 0) - 1} + {t('page.common.more_reviews')}
            </a>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default GlobalReviewDialog
