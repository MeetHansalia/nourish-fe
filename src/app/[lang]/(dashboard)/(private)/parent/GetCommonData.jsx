'use client'
import { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { getKidsActions } from '@/redux-store/actions/globalAction'

const GetCommonData = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getKidsActions())
  }, [dispatch])

  return <>{children}</>
}

export default GetCommonData
