'use client'

import React, { useEffect, useState } from 'react' // React imports

import { useParams, usePathname, useRouter } from 'next/navigation'

import { useSelector } from 'react-redux'
// Third-party libraries
import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

import { useForm, Controller } from 'react-hook-form'

import { getSession } from 'next-auth/react'

import { parse, format } from 'date-fns'

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
  Checkbox,
  FormControlLabel,
  Button,
  Tabs,
  Tab,
  Box,
  DialogActions,
  IconButton
} from '@mui/material'

import { Add, Remove, Close as CloseIcon } from '@mui/icons-material'

import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'

import SpeedometerChart from '@/components/nourishubs/GaugeChart'

import { useTranslation } from '@/utils/getDictionaryClient'
import { getLocalizedUrl } from '@/utils/i18n'
import { getPanelName } from '@/utils/globalFunctions'

// Validation Schema
const validationSchema = selectedDish =>
  yup.object().shape({
    modifiers: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required('Modifier name is required'),
          requireCustomerToSelectDish: yup.boolean(),
          what_the_maximum_amount_of_item_customer_can_select: yup.boolean(),
          max_selection: yup.number().nullable(),
          required_rule: yup.string().oneOf(['atleast', 'exactly', 'maximum']).required(),
          quantity: yup.number().required('Quantity is required'),
          dishIds: yup
            .array()
            .of(
              yup.object().shape({
                selected: yup.boolean().required()
              })
            )
            .test('dish-selection', 'Validation failed based on conditions', function (dishIds) {
              const {
                requireCustomerToSelectDish,
                required_rule,
                quantity,
                max_selection,
                what_the_maximum_amount_of_item_customer_can_select
              } = this.parent

              const selectedCount = dishIds.filter(dish => dish.selected).length

              if (what_the_maximum_amount_of_item_customer_can_select && max_selection) {
                if (selectedCount > max_selection) {
                  return this.createError({
                    message: `You can select a maximum of ${max_selection} dish(es).`
                  })
                }
              }

              if (requireCustomerToSelectDish) {
                if (required_rule === 'atleast' && selectedCount < quantity) {
                  return this.createError({
                    message: `You must select at least ${quantity} dish(es).`
                  })
                }

                if (required_rule === 'exactly' && selectedCount !== quantity) {
                  return this.createError({
                    message: `You must select exactly ${quantity} dish(es).`
                  })
                }

                if (required_rule === 'maximum' && selectedCount > quantity) {
                  return this.createError({
                    message: `You can select a maximum of ${quantity} dish(es).`
                  })
                }
              }

              return true
            })
        })
      )
      .test('modifiers-required', 'At least one modifier is required', function (modifiers) {
        // ✅ Skip validation if selectedDish?.modifierIds is empty
        if (!selectedDish?.modifierIds || selectedDish?.modifierIds.length === 0) {
          return true
        }
        // ✅ Enforce at least one modifier if modifiers array is empty

        return modifiers && modifiers.length > 0
      })
  })

