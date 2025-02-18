// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'

// Constants
const initialState = {
  isDialogShow: false,
  isDialogShowFromDeliveryPage: false,
  dialogData: null,
  isRefreshReviewList: false,
  isFromPendingApi: true,
  isCompleteOrderApiCall: false
}

export const reviewDialogSlice = createSlice({
  name: 'reviewDialog',
  initialState,
  reducers: {
    setIsDialogShow: (state, action) => {
      state.isDialogShow = action.payload
    },
    setIsDialogFromDeliveryPage: (state, action) => {
      console.log('action', state, action)
      state.isDialogShowFromDeliveryPage = action.payload
    },
    setDialogData: (state, action) => {
      state.dialogData = action.payload
    },
    setIsRefreshReviewList: (state, action) => {
      state.isRefreshReviewList = action.payload
    },
    setIsFromPendingApi: (state, action) => {
      state.isFromPendingApi = action.payload
    },
    setIsCompleteOrderApiCall: (state, action) => {
      state.isCompleteOrderApiCall = action.payload
    },
    resetDialogData: (state, action) => {
      state.isDialogShow = false
      state.dialogData = null
      state.isRefreshReviewList = false
      state.isFromPendingApi = true
      state.isDialogShowFromDeliveryPage = false
    }
  }
})

export const {
  setIsDialogShow,
  setDialogData,
  setIsDialogFromDeliveryPage,
  isDialogShowFromDeliveryPage,
  setIsRefreshReviewList,
  setIsFromPendingApi,
  resetDialogData,
  setIsCompleteOrderApiCall
} = reviewDialogSlice.actions
export default reviewDialogSlice.reducer
export const reviewDialogState = state => state.reviewDialog
