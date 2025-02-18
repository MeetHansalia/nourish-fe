// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'
import { USER_PANELS } from '@/utils/constants'

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

  const isTeacherProfile = user?.role === 'teacher_role' ? true : false

  return (
    <>
      <MenuItem href={`/${locale}/${userPanel}`} icon={<i className='tabler-layout-dashboard' />}>
        {dictionary['navigation'].dashboard}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${USER_PANELS?.staff}/meal-selection`}
        icon={<i className='tabler-info-circle' />}
        activeUrl={`/${locale}/${USER_PANELS?.staff}/meal-selection`}
        exactMatch={false}
      >
        {dictionary['navigation'].meal_selection}
      </MenuItem>

      {/* only teachers roles can see this routes */}
      {isTeacherProfile && (
        <>
          <MenuItem
            href={`/${locale}/${USER_PANELS?.staff}/meal-monitoring`}
            icon={<i className='tabler-info-circle' />}
            activeUrl={`/${locale}/${USER_PANELS?.staff}/meal-monitoring`}
            exactMatch={false}
            // disabled={!isTeacherProfile}
          >
            {/* {dictionary['navigation'].issue_reporting} */}
            Meal Monitoring
          </MenuItem>
          <MenuItem
            href={`/${locale}/${USER_PANELS?.staff}/order-tracking`}
            icon={<i className='tabler-info-circle' />}
            activeUrl={`/${locale}/${USER_PANELS?.staff}/order-tracking`}
            exactMatch={false}
            // disabled={!isTeacherProfile}
          >
            {/* {dictionary['navigation'].issue_reporting} */}
            Order Tracking
          </MenuItem>
          <MenuItem
            href={`/${locale}/${USER_PANELS?.staff}/nutritional-insights`}
            icon={<i className='tabler-info-circle' />}
            activeUrl={`/${locale}/${USER_PANELS?.staff}/nutritional-insights`}
            exactMatch={false}
            // disabled={!isTeacherProfile}
          >
            {/* {dictionary['navigation'].issue_reporting} */}
            Nutritional Insights
          </MenuItem>
        </>
      )}

      <MenuItem
        href={`/${locale}/${USER_PANELS?.staff}/issue-reporting`}
        icon={<i className='tabler-info-circle' />}
        activeUrl={`/${locale}/${USER_PANELS?.staff}/issue-reporting`}
        exactMatch={false}
      >
        {dictionary['navigation'].issue_reporting}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${USER_PANELS?.staff}/feedback`}
        icon={<i className='tabler-info-circle' />}
        activeUrl={`/${locale}/${USER_PANELS?.staff}/feedback`}
        exactMatch={false}
      >
        {dictionary['navigation'].feedback}
      </MenuItem>
    </>
  )
}

export default VerticalMenuSuperAdmin
