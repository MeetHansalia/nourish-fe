import Image from 'next/image'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Meta data
export const metadata = {
  title: 'Profile'
}

// Page
const ProfilePage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <h1>Profile page!</h1>
    </div>
  )
}

export default ProfilePage
