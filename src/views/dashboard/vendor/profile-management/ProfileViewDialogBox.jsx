'use client'

import { useEffect, useState } from 'react'

// Mui Imports
import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Chip,
  CircularProgress,
  Box,
  Button
} from '@mui/material'

// utils import
import { isCancel } from 'axios'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { apiResponseErrorHandling, isVariableAnObject, setFormFieldsErrors, toastError } from '@/utils/globalFunctions'

const ProfileViewDialog = ({ open, setOpen, dictionary, suspendStart, suspendEnd }) => {
  const [alertDetails, setAlertDetails] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    axiosApiCall
      .get(API_ROUTER.NOTIFICATIONS.GET_NOTIFICATIONS)
      .then(response => {
        setAlertDetails(response?.data?.response)
        setIsLoading(true)

        response?.data?.response?.length > 0 && setOpen(true)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }, [])

  const handleCancel = async id => {
    if (!id) return
    setIsLoading(false)
    await axiosApiCall
      .patch(API_ROUTER.NOTIFICATIONS.PATCH_NOTIFICATIONS(id))
      .then(response => {
        setOpen(false)
        setIsLoading(true)

        // response.data.response.length > 0 && setOpen(true)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
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
      onClose={() => setOpen(false)}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple disabled={!isLoading}>
        <i className='tabler-x' />
      </DialogCloseButton>
      <>
        <DialogTitle>
          <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
            {/* <Avatar /> */}
            <Typography variant='h6' fontWeight='bold'>
              {alertDetails && alertDetails[0]?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{alertDetails && alertDetails[0]?.reason}</Typography>
          {suspendStart && suspendEnd && (
            <Typography className='flex items-center justify-center'>
              from {suspendStart} to {suspendEnd}
            </Typography>
          )}
          <Box display='flex' justifyContent='center' mt={2}>
            <Button
              variant={!isLoading ? 'contained' : 'customLight'}
              disabled={!isLoading}
              onClick={() => handleCancel(alertDetails[0]?._id)}
            >
              {dictionary?.form?.button?.cancel}
              {!isLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
            </Button>
          </Box>
        </DialogContent>
      </>
    </Dialog>
  )
}

export default ProfileViewDialog
