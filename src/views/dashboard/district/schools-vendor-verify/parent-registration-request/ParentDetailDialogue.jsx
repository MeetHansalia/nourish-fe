'use client'

import React, { useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import primaryColorConfig from '@/configs/primaryColorConfig'

const RejectConfirmationDialogBox = ({ dictionary, open, onClose, data, onPressApprove, isLoading }) => {
  // useEffect(() => {}, [])

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose} // Fixed setOpen to onClose
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={onClose} disableRipple disabled={isLoading}>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle>
        <Box display='flex' justifyContent='center' alignItems='center'>
          {dictionary?.dialog?.parent_details}
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
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {dictionary?.dialog?.parent_name}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {data?.parentDetails?.name}
            </Typography>
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {dictionary?.dialog?.kid_name}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {data?.kidName}
            </Typography>
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {dictionary?.dialog?.email}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {data?.parentDetails?.email}
            </Typography>
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {dictionary?.dialog?.contact}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {data?.parentDetails?.phoneNo}
            </Typography>
          </Typography>

          <Typography variant='body1' sx={{ fontWeight: 'bold', color: '#333' }}>
            {dictionary?.dialog?.address}:{' '}
            <Typography component='span' sx={{ fontWeight: 'normal', color: '#666' }}>
              {data?.parentDetails?.address}
            </Typography>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: '16px' }}>
        <Button
          disabled={isLoading}
          variant={isLoading ? 'contained' : 'customLight'}
          sx={{
            backgroundColor: primaryColorConfig[0]?.main,
            color: '#fff',
            '&:hover': { backgroundColor: primaryColorConfig[0]?.light },
            width: '120px'
          }}
          onClick={() => {
            onPressApprove()
            // onClose()
          }}
        >
          {dictionary?.form?.button?.confirm}
          {isLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
        </Button>
        <Button
          disabled={isLoading}
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

export default RejectConfirmationDialogBox
