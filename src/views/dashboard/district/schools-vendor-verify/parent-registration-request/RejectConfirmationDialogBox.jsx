'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
  Typography
} from '@mui/material'

import { toastError, toastSuccess } from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

const RejectConfirmationDialogBox = ({
  open,
  setOpen,
  parentId,
  kidId,
  getAllRequests,
  page,
  itemsPerPage,
  dictionary
}) => {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReject = async () => {
    if (!reason) {
      toastError(dictionary?.dialog?.valid_reason_dec)

      return
    }

    setIsLoading(true)

    try {
      const response = await axiosApiCall.post(API_ROUTER.DISTRICT.UPDATE_KID_REGISTRATION_STATUS, {
        parentId,
        kidId,
        verificationStatus: 'rejected',
        rejectReason: reason
      })

      if (response.status === 200 || response.status == 201) {
        toastSuccess(dictionary?.dialog?.req_reject_dec)
        setOpen(false)
      }

      getAllRequests(page, itemsPerPage)
      setIsLoading(false)
      setOpen(false)
    } catch (error) {
      toastError(error?.response?.data?.message || dictionary?.dialog?.fail_reject_dec)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
      <DialogTitle>{dictionary?.page?.parent_kid_management?.parent_reject_text}</DialogTitle>
      <DialogContent>
        <Typography variant='body1' mb={2}>
          {dictionary?.page?.parent_kid_management?.parent_reject_title}
        </Typography>
        <TextField
          label={dictionary?.form?.label?.email_placeholder}
          variant='outlined'
          fullWidth
          value={reason}
          onChange={e => setReason(e.target.value)}
          multiline
          rows={3}
          placeholder={dictionary?.form?.placeholder?.enter_reject_dec}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color='secondary' disabled={isLoading}>
          {dictionary?.form?.button?.cancel}
          {isLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
        </Button>
        <Button onClick={handleReject} color='primary' variant='contained' disabled={isLoading || reason.length < 1}>
          {dictionary?.common?.reject}
          {isLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RejectConfirmationDialogBox
