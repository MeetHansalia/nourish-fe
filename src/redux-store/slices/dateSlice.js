import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedDates: [],
  singleDate: null
}

const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {
    setDates: (state, action) => {
      state.selectedDates = action.payload // Store the formatted 14-day date range
    },
    clearDates: state => {
      state.selectedDates = [] // Clear the stored dates
    },
    getSingleDate: (state, action) => {
      state.singleDate = action.payload // Store a single selected date
    }
  }
})

export const { setDates, clearDates, getSingleDate } = dateSlice.actions

export default dateSlice.reducer
