// React Imports
import React, { useEffect, useState } from 'react'

// Mui Imports
import { Card, CardContent, Typography, IconButton, Avatar, Box, Button } from '@mui/material'

// Component Imports
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// View Imports
import ProfileViewDialog from './ProfileViewDialogBox'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { actionConfirmWithLoaderAlert, successAlert, toastError } from '@/utils/globalFunctions'
import { getInitials } from '@/utils/getInitials'

/**
 * Page
 */
const StaffCard = ({ name, role, email, userId, dictionary, setAllStaff }) => {
  const [staffDetails, setStaffDetails] = useState({})

  const fetchStaffDetails = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.STAFF_MANAGEMENT(userId))
      const staffDetails = response.data?.response?.userData

      setStaffDetails(staffDetails)
    } catch (error) {
      toastError('Error fetching staff details:', error)
    }
  }

  const handleDeleteClick = async () => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for activating user
         */
        deleteUrl: API_ROUTER.SCHOOL_ADMIN.STAFF_MANAGEMENT(userId),
        requestMethodType: 'DELETE',
        title: `${dictionary?.sweet_alert?.user_delete?.title}`,
        text: `${dictionary?.sweet_alert?.user_delete?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'active'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_delete?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          // getAllStaffMembers()
          setAllStaff(prevStaff => prevStaff.filter(staff => staff._id !== userId))
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.ok}`
          })
        }

        // getAllSuspendedUsers()
      }
    )
  }

  const buttonProps = {
    variant: 'text',
    children: <i className='tabler-eye text-textSecondary' />,
    onClick: fetchStaffDetails
  }

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '8px'
      }}
    >
      {/* Avatar */}
      {/* <Avatar
        // src='https://via.placeholder.com/50'
        alt='Staff Avatar'
        sx={{ width: 50, height: 50, marginRight: 2 }}
      /> */}
      <CustomAvatar size={40} color='primary' src={''} alt={name} className={'mr-2'}>
        {getInitials(name)}
      </CustomAvatar>

      {/* Card Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {dictionary?.form?.label?.role}: {role}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {dictionary?.form?.label?.email}: {email}
        </Typography>
      </Box>

      {/* action btns */}
      <Box>
        {/* <Button>view icon</Button> */}
        <OpenDialogOnElementClick
          // element={Button}
          element={IconButton}
          elementProps={buttonProps}
          dialog={ProfileViewDialog}
          dialogProps={staffDetails}
        />
        <IconButton onClick={() => handleDeleteClick()}>
          <i className='tabler-trash text-textSecondary' />
        </IconButton>
      </Box>
    </Card>
  )
}

export default StaffCard
