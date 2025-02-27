import React from 'react'

import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material'

import { Close as CloseIcon } from '@mui/icons-material'

const TruncatedTextWithDialog = ({ id, title, text, wordLimit = 20, price, activeId, setActiveId }) => {
  const isOpen = activeId === id

  const handleOpen = () => setActiveId(id)
  const handleClose = () => setActiveId(null)

  const words = text?.split(' ') || []
  const isTruncated = words.length > wordLimit
  const shortDescription = isTruncated ? words.slice(0, wordLimit).join(' ') + '...' : text

  return (
    <div className='content-wrapper'>
      <Typography className='disc-common-custom-small'>
        {shortDescription}
        {isTruncated && (
          <Button onClick={handleOpen} size='small' sx={{ textTransform: 'none', marginLeft: '5px' }}>
            See More
          </Button>
        )}
      </Typography>

      <Dialog className='common-modal-theme' open={isOpen} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle className='title-medium-custom'>
          {title || 'Full Description'}
          <IconButton edge='end' color='inherit' onClick={handleClose} aria-label='close'>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className='modal-body-custom'>
          <Typography className='disc-common-custom-small'>{text}</Typography>
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={handleClose} variant='contained'>
            Close
          </Button>
        </DialogActions> */}
      </Dialog>
    </div>
  )
}

export default TruncatedTextWithDialog
