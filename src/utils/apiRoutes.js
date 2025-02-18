export const API_ROUTER = {
  // get schools
  GET_SCHOOLS: `/v1/schools`,

  // get user profile
  GET_PROFILE: '/v1/users/profile',

  // update user profile
  UPDATE_PROFILE: '/v1/users/profile',

  // get countries
  GET_COUNTRIES: '/v1/countries',

  // get states
  GET_STATES: '/v1/states',

  // get district
  GET_DISTRICT: '/v1/districts',

  // roles
  ROLE: {
    GET_ROLE: '/v1/role',
    GET_ROLE_PERMISSION: id => `/v1/role/role-permissions/${id}`
  },

  // notification popups
  NOTIFICATIONS: {
    GET_NOTIFICATIONS: '/v1/usernotification',
    PATCH_NOTIFICATIONS: id => `/v1/usernotification/${id}`
  },

  // auth
  AUTH: {
    LOGIN: '/v1/auth/login',
    SIGN_UP: '/v1/auth/sign-up',
    OTP_VERIFY: 'credentials-otp',
    RESEND_OTP: '/v1/auth/resend',
    FORGET_PASSWORD: '/v1/auth/forgot-password',
    RESET_PASSWORD: '/v1/auth/reset-psw'
  },

  // super admin /user-management
  SUPER_ADMIN_USER: {
    ALL_USERS: '/v1/super-admin/user-management/all-users',
    CREATE_USER: '/v1/super-admin/user-management/create-user',
    SUSPENDED_USERS: '/v1/super-admin/user-management/suspended-users',
    STATISTIC: '/v1/super-admin-dashboard/statistics',

    // GET, PUT, PATCH, DELETE (PUT->suspend user, DELETE->delete user)
    SPECIFIC_USER_WITH_ID: id => `/v1/super-admin/user-management/${id}`,

    PATCH_ACTIVE_USER: id => `/v1/super-admin/user-management/${id}/status`,
    GET_ACCESS_USER: id => `/v1/super-admin/user-management/access-user/${id}`
  },

  // super admin /vendor-management
  SUPER_ADMIN_VENDOR: {
    VENDOR_LISTING: '/v1/super-admin/vendor-management',
    DOCUMENTS_LIST_FOR_VERIFICATION: '/v1/super-admin/vendor-management/documnets',
    DOC_APPROVE_REJECT: id => `/v1/super-admin/vendor-management/document/${id}`,
    VENDOR_THRESHOLD: '/v1/super-admin/vendor-management/threshold',
    SUSPEND_VENDOR: id => `/v1/super-admin/vendor-management/suspend/${id}`,
    VENDOR_DOC_APPROVE_REJECT: id => `/v1/super-admin/vendor-management/document-request/${id}`,
    VENDOR_THRESHOLD_REQ_BY_ID: id => `/v1/super-admin/vendor-managemnet/threshold-request/${id}`,
    VENDOR_BY_ID: id => `/v1/super-admin/vendor-management/${id}`,

    GET_STATISTIC: '/v1/super-admin/vendor-management/statistics'
  },

  // super admin /order-management
  SUPER_ADMIN_ORDER: {
    MINIMUM_THRESHOLD: '/v1/super-admin-order-management/threshold',
    MIN_THRESHOLD_APPROVE_REJECT: id => `/v1/super-admin-order-management/threshold-request/${id}`,
    GET_SCHOOLS: '/v1/super-admin-order-management/schools',
    GET_SCHOOL_ORDERS: id => `/v1/super-admin-order-management/get-school-orders/${id}`
  },

  // school /dashboard
  SCHOOL: {
    GET_PARENT_REQUESTS: '/v1/school-admin-dashboard/registration-requests',
    POST_APPROVE_REJECT_PARENT_REQUESTS: '/v1/school-admin-dashboard/update-request-status'
  },

  // school /foodchart
  SCHOOL_FOODCHART: {
    GET_FOODCHART_DATA: '/v1/school-admin-food-chart/get-foodchart-data',
    GET_FOODCHART_DATA_NEARBY: '/v1/school-admin-food-chart/nearby-vendors',
    POST_SCHOOL_ADMIN_FOODCHART: '/v1/school-admin-food-chart'
  },

  // vendor /dashboard
  VENDOR_DASHBOARD: {
    GET_PENDING_ORDERS: '/v1/vendor-orders/pending-order-list',
    CANCEL_ORDER_WITH_ID: id => `/v1/vendor-orders/cancle-order/${id}`
  },

  // district /school-vendor-verify
  DISTRICT: {
    // school document
    GET_SCHOOL_REGISTRATION_REQUESTS: '/v1/district-document-approval/school-document-requests',
    GET_SCHOOL_UPLOAD_DOC: id => `/v1/district-document-approval/school-document-request/${id}`,
    PATCH_APPROVE_REJECT_SCHOOL_DOCUMENT: '/v1/district-document-approval/school-document-requests',

    // vendor documents
    GET_VENDOR_DOCUMENTS: `/v1/district-document-approval/vendor-document-requests`,
    GET_SPECIFIC_DOCUMENT: id => `/v1/district-document-approval/vendor-document-request/${id}`,
    PATCH_APPROVE_REJECT_DOCUMENT: '/v1/district-document-approval/vendor-document-requests',

    // threshold
    GET_THRESHOLD_REQUESTS: '/v1/district-executive-order-management/threshold',
    APPROVE_REJECT_THRESHOLD_REQUEST: id => `/v1/district-executive-order-management/threshold-request/${id}`,
    GET_SCHOOLS: '/v1/district-executive-order-management/schools',
    GET_SCHOOL_ORDERS: id => `/v1/district-executive-order-management/get-school-orders/${id}`,

    // parent request for kid
    GET_PARENT_REGISTRATIN_KID: '/v1/district-document-approval/kids-registration-requests',
    UPDATE_KID_REGISTRATION_STATUS: '/v1/district-document-approval/update-kid-request-status',

    // food chart
    GET_FOOD_CHART: '/v1/distric-executive-foodchart',
    POST_FOOD_CHART: '/v1/distric-executive-foodchart',
    APPROVE_FOOD_CHART_CREATION: '/v1/distric-executive-foodchart/approve',
    GET_FOODCHART_DATA: '/v1/distric-executive-foodchart/get-foodchart-data',
    GET_NEAR_BY_VENDORS: 'v1/distric-executive-order-management/nearby-vendors',

    GET_STATISTIC: '/v1/district-executive-school-and-vendor-assosiate/statistics',

    GET_SUGGESTION_VENDOR_LIST: '/v1/vendor-orders/suggestions-on-menu',

    GET_DISTRICT_VENDOR_LIST: '/v1/area-executive-menu-suggestions/vendors',

    POST_SUGGESTION_BOX: '/v1/area-executive-menu-suggestions/create-menu-suggestions',

    GET_STATISTIC_DISTRICT: '/v1/district-executive-dashboard/statistics'
  },

  VENDOR: {
    GET_ALL_ORDERS: '/v1/vendor/order-management/all-orders',
    VENDOR_MIN_THRESHOLD: '/v1/vendor/request-threshold', //post
    VENDOR_UPLOAD_PROFILE: '/v1/vendor/upload-profile-image',
    VENDOR_UPLOAD_DOCUMENT: '/v1/vendor/upload-document',
    VENDOR_EDIT: '/v1/vendor/',
    GET_VENDOR_DETAILS: '/v1/vendor/details',

    //Vendor Dispute Management

    GET_DISPUTE_LIST: '/v1/dispute/dispute-list',
    DISPUTE_VENDOR_RESPONSE: '/v1/dispute/response',
    UPDATE_ORDER_STATUS: id => `/v1/vendor/order-management/${id}/status`,
    DOWNLOAD_ORDER_LIST: id => `/v1/vendor/order-management/${id}/download-csv`,

    STATISTICS: '/v1/vendor/order-management/statistics',
    GET_REGULAR_ORDERS: '/v1/vendor/order-management/get-regular-orders',
    GET_CANCELLED_ORDERS: '/v1/vendor/order-management/get-cancelled-orders',
    GET_EVENT_ORDERS: '/v1/vendor/order-management/get-event-orders',

    // UPDATE_ORDER_STATUS: id => `/v1/vendor/order-management/${id}/status`

    DISPUTE_VENDOR_RESPONSE: '/v1/dispute/response',

    GET_STATISTIC: '/v1/vendor-orders/statistics'
  },

  //Order Management Routes
  // SUPER_ADMIN_VENDOR_MANAGEMENT_THRESHOLD: '/v1/superadmin-vendormanagement/threshold',

  //Menu Management Routes
  UPDATE_FOOD_CATEGORY: '/v1/foodcategory',
  ADD_FOOD_CATEGORY: '/v1/foodcategory',
  GET_FOOD_CATEGORY: '/v1/foodcategory',
  DELETE_FOOD_CATEGORY: '/v1/foodcategory',
  DELETE_DISH_CATEGORY: '/v1/dish',
  DELETE_FOOD_MODIFIER: '/v1/modifier',
  ADD_FOOD_DISH: '/v1/dish',
  GET_FOOD_DISH: '/v1/dish',
  ADD_MODIFIER_DISH: '/v1/modifier',
  GET_MODIFIER_DISH: '/v1/modifier',

  // School Admin Dashboard
  SCHOOL_ADMIN_DASHBOARD: '/v1/school-admin-dashboard',
  SCHOOL_ADMIN: {
    GET_STATISTIC: '/v1/school-admin-dashboard/statistics',
    UPLOAD_PROFILE_IMAGE: '/v1/school-admin-dashboard/upload-profile-image',
    UPLOAD_DOCUMENT: '/v1/school-admin-dashboard/upload-document',
    // staff management
    STAFF_MANAGEMENT: id => (id ? `/v1/staff-management/${id}` : '/v1/staff-management'),

    GET_STATISTIC_DATA: '/v1/school-admin-order-management/statistics',

    SCHOOL_UPDATE_ORDER_STATUS: id => `/v1/school-admin-order-management/${id}/status`,

    GET_ORDER_DELIVERY_LIST: '/v1/school-admin-order-management/delivered-order-approval-list',

    GET_ALL_ORDERS: '/v1/school-admin-order-management/all-orders',
    TRAKING_ORDERS: '/v1/school-admin-order-management/traking-orders',
    GET_ALL_COMPLETE_ORDERS: '/v1/school-admin-order-management/complete-order-list',

    ADD_EVENT: '/v1/school-admin-order-management/add-event',
    ADD_TO_CART: id => `/v1/school-admin-order-management/add-to-cart/${id}`,
    UPDATE_CART: '/v1/school-admin-order-management/update-cart-items',
    PLACE_ORDER: '/v1/school-admin-order-management/place-order',
    GET_NEAR_BY_VENDORS: '/v1/school-admin-order-management/nearby-vendors',
    GET_CART_DETAILS: id => `/v1/school-admin-order-management/cart/${id}`,
    GET_ALL_CATEGORIES: id => `/v1/school-admin-order-management/get-all-categories?vendorId=${id}`,
    GET_CART_MODIFIER_DISH: id => `/v1/school-admin-order-management/cart-dish-details/${id}`,

    // order-management/event-order-request
    GET_ALL_EVENT_ORDER: '/v1/school-admin-order-management/all-event-orders',

    // order-management/minimum-threshold-of-vendor
    GET_MIN_THRESHOLDS_OF_VENDOR: '/v1/school-admin-order-management/threshold',
    REVIEW_MEAL: '/v1/school-admin-review-meal/create',
    VENDOR_LIST: '/v1/school-admin-order-management/complete-order-vendor-list',
    GET_PENDING_REVIEW_LIST: '/v1/school-admin-review-meal/get-pending-reviews',
    REVIEW_LATER: '/v1/school-admin-review-meal/review-later',
    ITEMS_BY_DISH: `/v1/school-admin-order-management/items-by-dish`
  },

  PARENT: {
    KID_DASHBOARD: '/v1/kids-dashboard',
    GET_KID_DASHBOARD: id => `/v1/kids-dashboard/${id}`,
    KID_DASHBOARD_CREATE: '/v1/kids-dashboard/create',
    KID_DASHBOARD_UPDATE: id => `/v1/kids-dashboard/update/${id}`,
    PAY_NOW: '/v1/parent-orders/place-order',
    PAY_NOW_WEEKLY: '/v1/parent-orders/place-multiple-order',
    TRAKING_ORDERS: '/v1/parent-orders/traking-orders',
    PARENT_DASHBOARD: '/v1/parent-dashboard',
    PARENT_DETAILS: '/v1/parent-dashboard/parent-details',
    PARENT_ADD_CART: '/v1/parent-meal-selection/add-to-cart',
    UPDATE_CART_QUANTITY: '/v1/parent-meal-selection/update-cart-items',
    REMOVE_CART_QUANTITY: '/v1/parent-meal-selection/remove-cart-items',
    GET_CART_DETAILS: id => `/v1/parent-meal-selection/cart/${id}`,

    GET_CART_MODIFIER_DISH: id => `/v1/parent-meal-selection/cart-dish-details/${id}`,
    GET_ALL_ORDERS: '/v1/parent-orders/complete-order-list',
    REVIEW_MEAL: '/v1/parent-review-meal/create',
    GET_AVAILABLE_VENDORS: '/v1/parent-meal-selection/get-available-vendors',
    GET_DATE_WISE_MENUS: '/v1/parent-meal-selection/get-day-wise-menus',
    GET_DATE_WISE_CART: id => `/v1/parent-meal-selection/cart-for-mltiple-order/${id}`,
    GET_PARENT_ALL_CATEGORIES: `/v1/parent-meal-selection/get-all-categories`,
    ITEMS_BY_DISH: `/v1/parent-meal-selection/items-by-dish`,
    GET_STATISTIC: '/v1/parent-dashboard/statistics',

    //Parent-Staff Issue Reporting
    ISSUE_REPORTING_COUNT: '/v1/issue-reporting/issueCount',
    GET_CHILDREN: '/v1/issue-reporting/kids',
    GET_STATIC_ISSUES: '/v1/issue-reporting/static-issues',
    GET_AVAILABLE_DATES: '/v1/issue-reporting/available-dates',
    GET_ISSUE_LIST: '/v1/issue-reporting/issue-list',
    ISSUE_CREATE: '/v1/issue-reporting/create',
    GET_STAFF_AVAILABLE_DATES: '/v1/issue-reporting/available-dates-for-staff',
    ISSUE_RESPONSE: '/v1/dispute/parent-staff/respond',
    VENDOR_LIST: '/v1/parent-orders/complete-order-vendor-list',
    GET_PENDING_REVIEW_LIST: '/v1/parent-review-meal/get-pending-reviews',
    REVIEW_LATER: '/v1/parent-review-meal/review-later'
  },
  STATE: {
    GET_KIDS_REGISTRATION_REQUESTS: '/v1/state-document-approval/kids-registration-requests',
    POST_APPROVE_REJECT_KID_REQUESTS: '/v1/state-document-approval/update-kid-request-status',
    GET_SCHOOL_REGISTRATION_REQUESTS: '/v1/state-document-approval/school-document-requests',
    GET_SCHOOL_UPLOAD_DOC: id => `/v1/state-document-approval/school-document-request/${id}`,
    POST_APPROVE_REJECT_SCHOOL_REQUESTS: '/v1/state-document-approval/school-document-requests',
    GET_VENDOR_REGISTRATION_REQUESTS: '/v1/state-document-approval/vendor-document-requests',
    PATCH_VENDOR_REGISTRATION_REQUESTS: '/v1/state-document-approval/vendor-document-requests',
    GET_VENDOR_UPLOADED_DOC: id => `/v1/state-document-approval/vendor-document-request/${id}`,
    GET_SCHOOL_LIST: '/v1/state-executive-school-and-vendor-assosiate/schools',
    GET_VENDOR_LIST: '/v1/state-executive-school-and-vendor-assosiate/vendors',
    GET_VENDOR_SCHOOL_LIST_BY_ID: id => `/v1/state-executive-school-and-vendor-assosiate/user/${id}`,
    UPDATE_SCHOOL: id => `/v1/state-executive-school-and-vendor-assosiate/update-school/${id}`,
    UPDATE_VENDOR: id => `/v1/state-executive-school-and-vendor-assosiate/update-vendor/${id}`,

    // threshold
    GET_THRESHOLD_REQUESTS: '/v1/state-executive-order-management/threshold',
    APPROVE_REJECT_THRESHOLD_REQUEST: id => `/v1/state-executive-order-management/threshold-request/${id}`,
    GET_SCHOOLS: '/v1/state-executive-order-management/schools',
    GET_SCHOOL_ORDERS: id => `/v1/state-executive-order-management/get-school-orders/${id}`,

    GET_VENDOR_UPLOADED_DOC: id => `/v1/state-document-approval/vendor-document-request/${id}`,

    GET_ALL_CANCEL_ORDER: `/v1/state-executive-order-management/all-cancle-orders`,
    GET_NEAR_BY_VENDOR: `/v1/state-executive-order-management/nearby-vendors`,
    APPROVE_REJECT_VENDOR_ORDER_REQUEST: id => `/v1/state-executive-order-management/cancle-order-request/${id}`,

    ADD_TO_CART: '/v1/state-executive-order-management/add-to-cart',
    GET_CART_DETAILS: id => `/v1/state-executive-order-management/cart/${id}`,

    GET_FOOD_CHART: '/v1/state-executive-foodchart',
    POST_FOOD_CHART: '/v1/state-executive-foodchart',
    GET_FOOD_CHART_DATA: '/v1/state-executive-foodchart/get-foodchart-data',
    APPROVE_FOOD_CHART_CREATION: '/v1/state-executive-foodchart/approve',
    GET_NEAR_BY_VENDORS: '/api/v1/state-executive-foodchart/nearby-vendors',

    STATISTIC: '/v1/state-executive-school-and-vendor-assosiate/statistics',
    GET_STATISTIC: '/v1/state-executive-dashboard/statistics',

    GET_LAST_MOMENT_STATISTIC: '/v1/state-executive-order-management/statistics'
  },
  STAFF: {
    REVIEW_MEAL: '/v1/staff-review-meal/create',
    GET_ALL_ORDERS: '/v1/staff-orders/complete-order-list',
    VENDOR_LIST: '/v1/staff-orders/complete-order-vendor-list',
    TRAKING_ORDERS: '/v1/staff-orders/traking-orders',
    GET_PENDING_REVIEW_LIST: '/v1/staff-review-meal/get-pending-reviews',
    REVIEW_LATER: '/v1/staff-review-meal/review-later',
    GET_DATE_WISE_MENUS: '/v1/staff-meal-selection/get-day-wise-menus',
    GET_AVAILABLE_VENDORS: '/v1/staff-meal-selection',
    GET_DATE_WISE_CART: id => `/v1/staff-meal-selection/cart-for-mltiple-order/${id}`,
    GET_ALL_CATEGORIES: `/v1/staff-meal-selection/get-all-categories`,
    ADD_CART: '/v1/staff-meal-selection/add-to-cart',
    GET_DATE_WISE_MENUS: '/v1/staff-meal-selection/get-day-wise-menus',
    UPDATE_CART_QUANTITY: '/v1/staff-meal-selection/update-cart-items',
    GET_CART_MODIFIER_DISH: id => `/v1/staff-meal-selection/cart-dish-details/${id}`,
    GET_CART_DETAILS: id => `/v1/staff-meal-selection/cart/${id}`,
    PAY_NOW: '/v1/staff-orders/place-order',
    PAY_NOW_WEEKLY: '/v1/staff-orders/place-multiple-order',
    REMOVE_CART_QUANTITY: '/v1/staff-meal-selection/remove-cart-items',
    // GET_SCHOOL_ORDERS: id => `/v1/staff-orders/get-school-orders/${id}`
    GET_SCHOOL_ORDERS: id => `/v1/staff-orders/get-school-orders/${id}`,
    GET_STATISTIC: '/v1/staff-dashboard/statistics',
    STAFF_REVIEW: '/v1/staff-review-meal',
    ITEMS_BY_DISH: `/v1/staff-meal-selection/items-by-dish`
  },

  CONTACT_US_INQUIRY_TABLE: '/v1/contactus',

  // Vendor Orders
  VENDOR_ORDERS_DATA: `/v1/vendor-orders/order-data`,

  ADMIN: {
    //Admin Dispute Management
    GET_PENDING_DISPUTE_LIST: '/v1/issue-reporting/authority-pending-issue-list',
    GET_WARNED_DISPUTE_LIST: '/v1/issue-reporting/authority-warned-issue-list',
    CREATE_DISPUTE: '/v1/dispute/create',
    GET_DISPUTE_COUNT: '/v1/dispute/disputeCount',
    SUSPEND_VENDOR: '/v1/issue-reporting/suspend',
    DISPUTE_RESPONSE: '/v1/dispute/authority/respond',
    MARK_AS_COMPLETE: '/v1/issue-reporting/markAsComplete',
    ISSUE_REPORTING_COUNT: '/v1/issue-reporting/issueCount',

    // vendor management
    GET_ALL_VENDOR: '/v1/admin/vendor-management',
    GET_SPECIFIC_VENDOR: id => `/v1/admin/vendor-management/${id}`,

    SUSPEND_VENDOR: id => `/v1/admin/vendor-management/suspend/${id}`,

    // threshold
    GET_THRESHOLD_REQUESTS: '/v1/admin-order-management/threshold',
    PATCH_THRESHOLD_REQUEST: id => `/v1/admin-order-management/threshold-request/${id}`,
    GET_SCHOOLS: '/v1/admin-order-management/schools',
    GET_SCHOOL_ORDERS: id => `/v1/admin-order-management/get-school-orders/${id}`,

    // vendor document
    GET_ALL_DOCUMENT: '/v1/admin/vendor-management/documnets',
    DOC_APPROVE_REJECT: id => `/v1/admin/vendor-management/document/${id}`,
    VENDOR_DOC_APPROVE_REJECT: id => `/v1/admin/vendor-management/document-request/${id}`,

    GET_STATISTIC: '/v1/admin/vendor-management/statistics',
    GET_STATISTIC_ADMIN: '/v1/admin-dashboard/statistics'
  },

  AREA_EXECUTIVE: {
    FOOD_CHART_CREATION: '/v1/area-executives-foodchart',
    APPROVE_FOOD_CHART_CREATION: '/v1/area-executives-foodchart/approve',
    POST_AREA_FOOD_CHART: '/v1/area-executives-foodchart',

    GET_FOODCHART_DATA: '/v1/area-executives-foodchart/get-foodchart-data',

    GET_NEAR_BY_VENDORS: '/v1/area-executives-foodchart/nearby-vendors',

    GET_SCHOOLS: '/v1/area-executive-order-management/schools',
    GET_SCHOOL_ORDERS: id => `/v1/area-executive-order-management/get-school-orders/${id}`,
    GET_STATISTIC: '/v1/area-executive-dashboard/statistics'
  },

  /**
   * Admin Panel Routes: Start
   */
  ADMIN_USER: {
    ALL_USERS: '/v1/admin/user-management/all-users',
    CREATE_USER: '/v1/admin/user-management/create-user',
    SUSPENDED_USERS: '/v1/admin/user-management/suspended-users',
    STATISTIC: '/v1/admin/user-management/statistics',

    // GET, PUT, PATCH, DELETE (PUT->suspend user, DELETE->delete user)
    SPECIFIC_USER_WITH_ID: id => `/v1/admin/user-management/${id}`,

    PATCH_ACTIVE_USER: id => `/v1/admin/user-management/${id}/status`,
    GET_ACCESS_USER: id => `/v1/admin/user-management/access-user/${id}`
  },
  /** Admin Panel Routes: End */

  /**
   * State Panel Routes: Start
   */
  STATE_USER: {
    ALL_USERS: '/v1/state-executive/user-management/all-users',
    CREATE_USER: '/v1/state-executive/user-management/create-user',
    SUSPENDED_USERS: '/v1/state-executive/user-management/suspended-users',
    STATISTIC: '/v1/state-executive/user-management/statistics',

    // GET, PUT, PATCH, DELETE (PUT->suspend user, DELETE->delete user)
    SPECIFIC_USER_WITH_ID: id => `/v1/state-executive/user-management/${id}`,

    PATCH_ACTIVE_USER: id => `/v1/state-executive/user-management/${id}/status`,
    GET_ACCESS_USER: id => `/v1/state-executive/user-management/access-user/${id}`
  },
  /** State Panel Routes: End */

  /**
   * State Panel Routes: Start
   */
  DISTRICT_USER: {
    ALL_USERS: '/v1/district-executive/user-management/all-users',
    CREATE_USER: '/v1/district-executive/user-management/create-user',
    SUSPENDED_USERS: '/v1/district-executive/user-management/suspended-users',
    STATISTIC: '/v1/district-executive/user-management/statistics',

    // GET, PUT, PATCH, DELETE (PUT->suspend user, DELETE->delete user)
    SPECIFIC_USER_WITH_ID: id => `/v1/district-executive/user-management/${id}`,

    PATCH_ACTIVE_USER: id => `/v1/district-executive/user-management/${id}/status`,
    GET_ACCESS_USER: id => `/v1/district-executive/user-management/access-user/${id}`
  }
  /** State Panel Routes: End */
}
