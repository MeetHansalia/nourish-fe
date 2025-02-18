export const statePanelUrlPermissions = {
  '/order-management': [
    {
      permission: 'order_management',
      subPermissions: ['order_tracking', 'change_order']
    }
  ],
  '/user-management': [
    {
      permission: 'user_management',
      subPermissions: ['get_users', 'create_user', 'get_suspend_users']
    }
  ],
  '/user-management/user-create': [
    {
      permission: 'user_management',
      subPermissions: ['create_user']
    }
  ],
  '/user-management/user-update/*': [
    {
      permission: 'user_management',
      subPermissions: ['update_user']
    }
  ],
  '/user-management/suspended-users': [
    {
      permission: 'user_management',
      subPermissions: ['get_suspend_users']
    }
  ]
}

export default statePanelUrlPermissions
