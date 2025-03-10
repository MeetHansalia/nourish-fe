// Next Imports
import { useParams } from 'next/navigation'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'

const VerticalMenuSuperAdmin = ({ dictionary, userRole, userPanel }) => {
  // Hooks
  const params = useParams()

  // Vars
  const { lang: locale } = params

  return (
    <>
      <MenuItem href={`/${locale}/${userPanel}`} icon={<i className='tabler-layout-dashboard' />}>
        {dictionary['navigation'].dashboard}
      </MenuItem>
      {/* <MenuItem href={`/${locale}/${userPanel}`} icon={<i className='tabler-layout-dashboard' />}>
        Super Admin {dictionary['navigation'].dashboard} 2
      </MenuItem> */}
      <MenuItem
        href={`/${locale}/${userPanel}/user-management`}
        icon={<i className='tabler-user' />}
        activeUrl={`/${locale}/${userPanel}/user-management`}
        exactMatch={false}
      >
        {dictionary['navigation'].user_management}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/vendor-management`}
        icon={<i className='tabler-clipboard-text' />}
        activeUrl={`/${locale}/${userPanel}/vendor-management`}
        exactMatch={false}
      >
        {dictionary['navigation'].vendor_management}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/order-management`}
        exactMatch={false}
        activeUrl={`/${locale}/${userPanel}/order-management`}
        icon={<i className='tabler-device-desktop-analytics' />}
      >
        {dictionary['navigation'].order_management}
      </MenuItem>
      <MenuItem href={`/${locale}/${userPanel}/dispute-management`} icon={<i className='tabler-alert-circle' />}>
        {dictionary['navigation'].dispute_resolution}
      </MenuItem>

      <MenuItem href={`/${locale}/${userPanel}/order-reviews`} icon={<i className='tabler-star' />}>
        {dictionary['navigation'].review}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/menu-nutrition-manage`}
        icon={<i className='tabler-salad' />}
        activeUrl={`/${locale}/${userPanel}/menu-nutrition-manage`}
        exactMatch={false}
      >
        {dictionary['navigation'].menu_nutrition_manage}
      </MenuItem>
    </>
  )
}

export default VerticalMenuSuperAdmin
