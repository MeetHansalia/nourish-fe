// Next Imports
import { headers } from 'next/headers'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Component Imports

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

// Nourishubs custom style
import '@/styles/nourishubs-style.scss'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// import const
import { SITE_SEO_CONTENT } from '@utils/constants'

// env variables
const NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL

export const metadata = {
  // title: 'Vuexy - MUI Next.js Admin Dashboard Template',
  // description: 'Vuexy - MUI Next.js Admin Dashboard Template - is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.'

  /**
   * Title and Description
   */
  title: {
    template: `${NEXT_PUBLIC_APP_NAME} | %s`,
    default: NEXT_PUBLIC_APP_NAME
  },
  description: SITE_SEO_CONTENT?.socialPreviewDescription || '',

  /**
   * Meta Config
   */
  metadataBase: new URL(NEXT_PUBLIC_APP_URL),

  /**
   * Favicon
   */
  icons: {
    icon: [
      { url: '/images/favicon/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/images/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', type: 'image/x-icon' }
    ],
    shortcut: ['/images/favicon/favicon.ico'],
    apple: [{ url: '/images/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },

  appleWebApp: {
    title: 'Nourishubs'
  },
  manifest: '/images/favicon/site.webmanifest',

  /**
   * Keywords
   */
  keywords: SITE_SEO_CONTENT?.socialPreviewKeywords,

  /**
   * Facebook
   */
  openGraph: {
    // description: SITE_SEO_CONTENT?.socialPreviewDescription,
    images: [SITE_SEO_CONTENT?.socialPreviewLogo],
    type: 'website'
  },

  /**
   * Twitter
   */
  twitter: {
    // description: SITE_SEO_CONTENT?.socialPreviewDescription,
    images: [SITE_SEO_CONTENT?.socialPreviewLogo],
    card: 'summary_large_image'
  },

  /**
   * Other
   */
  other: {
    'mobile-web-app-capable': 'yes'
  }
}

/**
 * Theme Color
 */
export const viewport = {
  themeColor: '#006838'
}

const RootLayout = ({ children, params }) => {
  // Vars
  const headersList = headers()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction}>
        {/* <head>
          <link
            href='https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Oooh+Baby&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
            rel='stylesheet'
          />
        </head> */}
        <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
