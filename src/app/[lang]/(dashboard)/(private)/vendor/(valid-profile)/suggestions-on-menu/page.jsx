// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import SuggestionsOnMenu from '@/views/dashboard/vendor/dashboard/suggestions-on-menu'

const SuggestionsMenu = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <SuggestionsOnMenu dictionary={dictionary} />
    </>
  )
}

export default SuggestionsMenu
