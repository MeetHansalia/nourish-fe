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

  // useEffect(() => {
  //   if (!dialogData) {
  //     if (isFromPendingApi) {
  //       getPendingReviewList()
  //     }

  //     dispatch(setIsFromPendingApi(true))
  //   }
  // }, [])

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

  const handleDialogClose = async e => {
    e.preventDefault()
    const pathnameWithoutPanel = await getPathnameWithoutPanel()

    dispatch(setIsDialogShow(false))
    dispatch(setDialogData(null))
    dispatch(setIsFromPendingApi(false))

    if (pathnameWithoutPanel === '/order-managementl/order-delivery-approval') {
      setIsOpenDialog(false)
      dispatch(setIsCompleteOrderApiCall(!isCompleteOrderApiCall))
    } else {
      setIsOpenDialog(false)
      router.push(`/${locale}/${USER_PANELS?.school}/order-management/order-delivery-approval`)
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
        onClick={handleDialogClose}
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
        </Box>
        <Box display='flex' justifyContent='center' mt={3} gap={2}>
          <Button variant='contained' disabled={loading} onClick={handleDialogClose}>
            {t('form.button.view')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default GlobalReviewDialog
