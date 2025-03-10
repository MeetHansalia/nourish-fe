'use client'

import { useEffect } from 'react'

import { getSession } from 'next-auth/react'
import { io } from 'socket.io-client'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'


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
          console.log('data orderCompleted')
          dispatch(setIsDialogShow(true))
          dispatch(setDialogData(data))
        })

        socket.on('orderCompletedByVendor', data => {
          dispatch(setIsDialogFromDeliveryPage(true))
          dispatch(setDialogData(data))
        })

        socket.on('orderCancelRequest', message => {
          toast.success(`Vendor Alert: ${message.title}`)
        })

        socket.on('orderCreated', message => {
          // dispatch(setNotificationCount(1))
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })

        socket.on('suspendVendor', message => {
          toast.error(`Vendor Alert: ${message.title}`, {
            duration: 50000
          })
        })

        socket.on('userSuspended', message => {
          toast.error(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('requestStatus', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('schoolDocumentRequest', message => {
          toast.info(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('statusUpdated', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('newKidRequest', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })

        socket.on('orderDeliveryRejected', message => {
          toast.error(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('thresholdRequest', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('documentRequestStatus', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('thresholdRequestStatus', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('disputeRaised', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('disputeRespond', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
        })
        socket.on('createNewIssue', message => {
          toast.success(`${message.title}`, {
            duration: 50000
          })
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
