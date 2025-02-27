import React, { useEffect, useState, useRef } from 'react'

import { Card, CardMedia, CardContent, Typography, Grid, Box, IconButton, CircularProgress } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'

import InfiniteScroll from 'react-infinite-scroll-component'

import axiosApiCall from '@/utils/axiosApiCall'

import { API_ROUTER } from '@/utils/apiRoutes'

import { toastError } from '@/utils/globalFunctions'

import TruncatedTextWithModal from '@/components/TruncatedTextWithModal'

const DishGrid = ({ dictionary = {}, getId = () => {} }) => {
  const [dishes, setDishes] = useState([])
  const [page, setPage] = useState(1)
  const [hasMoreDishes, setHasMoreDishes] = useState(true)
  const abortController = useRef(null)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    fetchDishes(1)

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])

  const fetchDishes = async pageNum => {
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()

    try {
      const response = await axiosApiCall.get(`${API_ROUTER.GET_FOOD_DISH}?page=${pageNum}`, {
        signal: abortController.current.signal
      })

      const newDishes = response?.data?.response?.dishes || []

      if (newDishes.length === 0) {
        setHasMoreDishes(false)
      } else {
        setDishes(prev => (pageNum === 1 ? newDishes : [...prev, ...newDishes]))
        setPage(pageNum + 1)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message)
      }
    }
  }

  const handleEditClick = id => {
    getId(id)
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3, backgroundColor: '#f5f5f5' }}>
      <InfiniteScroll
        dataLength={dishes.length}
        next={() => fetchDishes(page)}
        hasMore={hasMoreDishes}
        loader={
          <Box className='flex justify-center items-center h-[100px]'>
            <CircularProgress />
          </Box>
        }
        endMessage={
          <Box className='text-center p-2'>
            <b>{dictionary?.common?.no_more_data_to_load || 'No more dishes to load'}</b>
          </Box>
        }
      >
        <Grid container spacing={2}>
          {dishes.map(dish => (
            <Grid item xs={12} sm={6} md={4} key={dish._id}>
              <Card
                sx={{
                  display: 'flex',
                  padding: 1,
                  boxShadow: 2,
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    backgroundColor: '#ffffff',
                    boxShadow: 1
                  }}
                  size='small'
                  onClick={() => handleEditClick(dish._id)}
                >
                  <EditIcon fontSize='small' />
                </IconButton>

                <CardMedia
                  component='img'
                  sx={{ width: 120, height: 120, borderRadius: 2 }}
                  image={dish.image || 'https://via.placeholder.com/120'}
                  alt={dish.name}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant='h6' fontWeight='bold'>
                    {dish.name || dictionary.dishName || 'Dish Name'}
                  </Typography>
                  {/* <Typography variant='body2' color='textSecondary'>
                    <strong>{dictionary.description || 'Description'}:</strong> {dish.description || 'N/A'}
                  </Typography> */}
                  <TruncatedTextWithModal
                    id={dish._id}
                    title={dish.name}
                    text={dish.description}
                    wordLimit={20}
                    activeId={activeId}
                    setActiveId={setActiveId}
                  />

                  <Typography variant='body2' color='textSecondary'>
                    <strong>{dictionary.categories || 'Categories'}:</strong>{' '}
                    {dish?.categoryIds?.map(category => category.name).join(', ') || 'N/A'}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    <strong>{dictionary.ingredients || 'Ingredients'}:</strong>{' '}
                    {dish?.ingredients?.map(ingredient => ingredient.name).join(', ') || 'N/A'}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    <strong>{dictionary.price || 'Price'}:</strong> ${dish.pricing || 'N/A'}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    <strong>{dictionary.availability || 'Availability'}:</strong>{' '}
                    {dish.is_available ? dictionary.available || 'Available' : dictionary.unavailable || 'Unavailable'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Box>
  )
}

export default DishGrid
