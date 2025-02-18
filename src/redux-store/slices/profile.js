// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'

// Constants
const initialState = {
  user: null
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    resetProfile: (state, action) => {
      state.user = null
    }
  }
})

export const { setProfile, resetProfile } = profileSlice.actions
export default profileSlice.reducer
export const profileState = state => state.profile
