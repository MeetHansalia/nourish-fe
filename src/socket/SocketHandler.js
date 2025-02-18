'use client'

import { useEffect } from 'react'

import { getSession } from 'next-auth/react'
import { io } from 'socket.io-client'
import { useSelector, useDispatch } from 'react-redux'

import {
  reviewDialogState,
  setDialogData,
  setIsDialogShow,
  setIsDialogFromDeliveryPage
} from '@/redux-store/slices/reviewDialog'

const SocketHandler = () => {
  let socket = null
  const dispatch = useDispatch()
  const { isDialogShow } = useSelector(reviewDialogState)

  const initializeSocket = async () => {
    // Disconnect existing socket if it exists
    if (socket) {
      socket.disconnect()
      socket = null
    }

    try {
      const session = await getSession()

      if (!session || !session.user?._id) {
        return
      }

      // Initialize the socket connection
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        query: { userId: session.user._id }
      })

      // Ensure the socket instance is initialized before using it
      if (socket) {
        socket.on('connect', () => {
          console.log('Socket connect')
        })

        socket.on('disconnect', reason => { })

        socket.on('notificationUnreadCount', data => {
          console.log('notificationUnreadCount')
        })

        // socket.on('orderStatusUpdated', data => {
        //   console.log('data orderStatusUpdated', data)
        //   dispatch(setIsDialogShow(true))
        //   dispatch(setDialogData(data))
        // })
        socket.on('orderCompleted', data => {
          console.log('data orderCompleted', data)

          dispatch(setIsDialogFromDeliveryPage(true))
          dispatch(setDialogData(data))
        })

        socket.on('orderCompletedByVendor', data => {
          console.log('data orderCompletedByVendor', data)

          dispatch(setIsDialogShow(true))
          dispatch(setDialogData(data))
        })
      } else {
      }
    } catch (error) { }
  }

  useEffect(() => {
    // Initialize the socket on mount
    initializeSocket()

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  return null // No visible UI
}

export default SocketHandler
