'use client'

// React Imports
import { forwardRef } from 'react'

// MUI Imports
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

const PreviewDocDialog = ({ imageUrl, open, onClose }) => {
  const isPdf = url => {
    return url.toLowerCase().endsWith('.pdf')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{'Preview'}</DialogTitle>
      <DialogContent>
        {isPdf(imageUrl) ? (
          <iframe
            src={imageUrl}
            style={{
              width: '100%',
              height: '500px', // Adjust the height as needed
              border: 'none',
              objectFit: 'contain'
            }}
          />
        ) : (
          <img src={imageUrl} alt='Preview' style={{ width: '100%', height: 'auto' }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default forwardRef(PreviewDocDialog)
