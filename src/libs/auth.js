// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@auth/prisma-adapter'
// import { PrismaClient } from '@prisma/client'

// Server Actions
import { getLangFromUrl } from '@/app/server/actions'

// const prisma = new PrismaClient()

export const authOptions = {
  // adapter: PrismaAdapter(prisma),

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        const { email, password } = credentials
        const lang = await getLangFromUrl()

        try {
          // ** Login API Call to match the user credentials and receive user data in response along with his role
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}v1/auth/loginWithPassword`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': lang
            },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          if (![200, 201].includes(res.status)) {
            throw new Error(JSON.stringify(data))
          }

          if ([200, 201].includes(res.status) && data?.response?.userData?.isEmailVerified === false) {
            throw new Error(JSON.stringify(data))
          }

          if (data?.response?.userData) {
            return { ...data?.response?.userData, access_token: data?.response?.access_token }
          }

          return null
        } catch (e) {
          throw new Error(e.message)
        }
      }
    }),

    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      id: 'credentials-otp',
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        // console.log('--------------------------> credentials-otp here')
        // console.log('credentials: ', credentials)

        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        const { email = null, otp = null } = credentials
        const lang = await getLangFromUrl()

        try {
          // ** Login API Call to match the user credentials and receive user data in response along with his role
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}v1/auth/verifyUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': lang
            },
            body: JSON.stringify({ email, otp: Number(otp) })
          })

          const data = await res.json()

          if (![200, 201].includes(res.status)) {
            throw new Error(JSON.stringify(data))
          }

          if (data?.response?.userData) {
            return { ...data?.response?.userData, access_token: data?.response?.access_token }
          }

          return null

          // return {
          //   user: data?.response?.userData,
          //   access_token: data.response?.access_token
          // }

          // if (res.status === 200) {
          //   /*
          //    * Please unset all the sensitive information of the user either from API response or before returning
          //    * user data below. Below return statement will set the user object in the token and the same is set in
          //    * the session which will be accessible all over the app.
          //    */
          //   return data
          // }

          // return null
        } catch (e) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.name = user.name

        /**
         * Custom data: added by Dev
         * Include access_token and user data for session callback
         */
        token.access_token = user.access_token
        token.user = user
      }

      if (trigger === 'update' && session?.user) {
        token.user = { ...token.user, ...session?.user }
      }

      if (trigger === 'update' && session?.userAccess) {
        token.user = { ...session?.userAccess?.user }
        token.access_token = session?.userAccess?.access_token

        // token.originalAuth = session?.userAccess?.originalAuth

        if (!token.originalAuth && session?.userAccess?.originalAuth) {
          token.originalAuth = session?.userAccess?.originalAuth
        } else if (
          token.originalAuth &&
          typeof session?.userAccess?.originalAuth !== 'undefined' &&
          !session?.userAccess?.originalAuth
        ) {
          token.originalAuth = undefined
        }
      }

      if (token?.user) {
        const userKeysToKeep = [
          '_id',
          'first_name',
          'last_name',
          'email',
          'phoneNo',
          'role',
          'isApproved',
          'status',
          'verificationStatus',
          'thresHoldApprove',
          'isEmailVerified',
          'approvedKids',
          'createdAt',
          'updatedAt'
        ]

        token.user = Object.fromEntries(Object.entries(token?.user)?.filter(([key]) => userKeysToKeep?.includes(key)))
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        session.user.name = token.name

        /**
         * Custom data: added by Dev
         * Include access_token and user data in the session object
         */
        session.access_token = token.access_token
        session.user = token.user

        if (token?.originalAuth) {
          session.originalAuth = token?.originalAuth
        }
      }

      return session
    }
  }
}
