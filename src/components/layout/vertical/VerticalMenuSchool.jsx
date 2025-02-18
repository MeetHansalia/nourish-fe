// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'
import { PATH_DASHBOARD } from '@/utils/paths'

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

  const isUserProfileValid = user?.verificationStatus === 'approved' ? true : false

  const foodChartCreationPath = `/${locale}/${userPanel}/food-chart-creation`
  const staffManagementPath = `/${locale}/${userPanel}/staff-management`
  const feedbackPath = `/${locale}/${userPanel}/feedback`
  const orderTrakingPath = `/${locale}/${userPanel}/order-traking`

  const orderManagementPath = `/${locale}/${userPanel}/${PATH_DASHBOARD.school.orders.root}`

  return (
    <>
      <MenuItem
        href={`/${locale}/${userPanel}`}
        icon={<i className='tabler-layout-dashboard' />}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].dashboard}
      </MenuItem>
      <MenuItem
        href={foodChartCreationPath}
        icon={<i className='tabler-user' />}
        activeUrl={foodChartCreationPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].food_chart_creation}
      </MenuItem>
      <MenuItem
        href={staffManagementPath}
        icon={<i className='tabler-user' />}
        activeUrl={staffManagementPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].add_staff}
      </MenuItem>
      <MenuItem
        href={orderManagementPath}
        icon={<i className='tabler-user' />}
        activeUrl={orderManagementPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].order_management}
      </MenuItem>
      <MenuItem
        href={feedbackPath}
        icon={<i className='tabler-info-circle' />}
        activeUrl={feedbackPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].feedback}
      </MenuItem>
      <MenuItem
        href={orderTrakingPath}
        icon={<i className='tabler-user' />}
        activeUrl={orderTrakingPath}
        exactMatch={false}
        disabled={!isUserProfileValid}
      >
        {dictionary['navigation'].order_traking}
      </MenuItem>
      {/* {JSON.stringify({ verificationStatus2: user?.verificationStatus || '' })} */}
    </>
  )
}

export default VerticalMenuSuperAdmin
