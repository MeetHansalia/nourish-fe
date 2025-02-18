// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'

import { getKidsActions } from '../actions/globalAction'

// Constants
const initialState = {
  loading: false,
  cart: null,
  kidsData: null,
  error: null,
  orderId: ''
}

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = { ...state.cart, ...action.payload }
    },
    resetCart: (state, action) => {
      state.cart = null
    },
    setOrderId: (state, action) => {
      console.log('action.payload', action.payload)
      state.orderId = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getKidsActions.pending, state => {
        state.loading = true
      })
      .addCase(getKidsActions.fulfilled, (state, { payload }) => {
        state.loading = false
        state.kidsData = payload
      })
      .addCase(getKidsActions.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  }
})

export const { setCart, resetCart, setOrderId } = globalSlice.actions
export default globalSlice.reducer
export const globalState = state => state.global