const WeeklyMenuSelection = ({ dictionary, kidId }) => {
  console.log('🚀 ~ WeeklyMenuSelection ~ kidId:', kidId)
  const router = useRouter()
  const moment = require('moment')
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const { t } = useTranslation(locale)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [validationError, setValidationError] = useState(false)
  const [categories, setCategories] = useState([])
  const [allDishes, setAllDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedModifierIds, setSelectedModifierIds] = useState([])
  const selectedDates = useSelector(state => state.date.selectedDates)
  const [fetchAllDishes, setFetchAllDishes] = useState({})
  const [vendorId, setVendorId] = useState(null)
  const [currentDate, setCurrentDate] = useState(null)

  const [selectedDay, setSelectedDay] = useState(0)

  const [cartData, setCartData] = useState([])

  const handleChange = (event, newValue) => {
    let selectedDate = selectedDates[newValue]

    const parsedSelectedDate = parse(selectedDate, 'dd-MMM-EEE', new Date())

    // Format in UTC with the required format
    selectedDate = format(parsedSelectedDate, 'yyyy-MM-dd')
    setCurrentDate(selectedDate)
    setVendorId(fetchAllDishes[selectedDate]?.vendorId)
    const fetchedCategoriesSelect = fetchAllDishes[selectedDate]?.categories || []
    const allFetchedDishesSelect = fetchedCategoriesSelect.flatMap(cat => cat.dishes || [])

    setCategories(fetchedCategoriesSelect)
    setAllDishes(allFetchedDishesSelect)
    setFilteredDishes(allFetchedDishesSelect)

    if (fetchedCategoriesSelect.length > 0) {
      setSelectedCategory(null)
    }

    setSelectedDay(newValue)
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({
    resolver: yupResolver(validationSchema(selectedDish)), // ✅ Pass selectedDish
    defaultValues: {
      modifiers: []
    }
  })

  const handleOrderNow = kidId => {
    if ((cartData?.length || 0) > 0) {
      router.push(getLocalizedUrl(`${getPanelName(pathname)}/meal-selection/${kidId}/weekly-checkout`, locale))
    }
  }

  useEffect(() => {
    const firstDate = selectedDates[0]
    const lastDate = selectedDates[selectedDates.length - 1]

    // Convert to Date objects (assuming format is "dd-MMM-EEE")
    const parsedFirstDate = parse(firstDate, 'dd-MMM-EEE', new Date())
    const parsedLastDate = parse(lastDate, 'dd-MMM-EEE', new Date())

    // Format in UTC with the required format
    const startDate = format(parsedFirstDate, 'yyyy-MM-dd')
    const endDate = format(parsedLastDate, 'yyyy-MM-dd')
    const start = format(parsedFirstDate, 'yyyy-MM-dd')

    axiosApiCall
      .get(API_ROUTER.PARENT.GET_DATE_WISE_MENUS, {
        params: {
          startDate: startDate,
          endDate: endDate,
          kidId: kidId
        }
      })
      .then(response => {
        setFetchAllDishes(response?.data?.response || [])
        setVendorId(response?.data?.response[start]?.vendorId)
        setCurrentDate(start)
        const fetchedCategories = response?.data?.response[start]?.categories || []
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
  }, [])

  useEffect(() => {
    if (selectedDish) {
      reset({
        modifiers:
          selectedDish?.modifierIds?.map(modifier => ({
            name: modifier.name,
            requireCustomerToSelectDish: modifier.requireCustomerToSelectDish || false,
            what_the_maximum_amount_of_item_customer_can_select:
              modifier.what_the_maximum_amount_of_item_customer_can_select || false,
            max_selection: modifier.max_selection || null,
            required_rule: modifier.required_rule || 'atleast',
            quantity: modifier.quantity || 1,
            dishIds:
              modifier.dishIds?.map(dish => ({
                selected: false
              })) || []
          })) || []
      })
    }
  }, [selectedDish, reset])

  const handleSelectCategory = category => {
    setSelectedCategory(category)

    if (category) {
      setFilteredDishes(category.dishes || [])
    } else {
      setFilteredDishes(allDishes)
    }
  }

  const handleAddToCart = dish => {
    setCart(prevCart => [...prevCart, dish])
  }

  const handleDialogOpen = dish => {
    setSelectedDish(dish)
    setTotalPrice(dish?.pricing)
    setValidationError(false)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setValidationError(false)
    reset()
    setTotalPrice(0)
    setSelectedDish(null)
    setSelectedModifierIds([])
    setDialogOpen(false)
  }

  const fetchLatestCartDetails = async kidId => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.PARENT.GET_DATE_WISE_CART(kidId))

      setCartData(response?.data || [])
    } catch (error) {
      console.error('Error fetching updated cart:', error)
    }
  }

  useEffect(() => {
    if (kidId) {
      fetchLatestCartDetails(kidId)
    }
  }, [kidId])

  const dishTotal = (isSelected, dishPrice, selectedDish) => {
    setTotalPrice(prevTotal => {
      const priceToUse = dishPrice + (selectedDish?.pricing || 0)

      return isSelected ? prevTotal + priceToUse : prevTotal - priceToUse
    })
  }

  const onSubmit = async data => {
    try {
      const session = await getSession()

      if (!session || !session.user?._id) {
        return
      }

      const orderDate = moment().add(7, 'days').format('YYYY-MM-DD')

      const modifiers = Object.entries(selectedModifierIds).flatMap(([modifierId, dishes]) =>
        dishes.map(dish => ({
          modifierId,
          dishId: dish.id
        }))
      )

      const cartItem = {
        dishId: selectedDish._id,
        quantity: 1,
        modifiers
      }

      const payload = {
        vendorId: vendorId,
        userId: session.user._id,
        orderDate: currentDate,
        cartItems: [cartItem],
        kidId,
        orderType: 'multiple'
      }

      // Submit to API
      await axiosApiCall.post(API_ROUTER.STATE.ADD_TO_CART, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      fetchLatestCartDetails(kidId)

      // Reset form and close dialog
      reset()
      handleDialogClose()
    } catch (error) {
      console.error('Error submitting cart item:', error)
    }
  }

  return (
    <div className='p-4'>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedDay}
          onChange={handleChange}
          variant='fullWidth'
          textColor='primary'
          indicatorColor='primary'
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontSize: '16px', fontWeight: 500 },
            '& .Mui-selected': { color: 'green' } // Customize selected tab color
          }}
        >
          {selectedDates.map((day, index) => (
            <Tab key={index} label={day} />
          ))}
        </Tabs>
      </Box>
      <div className='flex justify-between items-center mb-4'>
        <Typography variant='h5' className='font-bold'>
          {dictionary?.common?.weekly_menu_selection}
        </Typography>
        <div className='flex items-center gap-4'>
          <TextField
            size='small'
            placeholder='Search'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Typography
            onClick={() => handleOrderNow(kidId)}
            style={{
              cursor: cartData?.length > 0 ? 'pointer' : 'not-allowed',
              opacity: cartData?.length > 0 ? 1 : 0.5
            }}
          >
            {dictionary?.common?.cart} ({cartData.reduce((total, cart) => total + (cart.cartItems?.length || 0), 0)}){' '}
          </Typography>
        </div>
      </div>

      {/* Categories */}
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

      {/* Dishes */}
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {filteredDishes.length > 0 ? (
              filteredDishes.map(dish => (
                <Grid item xs={12} sm={6} md={4} key={dish._id}>
                  <div
                    className='border rounded-lg p-4 flex flex-col gap-2 relative cursor-pointer'
                    onClick={() => handleDialogOpen(dish)}
                  >
                    <Tooltip title={`Ingredients: ${dish.ingredients.map(ing => ing.name).join(', ')}`} arrow>
                      <img
                        src={dish.image || 'https://via.placeholder.com/150'}
                        alt={dish.name}
                        className='w-full h-32 object-cover rounded-lg'
                      />
                    </Tooltip>
                    <Typography className='font-medium'>{dish.name}</Typography>
                    <Typography className='text-sm text-gray-600'>{dish.description}</Typography>
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

      {/* Dialog */}
      {selectedDish && (
        <Dialog
          open={dialogOpen}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              handleDialogClose()
            }
          }}
          fullWidth
        >
          <DialogTitle>
            {' '}
            {selectedDish?.name ?? 'Dish'}
            <IconButton
              edge='end'
              color='inherit'
              onClick={handleDialogClose}
              aria-label='close'
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            {selectedDish && (
              <form
                onSubmit={handleSubmit(data => {
                  onSubmit(data)
                  handleDialogClose()
                })}
              >
                {selectedDish?.modifierIds?.map((modifier, index) => (
                  <div key={modifier._id} className='mb-4'>
                    <Typography variant='h6' className='mb-3'>
                      {modifier.name}{' '}
                      <Typography variant='subtitle2' color='textSecondary'>
                        {modifier.requireCustomerToSelectDish ? 'Required' : 'Optional'}
                      </Typography>
                    </Typography>

                    {modifier.dishIds?.map((dish, dishIndex) => (
                      <Controller
                        key={dish._id}
                        name={`modifiers[${index}].dishIds[${dishIndex}].selected`}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                onChange={e => {
                                  const isSelected = e.target.checked
                                  const dishPrice = parseFloat(dish.pricing) || 0

                                  // Your dish price logic
                                  dishTotal(isSelected, dishPrice)

                                  // Update selected modifier IDs
                                  setSelectedModifierIds(prev => {
                                    const updatedModifierIds = prev[modifier._id] || []

                                    return {
                                      ...prev,
                                      [modifier._id]: isSelected
                                        ? [...updatedModifierIds, { id: dish._id, name: dish.name }]
                                        : updatedModifierIds.filter(item => item.id !== dish._id)
                                    }
                                  })

                                  // Clear potential errors
                                  clearErrors(`modifiers[${index}].dishIds`)

                                  field.onChange(isSelected)
                                }}
                              />
                            }
                            label={`${dish.name} +$${dish.pricing ?? '0.00'}`}
                          />
                        )}
                      />
                    ))}

                    {errors.modifiers?.[index]?.dishIds && (
                      <Typography color='error'>{errors.modifiers[index].dishIds.message}</Typography>
                    )}
                  </div>
                ))}
                <div style={{ width: 200, height: 200 }}>
                  <SpeedometerChart />
                </div>

                <Typography variant='h6' color='textSecondary' className='mb-3'>
                  {dictionary?.meal?.total_price}: ${totalPrice.toFixed(2)}
                </Typography>

                <div className='mt-4 text-center'>
                  <Button variant='contained' color='success' type='submit'>
                    {dictionary?.form?.button?.add_to_cart}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color='error'>
              {dictionary?.form?.placeholder?.close}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  )
}

export default WeeklyMenuSelection
