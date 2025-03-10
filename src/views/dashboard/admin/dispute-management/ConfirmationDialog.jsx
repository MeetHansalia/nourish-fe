'use client'

// Mui Imports
import { Dialog, DialogContent, DialogTitle, Typography, CircularProgress, Box, Button } from '@mui/material'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import primaryColorConfig from '@/configs/primaryColorConfig'

const ConfirmationDialog = ({
  open,
  onClose,
  title,
  leftButtonTitle,
  rightButtonTitle,
  descriptionText,
  details,
  onSubmitConfirm,
  isConfirmSubmiting
}) => {
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => onClose()}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => onClose()} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <>
        <DialogTitle>
          <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
            {/* <Avatar /> */}
            <Typography variant='h6' fontWeight='bold'>
              {title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Typography textAlign={'center'}>{descriptionText}</Typography>
          <Box display='flex' justifyContent='center' mt={5} mx={5} gap={5}>
            <Button
              variant='customLight'
              color='primary'
              sx={{
                backgroundColor: primaryColorConfig[0].light,
                borderColor: primaryColorConfig[0].light,
                color: 'white'
              }}
              //  onClick={() => setOpen(false)}
              onClick={() => onSubmitConfirm(details)}
            >
              {leftButtonTitle}
              {isConfirmSubmiting && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
            </Button>
            <Button
              variant='contained'
              color='error'
              sx={{ backgroundColor: primaryColorConfig[5].main, borderColor: primaryColorConfig[5].dark }}
              //  onClick={() => setOpen(false)}
              onClick={() => onClose()}
            >
              {rightButtonTitle}
            </Button>
          </Box>
        </DialogContent>
      </>
    </Dialog>
  )
}

export default ConfirmationDialog
