'use client'

import { useState } from 'react'

import { Dialog, DialogTitle, DialogContent, Button, Typography, Box } from '@mui/material'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError, toastSuccess } from '@/utils/globalFunctions'

const ThresholdViewDialogBox = ({ open, setOpen, dialogProps }) => {
  const { selectedRow, setData, dictionary } = dialogProps

  const [loading, setLoading] = useState(false)

  const handleThresholdConfirm = async (id, userId) => {
    const payload = {
      userId,
      approved: true,
      requestUserType: 'vendor_role'
    }

    setLoading(true)

    await axiosApiCall
      .patch(API_ROUTER.DISTRICT.APPROVE_REJECT_THRESHOLD_REQUEST(id), payload)
      .then(response => {
        toastSuccess(response?.data?.message)
        setOpen(false)

        // if call successfull removing that data from array
        setData(prevData => prevData.filter(item => item._id !== id))
      })
      .catch(err => {
        toastError(err?.data?.message)
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
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple disabled={loading}>
        <i className='tabler-x' />
      </DialogCloseButton>
      <>
        <DialogTitle>
          <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
            {/* <Avatar /> */}
            <Typography variant='h6' fontWeight='bold'>
              {/* {alertDetails && alertDetails[0]?.title} */}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{dictionary?.datatable?.column?.vendor_name}</strong>
            {': '}
            {selectedRow && `${selectedRow?.first_name} ${selectedRow?.last_name}`}
          </Typography>
          <Typography>
            <strong>{dictionary?.form?.label?.business_name}</strong> {': '}
            {selectedRow && `${selectedRow?.first_name} ${selectedRow?.last_name}`}
          </Typography>
          <Typography>
            <strong>{dictionary?.dialog?.contact}</strong>
            {': '} {selectedRow && `${selectedRow?.email}`}
          </Typography>
          <Typography>
            <strong>{dictionary?.dialog?.address}</strong> {': '} {selectedRow && `${selectedRow?.address}`}
          </Typography>

          <Box display='flex' gap={2} justifyContent='center' mt={2}>
            <Button
              variant='contained'
              onClick={() => handleThresholdConfirm(selectedRow?._id, selectedRow?.userId)}
              disabled={loading}
            >
              {loading ? `${dictionary?.common?.processing}` : `${dictionary?.form?.button?.confirm}`}
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

export default ThresholdViewDialogBox
