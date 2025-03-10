import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

import { getServerSession } from 'next-auth'

import { USER_PANELS } from '@/utils/constants'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'
import axiosApiCall from '@/utils/axiosApiCall'
import { PATH_DASHBOARD } from '@/utils/paths'

const VerticalMenuSuperAdmin = ({ dictionary, userRole, userPanel }) => {
  // Hooks
  const params = useParams()

  // Vars
  const { lang: locale } = params
  const { data: session } = useSession()

  // States
  const [user, setUser] = useState(getServerSession?.user)

  useEffect(() => {
    if (session?.user) {
      setUser(session?.user)
    }
  }, [session])

  // states
  // const [kidData, setKidData] = useState([])

  // useEffect(() => {
  //   axiosApiCall
  //     .get(`/v1/kids-dashboard`)
  //     .then(response => {
  //       setKidData(response?.data?.response?.userData)
  //     })
  //     .catch(error => {
  //       console.error('Error fetching roles:', error)
  //     })
  // }, [])
  // const hasApprovedVerification = kidData?.some(kid => kid?.verificationStatus === 'approved')

  const isUserProfileValid = user?.approvedKids?.length > 0 ? true : false

  const parentProfilePath = `/${locale}/${userPanel}/parent-profile`
  const kidProfilePath = `/${locale}/${userPanel}/kid-profile-management`
  const mealManagementPath = `/${locale}/${userPanel}/meal-selection`
  const reviewsPath = `/${locale}/${userPanel}/${PATH_DASHBOARD.parent.mealReview}`
  const issueReportingPath = `/${locale}/${userPanel}/issue-reporting`
  const orderTrakingPath = `/${locale}/${userPanel}/order-traking`

  return (
    <>
      <MenuItem
        href={`/${locale}/${userPanel}`}
        icon={<i className='tabler-layout-dashboard' />}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].dashboard}
      </MenuItem>

      {/* <MenuItem
        href={parentProfilePath}
        activeUrl={parentProfilePath}
        exactMatch={false}
        icon={<i className='tabler-user-cog' />}
      >
        {dictionary['navigation'].parents_profile}
      </MenuItem> */}

      <MenuItem
        href={kidProfilePath}
        activeUrl={kidProfilePath}
        exactMatch={false}
        icon={<i className='tabler-user-pentagon' />}
      >
        {dictionary['navigation'].kids_profile_management}
      </MenuItem>

      <MenuItem
        href={mealManagementPath}
        activeUrl={mealManagementPath}
        exactMatch={false}
        icon={<i className='tabler-file-description' />}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].meal_selection}
      </MenuItem>

      <MenuItem
        href={reviewsPath}
        activeUrl={reviewsPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
        icon={<i className='tabler-report-search' />}
      >
        {dictionary['navigation'].reviews_for_meals}
      </MenuItem>

      <MenuItem
        href={orderTrakingPath}
        activeUrl={orderTrakingPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
        icon={<i className='tabler-file-invoice' />}
      >
        {dictionary['navigation'].order_traking}
      </MenuItem>

      <MenuItem
        href={issueReportingPath}
        icon={<i className='tabler-device-imac-star' />}
        activeUrl={issueReportingPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].issue_reporting}
      </MenuItem>
    </>
  )
}

export default VerticalMenuSuperAdmin
