// Third-party Imports
import 'server-only'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  th: () => import('@/data/dictionaries/th.json').then(module => module.default),
  vi: () => import('@/data/dictionaries/vi.json').then(module => module.default),
  id: () => import('@/data/dictionaries/id.json').then(module => module.default),
  fil: () => import('@/data/dictionaries/fil.json').then(module => module.default)
}

export const getDictionary = async locale => dictionaries[locale]()
