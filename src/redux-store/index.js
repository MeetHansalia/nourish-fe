import { configureStore, combineReducers } from '@reduxjs/toolkit'

// import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'

// import dateReducer from './dateSlice'
import dateSlice from '@/redux-store/slices/dateSlice'

import profileReducer from '@/redux-store/slices/profile'

import globalReducer from '@/redux-store/slices/global'

import reviewDialogReducer from '@/redux-store/slices/reviewDialog'

import storage from '@/utils/storage'

const baseReducer = combineReducers({
  date: dateSlice,
  profile: profileReducer,
  global: globalReducer,
  reviewDialog: reviewDialogReducer
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['profile', 'global', 'reviewDialog', 'date']
}

const persistedReducer = persistReducer(persistConfig, baseReducer)

export const store = configureStore({
  reducer: persistedReducer,

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export const persistor = persistStore(store)
