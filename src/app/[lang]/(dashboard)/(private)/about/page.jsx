import Image from 'next/image'

// Component Imports
import About from '@/views/dashboard/about'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Meta data
export const metadata = {
  title: 'About'
}

// Page
const AboutPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <h1>{dictionary['navigation']?.about} page!</h1>

      {/* <Image src='/images/nourishubs/front/1.png' width={500} height={500} alt='Picture of the author' /> */}
      {/* <div style={{ position: 'relative', width: '300px', height: '300px', borderWidth: '2px' }}>
        <Image
          src='/images/nourishubs/front/1.png'
          alt='Example image'
          layout='fill'
          objectFit='contain' // Adjust how the image scales (e.g., "contain", "cover", etc.)
          loading='lazy'
        />
      </div> */}

      {/* <div style={{ width: '300px', height: '300px', borderWidth: '2px' }}>
        <img
          src='/images/nourishubs/front/1.png'
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          alt='Picture of the author'
        />
      </div> */}
      {/* <img src='/images/nourishubs/front/1.png' alt='Picture of the author' /> */}
      <About />
    </div>
  )
}

export default AboutPage
