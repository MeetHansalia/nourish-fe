'use client'

import React, { useEffect, useState } from 'react'

// Third-party imports
import { isCancel } from 'axios'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'

// Internal imports
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError, toastSuccess } from '@/utils/globalFunctions'
import TruncatedTextWithModal from '@/components/TruncatedTextWithModal'

const MenuNutritionSelection = ({ dictionary, vendorId }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [categories, setCategories] = useState([])
  const [allDishes, setAllDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const [openSuggestion, setOpenSuggestion] = useState(false)
  const [suggestionText, setSuggestionText] = useState('')

  const handleOpenSuggestion = () => {
    setOpenSuggestion(true)
  }

  const handleCloseSuggestion = () => {
    setOpenSuggestion(false)
    setSuggestionText('')
  }

  const handleSubmitSuggestion = () => {
    if (!suggestionText.trim()) {
      toastError('Suggestion cannot be empty')

      return
    }

    setIsFormSubmitLoading(true)

    const apiFormData = {
      vendor: vendorId,
      suggestion: suggestionText.trim()
    }

    axiosApiCall
      .post(API_ROUTER.ADMIN.POST_SUGGESTION_BOX, apiFormData)
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message || 'Suggestion submitted successfully')
      })
      .catch(error => {
        if (!isCancel(error)) {
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
      .finally(() => {
        setIsFormSubmitLoading(false)
        handleCloseSuggestion()
      })
  }

  useEffect(() => {
    axiosApiCall
      .get(API_ROUTER.PARENT.GET_PARENT_ALL_CATEGORIES, { params: vendorId })
      .then(response => {
        const fetchedCategories = response?.data?.response?.data?.categories || []
        const allFetchedDishes = fetchedCategories.flatMap(cat => cat.dishes || [])

        setCategories(fetchedCategories)
        setAllDishes(allFetchedDishes)
        setFilteredDishes(allFetchedDishes)

        if (fetchedCategories.length > 0) {
          setSelectedCategory(null)
        }

        setIsDataLoaded(true)
      })
      .catch(error => {
        setIsDataLoaded(true)
      })
  }, [vendorId])

  const handleSelectCategory = category => {
    setSelectedCategory(category)

    if (category) {
      setFilteredDishes(category.dishes || [])
    } else {
      setFilteredDishes(allDishes)
    }
  }

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <Typography variant='h5' className='font-bold'>
          {dictionary?.common?.MenuNutritionSelection}
        </Typography>
        <div className='flex items-center gap-4'>
          <TextField
            size='small'
            placeholder={dictionary?.common?.search}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <Button variant='contained' color='success' onClick={handleOpenSuggestion}>
            Suggestion
          </Button>
        </div>
      </div>

      <Card className='mb-4'>
        <CardContent className='flex gap-4 overflow-x-auto'>
          <div
            className={`cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 ${
              selectedCategory === null ? 'bg-green-100' : ''
            }`}
            onClick={() => handleSelectCategory(null)}
          >
            <Typography className='font-medium text-center'>{dictionary?.form?.label?.all}</Typography>
          </div>

          {categories.map(category => (
            <div
              key={category._id}
              className={`cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 ${
                selectedCategory?._id === category._id ? 'bg-green-100' : ''
              }`}
              onClick={() => handleSelectCategory(category)}
            >
              <img src={category.imageUrl} alt={category.name} className='w-12 h-12' />
              <Typography className='font-medium text-center'>{category.name}</Typography>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {filteredDishes.length > 0 ? (
              filteredDishes.map(dish => (
                <Grid item xs={12} sm={6} md={4} key={dish._id}>
                  <div className='border rounded-lg p-4 flex flex-col gap-2 relative cursor-pointer'>
                    <Tooltip title={`Ingredients: ${dish.ingredients.map(ing => ing.name).join(', ')}`} arrow>
                      <img
                        src={dish.image || 'https://via.placeholder.com/150'}
                        alt={dish.name}
                        className='w-full h-32 object-cover rounded-lg'
                      />
                    </Tooltip>
                    <Typography className='font-medium'>{dish.name}</Typography>
                    <TruncatedTextWithModal
                      id={dish._id}
                      title={dish.name}
                      text={dish.description}
                      wordLimit={20}
                      activeId={activeId}
                      setActiveId={setActiveId}
                    />
                    <Typography className='font-bold text-green-600'>${dish.pricing}</Typography>
                  </div>
                </Grid>
              ))
            ) : (
              <Typography variant='body1' color='textSecondary' className='text-center w-full'>
                {dictionary?.meal?.no_dishes_found}.
              </Typography>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Suggestion Dialog */}
      <Dialog open={openSuggestion} onClose={handleCloseSuggestion}>
        <DialogTitle>Suggestion</DialogTitle>
        <DialogContent>
          <TextField
            label='Suggestion Description'
            fullWidth
            multiline
            rows={4}
            value={suggestionText}
            onChange={e => setSuggestionText(e.target.value)}
            placeholder='Type Here'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmitSuggestion} color='success' variant='contained'>
            Submit
          </Button>
          <Button onClick={handleCloseSuggestion} color='success' variant='outlined'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default MenuNutritionSelection
