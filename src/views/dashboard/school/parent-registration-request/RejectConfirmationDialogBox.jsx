'use client'

import { useState } from 'react'

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, CircularProgress } from '@mui/material'

import { toastError, toastSuccess } from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

const ProfileViewDialog = ({ open, setOpen, parentId, kidId, getAllRequests, page, itemsPerPage, dictionary }) => {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReject = async () => {
    if (!reason) {
      toastError('Please provide a rejection reason.')

      return
    }

    setIsLoading(true)

    try {
      const response = await axiosApiCall.post(API_ROUTER.SCHOOL.POST_APPROVE_REJECT_PARENT_REQUESTS, {
        parentId,
        kidId,
        verificationStatus: 'rejected',
        rejectReason: reason
      })

      if (response.status === 200) {
        toastSuccess('Request rejected successfully.')
        setOpen(false)
      }

      getAllRequests(page, itemsPerPage)
      setIsLoading(false)
      setOpen(false)
    } catch (error) {
      toastError(error?.response?.data?.message || 'Failed to reject the request.')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
      <DialogTitle>{dictionary?.page?.common?.reject_request}</DialogTitle>
      <DialogContent>
        <TextField
          // label='Rejection Reason'
          // label={dictionary?.page?.common?.reject_request}
          variant='outlined'
          fullWidth
          value={reason}
          onChange={e => setReason(e.target.value)}
          multiline
          rows={3}
          placeholder={dictionary?.dialog?.valid_reason_dec}
          // placeholder='Enter the reason for rejecting this request.'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color='secondary' disabled={isLoading}>
          {dictionary?.form?.button?.cancel}
        </Button>
        <Button onClick={handleReject} color='primary' variant='contained' disabled={isLoading || reason.length < 1}>
          {dictionary?.common?.reject}
          {isLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProfileViewDialog
