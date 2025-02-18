/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      // {
      //   source: '/',
      //   destination: '/home',
      //   permanent: true,
      //   locale: false
      // }
      // {
      //   source: '/',
      //   destination: '/en/home',
      //   permanent: true,
      //   locale: false
      // },
      // {
      //   source: '/:lang(en|fr|ar)',
      //   destination: '/:lang/home',
      //   permanent: true,
      //   locale: false
      // },
      {
        source: '/',
        destination: '/en',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|th|vi|fil|id|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*', // Apply to all routes
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ]
      }
    ]
  }
}

export default nextConfig
