// -----temporary declaring here, move this to global components as this profile picture change modal will be same in all profile
// 'use client'
// import { useParams } from 'next/navigation'

// import {
//   Avatar,
//   Box,
//   Button,
//   CircularProgress,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   ListItem,
//   Typography
// } from '@mui/material'

// import { useTranslation } from 'react-i18next'

// import { AVATARS } from '@/utils/constants'

// import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
// import CustomAvatar from '@/@core/components/mui/Avatar'

// const UploadProfilePictureDialogBox = ({
//   open,
//   setOpen,
//   handleImageChange,
//   onSubmitFileUpload,
//   isUploading,
//   handleAvatarChange,
//   selectedAvatar,
//   isNewImageOrAvatarSelected,
//   userData,
//   existingImage
// }) => {
//   // Hooks
//   const { lang: locale } = useParams()
//   const { t } = useTranslation(locale)

//   return (
//     <Dialog
//       fullWidth
//       open={open}
//       onClose={() => !isUploading && setOpen(false)}
//       maxWidth='sm'
//       scroll='body'
//       sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
//     >
//       <DialogCloseButton onClick={() => !isUploading && setOpen(false)} disableRipple disabled={isUploading}>
//         <i className='tabler-x' />
//       </DialogCloseButton>
//       <>
//         <DialogTitle>
//           <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
//             <Typography variant='h6' fontWeight='bold'>
//               {t('common.upload_img')}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
//             {/* {preview && ( */}
//             <CustomAvatar
//               src={existingImage}
//               alt={`${userData?.first_name} ${userData?.last_name}`}
//               size={146}
//               skin='light'
//               variant='rounded'
//             />
//             {/* )} */}
//           </Box>
//           <ListItem className='text-center capitalize flex flex-col'>
//             <Box display='flex justify-center items-center' gap={1}>
//               {Object.entries(AVATARS).map(([avatarName, avatarUrl]) => (
//                 <Avatar
//                   key={avatarName}
//                   src={avatarUrl}
//                   alt={avatarName}
//                   sx={{ width: 40, height: 40, cursor: 'pointer' }}
//                   onClick={() => handleAvatarChange(avatarName, avatarUrl)}
//                   //   onChange={handleAvatarChange}
//                 />
//               ))}
//             </Box>
//             <Box>
//               <input
//                 accept='image/*'
//                 style={{ display: 'none' }}
//                 id='imageUpload'
//                 type='file'
//                 onChange={handleImageChange}
//                 disabled={isUploading}
//               />
//             </Box>
//           </ListItem>
//           <Box display='flex' justifyContent='center' p={2} gap={2}>
//             <label htmlFor='imageUpload'>
//               <Button variant='contained' color='primary' disabled={isUploading} component='span'>
//                 {t('common.upload_from_pc')}
//               </Button>
//             </label>
//             <Button
//               variant='contained'
//               color='primary'
//               onClick={() => {
//                 typeof selectedAvatar === 'string' ? setOpen(false) : onSubmitFileUpload(() => setOpen(false))
//               }}
//               disabled={isUploading || !isNewImageOrAvatarSelected}
//             >
//               {isUploading ? t('common.uploading') : t('form.button.save')}
//             </Button>
//           </Box>
//         </DialogContent>
//       </>
//     </Dialog>
//   )
// }

// export default UploadProfilePictureDialogBox
