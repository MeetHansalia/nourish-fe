import { createAsyncThunk } from '@reduxjs/toolkit'

import { getAllKidsService } from '../services/globalServices'

export const getKidsActions = createAsyncThunk('global/getKidsActions', async (_, { rejectWithValue }) => {
  try {
    const { data } = await getAllKidsService()

    return data?.response?.kidData || []
  } catch (err) {
    console.error('getKidsActions ~ err:', err)

    return rejectWithValue(err?.message)
  }
})
