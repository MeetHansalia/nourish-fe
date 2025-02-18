'use client'

// MUI Imports
import { useParams } from 'next/navigation'

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
  Divider
} from '@mui/material'

import { useTranslation } from '@/utils/getDictionaryClient'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { getFullName } from '@/utils/globalFunctions'

const ProfileViewDialog = ({ open, setOpen, dialogProps }) => {
  const isLoading = !dialogProps || Object.keys(dialogProps).length === 0

  // console.log('dialogProps', dialogProps)

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => setOpen(false)}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      {!isLoading ? (
        <>
          <DialogTitle>
            <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
              <CustomAvatar
                src={dialogProps?.profileImage}
                alt={getFullName({ first_name: dialogProps?.first_name, last_name: dialogProps?.last_name })}
                size={120}
                skin='light'
                variant='rounded'
              />
              <Typography variant='h6' fontWeight='bold'>
                {`${dialogProps?.first_name} ${dialogProps?.last_name}`}
              </Typography>
              <Chip
                size='small'
                label={dialogProps?.role?.name}
                sx={{
                  backgroundColor: '#e8f5e9',
                  color: '#4caf50',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              {t('page.common.details')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant='body2' mb={1}>
              <strong>{t('page.staff_management.staff_card.name')}:</strong>{' '}
              {`${dialogProps?.first_name} ${dialogProps?.last_name}`}
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>{t('page.staff_management.staff_card.email')}:</strong> {dialogProps?.email}
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>{t('page.staff_management.staff_card.role')}:</strong> {dialogProps?.role?.name}
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>{t('page.staff_management.staff_card.phone_number')}:</strong> {dialogProps?.phoneNo}
            </Typography>
            <Typography variant='body2'>
              <strong>{t('page.staff_management.staff_card.address')}:</strong> {dialogProps?.location?.city || 'N/A'}
            </Typography>
          </DialogContent>
        </>
      ) : (
        <Box display='flex' justifyContent='center' alignItems='center' height='200px'>
          <CircularProgress className='ml-2' size={40} sx={{ color: 'primary.main' }} />
        </Box>
      )}
    </Dialog>
  )
}

export default ProfileViewDialog
