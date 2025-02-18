'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'
import { isCancel } from 'axios'

// MUI Imports
import { CircularProgress, Grid } from '@mui/material'

// Util Imports
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

/**
 * Page
 */
const ProfileManagement = ({ dictionary }) => {
  // Hooks
  const { user = null } = useSelector(profileState)

  // States
  const [userData, setUserData] = useState()
  const [isUserDataLoading, setIsUserDataLoading] = useState(true)

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
        <Grid container spacing={6}>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <Details dictionary={dictionary} userData={userData} />
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={8}>
            <EditDetails dictionary={dictionary} userData={userData} setUserData={setUserData} />
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
          <CircularProgress />
        </div>
      ) : (
        <div className='text-center'>No Data</div>
      )}

      <OpenDialogOnElementClick
        elementProps={{
          variant: 'outlined',
          color: 'primary'
        }}
        dialog={ProfileViewDialog}
        dialogProps={{ dictionary }}
      />

      {/* {isDataLoaded ? (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Details dictionary={dictionary} userData={userData} />
            </Grid>
            <Grid item xs={8}>
              <EditDetails dictionary={dictionary} userData={userData} setUserData={setUserData} />
            </Grid>
          </Grid>
          <MinimumThreshold dictionary={dictionary} userData={userData} />
          <UploadDocument dictionary={dictionary} userData={userData} />
          <PaymentMethod dictionary={dictionary} userData={userData} />
          <OpenDialogOnElementClick
            elementProps={{
              variant: 'outlined',
              color: 'primary'
            }}
            dialog={ProfileViewDialog}
          />
        </Box>
      ) : (
        <CircularProgress />
      )} */}
    </>
  )
}

export default ProfileManagement
