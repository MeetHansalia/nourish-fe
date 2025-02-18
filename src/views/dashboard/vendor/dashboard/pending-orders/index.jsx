'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imposts
import {
  Grid,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button
} from '@mui/material'

// Third-Party Imports
import { useInView } from 'react-intersection-observer'

// Component Imports
import OrdersCard from './OrdersCard'

// Utils Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastSuccess } from '@/utils/globalFunctions'

const PendingOrdersListing = ({ dictionary }) => {
  const [allOrdersList, setAllOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView({
    threshold: 1.0,
    delay: 500
  })

  const getAllPendingOrders = async page => {
    setLoading(true)
    await axiosApiCall
      .get(`${API_ROUTER.VENDOR_DASHBOARD.GET_PENDING_ORDERS}?page=${page}`)
      .then(response => {
        const newOrders = response?.data?.response || []

        setAllOrdersList(prev => [...prev, ...newOrders])
        setHasMore(newOrders.length > 0) // stop loder if no more data
        setLoading(false)

        const metaDatas = response?.data?.meta

        setRecordMetaData(metaDatas)
      })
      .catch(error => {
        console.error(error?.response?.message)
        setLoading(false)
      })
  }

  const handleCancelOrderApi = async () => {
    if (!selectedOrderId || !description.trim()) return

    await axiosApiCall
      .patch(API_ROUTER.VENDOR_DASHBOARD.CANCEL_ORDER_WITH_ID(selectedOrderId), { cancelOrderDescription: description })
      .then(response => {
        setDialogOpen(false)
        setDescription('')
        toastSuccess(response?.data?.message)
        setSelectedOrderId(null)

        const previousPage = recordMetaData?.currentPage || 1

        setPage(previousPage)
        getAllPendingOrders(previousPage)
      })
      .catch(error => {
        console.error(error?.response?.message)
        setDialogOpen(false)
      })
  }

  const handleOpenDialog = orderId => {
    setSelectedOrderId(orderId)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setDescription('')
    setSelectedOrderId(null)
  }

  useEffect(() => {
    getAllPendingOrders(page)
  }, [])

  // Fetch more data when inView changes
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1

      setPage(nextPage)
      getAllPendingOrders(nextPage)
    }
  }, [inView])

  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
      {allOrdersList.map((data, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <OrdersCard allOrdersListData={data} handleOpenDialog={handleOpenDialog} />
        </Grid>
      ))}

      {loading && <CircularProgress />}

      {/* Intersection Observer Element */}
      {hasMore && !loading && <div ref={ref} style={{ height: 1, width: '100%' }} />}

      {/* Dialog for cancel confirmation */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <TextField
            label='Cancellation Reason'
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            No
          </Button>
          <Button onClick={handleCancelOrderApi} color='primary' disabled={!description.trim()}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PendingOrdersListing
