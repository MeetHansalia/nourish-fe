'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'
import { isCancel } from 'axios'

// MUI Imports
import { Grid } from '@mui/material'

// Util Imports

// import { useSession } from 'next-auth/react'

import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import Details from './Details'
import EditDetails from './EditDetails'
import MinimumThreshold from './MinimumThreshold'
import UploadDocument from './UploadDocument'
import ProfileViewDialog from './ProfileViewDialogBox'
import PaymentMethod from './PaymentMethod'

// Component imports
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'
import FullPageLoader from '@/components/FullPageLoader'

/**
 * Page
 */
const ProfileManagement = ({ dictionary }) => {
  // Hooks
  const { user = null } = useSelector(profileState)

  // States
  const [userData, setUserData] = useState()
  const [isUserDataLoading, setIsUserDataLoading] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  useEffect(() => {
    if (user?._id) {
      axiosApiCall
        .get(API_ROUTER.VENDOR.GET_VENDOR_DETAILS)
        .then(response => {
          setUserData(response?.data?.response?.userData)
          setIsUserDataLoading(false)
        })
        .catch(error => {
          if (!isCancel(error)) {
            console.error('Error fetching roles:', error)
            setIsUserDataLoading(false)
          }
        })
    }
  }, [user?._id])

  return (
    <>
      {userData ? (
        <Grid container spacing={6} className='profile-block'>
          <Grid item xs={12} sm={12} md={4}>
            <Details
              dictionary={dictionary}
              userData={userData}
              setSelectedAvatar={setSelectedAvatar}
              selectedAvatar={selectedAvatar}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={8} key={selectedAvatar}>
            <EditDetails
              dictionary={dictionary}
              userData={userData}
              setUserData={setUserData}
              selectedAvatar={selectedAvatar}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <MinimumThreshold dictionary={dictionary} userData={userData} />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <UploadDocument dictionary={dictionary} userData={userData} />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <PaymentMethod dictionary={dictionary} userData={userData} />
          </Grid>
        </Grid>
      ) : isUserDataLoading ? (
        <div className='text-center'>
          <FullPageLoader open={true} color='primary' spinnerSize={60} />
        </div>
      ) : (
        <div className='text-center'>No Data</div>
      )}
      {!user?.status === 'suspended' && (
        <OpenDialogOnElementClick
          elementProps={{
            variant: 'outlined',
            color: 'primary'
          }}
          dialog={ProfileViewDialog}
          dialogProps={{ dictionary }}
        />
      )}
      {user?.status === 'suspended' && (
        <OpenDialogOnElementClick
          elementProps={{
            variant: 'outlined',
            color: 'primary'
          }}
          dialog={ProfileViewDialog}
          dialogProps={{ dictionary, suspendStart: user?.suspendStartDate, suspendEnd: user?.suspendEndDate }}
        />
      )}
    </>
  )
}

export default ProfileManagement
