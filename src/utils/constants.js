export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

const NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME

export const AUTHORIZATION_TOKEN_KEY_NAME = 'nourishubs-user-auth-token'
export const USER_ROLE_KEY_NAME = 'nourishubs-user-role'
export const USER_ID_KEY_NAME = 'nourishubs-user-id'
export const DEFAULT_ERROR_MESSAGE = 'Whoops, looks like something went wrong. Please try again!'

export const SITE_SEO_CONTENT = {
  socialPreviewTitle: NEXT_PUBLIC_APP_NAME,
  socialPreviewTitlePrefix: `${NEXT_PUBLIC_APP_NAME} |`,
  socialPreviewDescription:
    'Welcome to Nourishubs, where we offer healthy options for school meals. Join us in promoting nutritious meals for students and making healthy eating accessible for families.',
  socialPreviewKeywords: 'keywords, with, comma, separated, here',
  socialPreviewLogo: '/images/social-preview-logo.png'
}

export const SUPPORT_EMAIL_ADDRESS = 'info@nourishubs.com'
export const SUPPORT_PHONE_NUMBER = '+1 000-000-0000'

export const AOS_INIT_CONFIG_OPTIONS = {
  duration: 750, // Animation duration in milliseconds
  // offset: 200 // Offset from the original trigger point
  once: true // Whether animation should happen only once
}

// Avatar Images
export const AVATARS = {
  avatar_1: '/images/avatars/avatar_1.png',
  avatar_2: '/images/avatars/avatar_2.png',
  avatar_3: '/images/avatars/avatar_3.png',
  avatar_4: '/images/avatars/avatar_4.jpg',
  avatar_5: '/images/avatars/avatar_5.jpg'
}

export const USER_PANELS = {
  super_admin: 'super-admin',
  admin: 'admin',

  state: 'state',
  district: 'district',
  area: 'area',

  school: 'school',
  staff: 'staff',

  parent: 'parent',
  vendor: 'vendor'
}

export const USER_ROLE_TO_PANEL_MAPPING = {
  super_admin_role: USER_PANELS?.super_admin,
  admin_role: USER_PANELS?.admin,

  state_executive_role: USER_PANELS?.state,
  district_executive_role: USER_PANELS?.district,
  area_executive_role: USER_PANELS?.area,

  school_role: USER_PANELS?.school,
  teacher_role: USER_PANELS?.staff,
  school_otherers_role: USER_PANELS?.staff,

  parent_role: USER_PANELS?.parent,
  vendor_role: USER_PANELS?.vendor
}

export const PHONE_NUMBER_DEFAULT_COUNTRY_CODE = 'us'

export const ITEMS_PER_PAGE = 10
