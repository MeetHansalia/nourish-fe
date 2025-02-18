// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DocumentVerifyManagement from '@/views/dashboard/state/document-verify-management'

// Meta data
export const metadata = {
  title: 'Document Verification'
}

// Page
const DocumentVerifyPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <DocumentVerifyManagement dictionary={dictionary} />
    </div>
  )
}

export default DocumentVerifyPage
