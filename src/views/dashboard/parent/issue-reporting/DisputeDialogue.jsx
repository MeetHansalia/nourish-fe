'use client'

import React, { useEffect, useState } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { getSession } from 'next-auth/react'

import { format } from 'date-fns'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import primaryColorConfig from '@/configs/primaryColorConfig'

const DisputeDetailsDialog = ({
  dictionary,
  open,
  onClose,
  details,
  isDisputeDetail,
  onOpenDispute,
  isVendorDetail
}) => {
  const [role, setRole] = useState('')
  const [raisedate, setRaiseDate] = useState('')

  const getRole = async () => {
    const session = await getSession()
    const userRole = session?.user?.role || ''

    setRole(userRole)
  }

  const getDate = date => {
    const formattedDate = format(new Date(date), 'dd MMM, yyyy - hh:mm a')

    setRaiseDate(formattedDate)
  }

  useEffect(() => {
    getRole()
    getDate(isVendorDetail ? details?.disputeDate : details?.createdAt)
  }, [])

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose} // Fixed setOpen to onClose
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={onClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle>
        <Box display='flex' justifyContent='center' alignItems='center'>
          {isDisputeDetail ? dictionary?.dialog?.dispute_details : dictionary?.dialog?.issue_details}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          display='flex'
          flexDirection='column'
          gap={2}
          sx={{
            overflow: 'visible',
            paddingLeft: 18
          }}
        >
          {/* Disputer Name */}
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {isDisputeDetail ? dictionary?.dialog?.dispute_topic : dictionary?.dialog?.issue_topic}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {isVendorDetail ? details?.issueId?.issue_topic : details?.issue_topic}
            </Typography>
          </Typography>

          {/* Dispute Raise */}
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {isDisputeDetail ? dictionary?.dialog?.dispute_raise : dictionary?.dialog?.issue_raiseBy}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {isVendorDetail
                ? `${details?.issueId?.userId?.first_name} ${details?.issueId?.userId?.last_name}`
                : `${details?.userId?.first_name} ${details?.userId?.last_name}` || 'N/A'}
            </Typography>
          </Typography>

          {/* Dispute Authority */}
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {isDisputeDetail
              ? dictionary?.dialog?.disputer_name
              : isVendorDetail
                ? dictionary?.datatable?.column?.issue_description
                : details?.status !== 'Pending'
                  ? dictionary?.dialog?.issue_authority
                  : dictionary?.datatable?.column?.status}
            :{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {isDisputeDetail
                ? `${details?.userId?.first_name} ${details?.userId?.last_name}`
                : isVendorDetail
                  ? details?.issueId?.issue_description
                  : details?.status !== 'Pending'
                    ? `${details?.userId?.first_name} ${details?.userId?.last_name}`
                    : details?.status}
            </Typography>
          </Typography>

          {/* Dispute Raise */}
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {isDisputeDetail ? dictionary?.dialog?.dispute_raise : dictionary?.dialog?.issue_raise}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {raisedate || 'N/A'}
            </Typography>
          </Typography>

          {/* Description */}
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {isDisputeDetail
              ? dictionary?.dialog?.dispute_description
              : isVendorDetail
                ? dictionary?.dialog?.dispute_description
                : dictionary?.dialog?.issue_description}
            :{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {isVendorDetail ? details?.description : details?.issue_description || 'N/A'}
            </Typography>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: '16px' }}>
        {role !== 'parent_role' && role !== 'teacher_role' && role !== 'vendor_role' && (
          <Button
            variant='contained'
            sx={{
              backgroundColor: primaryColorConfig[5]?.main,
              color: '#fff',
              '&:hover': { backgroundColor: primaryColorConfig[5]?.light },
              width: '120px'
            }}
            onClick={() => {
              onOpenDispute()
              onClose()
            }}
          >
            {dictionary?.form?.button?.warning}
          </Button>
        )}
        <Button
          variant='contained'
          sx={{
            backgroundColor: primaryColorConfig[0]?.light,
            color: '#fff',
            '&:hover': { backgroundColor: primaryColorConfig[0]?.main },
            width: '120px'
          }}
          onClick={onClose}
        >
          {dictionary?.form?.button?.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DisputeDetailsDialog
