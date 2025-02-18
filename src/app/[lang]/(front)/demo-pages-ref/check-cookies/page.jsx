// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Component Imports
import CheckCookies from '@views/demo-pages-ref/CheckCookies'

// Meta data
export const metadata = {
  title: 'Check Cookies'
}

// Page
const Page = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  console.log('123--->>>>> ', dictionary?.navigation?.home)

  return (
    <div>
      <h1>Check Cookies</h1>
      <CheckCookies />
    </div>
  )
}

export default Page
