// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'

const VerticalMenuSuperAdmin = ({ dictionary, userRole, userPanel, serverSession }) => {
  // Hooks
  const params = useParams()
  const { data: session } = useSession()

  // Vars
  const { lang: locale } = params

  // States
  const [user, setUser] = useState(serverSession?.user)

  useEffect(() => {
    if (session?.user) {
      setUser(session?.user)
    }
  }, [session])

  const isUserProfileValid =
    user?.verificationStatus === 'approved' && user?.thresHoldApprove === 'approved' && user?.status === 'active'
      ? true
      : false

  const disputeResolutionPath = `/${locale}/${userPanel}/dispute-management`
  // const notificationListPath = `/${locale}/${userPanel}/notifications`

  const orderManagementPath = `/${locale}/${userPanel}/order-management`

  return (
    <>
      <MenuItem
        disabled={!isUserProfileValid}
        href={`/${locale}/${userPanel}`}
        activeUrl={`/${locale}/${userPanel}`}
        // exactMatch={false}
        icon={<i className='tabler-layout-dashboard' />}
      >
        {dictionary['navigation'].dashboard}
      </MenuItem>
      <MenuItem
        disabled={!isUserProfileValid}
        href={`/${locale}/${userPanel}/menu-management`}
        // exactMatch={false}
        icon={<i className='tabler-user' />}
      >
        {dictionary['navigation'].menu_management}
      </MenuItem>
      {/* <MenuItem
        disabled={!isUserProfileValid}
        href={`/${locale}/${userPanel}/profile-management`}
        icon={<i className='tabler-user' />}
      >
        {dictionary['navigation'].profile_management}
      </MenuItem> */}
      <MenuItem
        disabled={!isUserProfileValid}
        href={orderManagementPath}
        activeUrl={orderManagementPath}
        icon={<i className='tabler-user' />}
      >
        {dictionary['navigation'].order_management}
      </MenuItem>
      <MenuItem href={`/${locale}/${userPanel}/order-reviews`} icon={<i className='tabler-star' />}>
        {dictionary['navigation'].review}
      </MenuItem>
      <MenuItem
        href={disputeResolutionPath}
        icon={<i className='tabler-info-circle' />}
        activeUrl={disputeResolutionPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].dispute_resolution}
      </MenuItem>

      {/* <MenuItem
        href={notificationListPath}
        icon={<i className='tabler-info-circle' />}
        activeUrl={notificationListPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].notifications}
      </MenuItem> */}
    </>
  )
}

export default VerticalMenuSuperAdmin
