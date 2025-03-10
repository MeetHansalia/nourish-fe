'use client'

import { useEffect, useState } from 'react'

import { Avatar, Card, CardContent, List, ListItem, Typography, Box } from '@mui/material'

import NotificationDropdown from '@/components/NotificationsDropdown'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError } from '@/utils/globalFunctions'

export default function Notifications() {
  const [notificationData, setNotificationData] = useState(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [allRead, setAllRead] = useState(false)

  const [globalFilter, setGlobalFilter] = useState('')

  const getNotificationList = async () => {
    try {
      // const response = await axiosApiCall.get(API_ROUTER.NOTIFICATIONLIST)
      const response = await axiosApiCall.get(API_ROUTER.NOTIFICATIONLIST, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter
        }
      })

      const allOrders = response?.data?.response?.notifications || []

      setNotificationData(allOrders || 0)
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }
  }

  const readAllNotifications = async () => {
    try {
      // const response = await axiosApiCall.get(API_ROUTER.NOTIFICATIONLIST)
      const response = await axiosApiCall.patch(API_ROUTER.READALLNOTIFICATION)

      if (response?.data?.status) {
        setAllRead(true)
        getNotificationList()
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }
  }

  useEffect(() => {
    getNotificationList()
    readAllNotifications()
  }, [])

  return (
    <Box sx={{ maxWidth: '100%', margin: 'auto', mt: 4 }}>
      <Typography variant='h6' fontWeight='bold' gutterBottom>
        Notification
      </Typography>
      <Card>
        <CardContent>
          <List>
            {notificationData?.map(notification => (
              <ListItem
                key={notification.id}
                sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', py: 5 }}
              >
                {/* <Avatar src={notification.avatar} alt={notification.name} sx={{ width: 50, height: 50, mr: 2 }} /> */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {notification.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' noWrap>
                    {notification.title}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  {notification.createdAt}
                </Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
