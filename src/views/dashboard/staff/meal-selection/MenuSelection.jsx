'use client'

import React, { useEffect, useState, useRef } from 'react'

import { useParams, usePathname, useRouter } from 'next/navigation'

import * as yup from 'yup'

import { format } from 'date-fns'

import { yupResolver } from '@hookform/resolvers/yup'

import { useForm, Controller } from 'react-hook-form'

import { getSession } from 'next-auth/react'

import { useSelector } from 'react-redux'

import CloseIcon from '@mui/icons-material/Close'

import {
  Box,
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
  IconButton,
  DialogActions,
  DialogContentText
} from '@mui/material'

import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'

import SpeedometerChart from '@/components/nourishubs/GaugeChart'

import { useTranslation } from '@/utils/getDictionaryClient'

import { getLocalizedUrl } from '@/utils/i18n'

import { getPanelName } from '@/utils/globalFunctions'

import TruncatedTextWithModal from '@/components/TruncatedTextWithModal'

const Menu = ({ dictionary, vendorId }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  const pathname = usePathname()
  const [activeId, setActiveId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dishDialogOpen, setDishDialogOpen] = useState(false)
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

  const selectedDates = useSelector(state => state.date.singleDate)

  const [cartData, setCartData] = useState([])
  const [dishData, setDishData] = useState([])

  const userId = useSelector(state => state.profile.user?._id)

  const validationSchema = selectedDish =>
    yup.object().shape({
      modifiers: yup
        .array()
        .of(
          yup.object().shape({
            name: yup.string().required(t('form.validation.modifier_name')),
            requireCustomerToSelectDish: yup.boolean(),
            what_the_maximum_amount_of_item_customer_can_select: yup.boolean(),
            max_selection: yup.number().nullable(),
            required_rule: yup.string().oneOf(['atleast', 'exactly', 'maximum']).required(),
            quantity: yup.number().required(t('form.validation.quantity')),
            dishIds: yup
              .array()
              .of(
                yup.object().shape({
                  selected: yup.boolean().required()
                })
              )
              .test('dish-selection', t('form.validation.validation'), function (dishIds) {
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
                      message: t('form.validation.max_dish', { max_selection: max_selection })
                    })
                  }
                }

                if (requireCustomerToSelectDish) {
                  if (required_rule === 'atleast' && selectedCount < quantity) {
                    return this.createError({
                      message: t('form.validation.atleast_dish', { quantity: quantity })
                    })
                  }

                  if (required_rule === 'exactly' && selectedCount !== quantity) {
                    return this.createError({
                      message: t('form.validation.exact_dish', { quantity: quantity })
                    })
                  }

                  if (required_rule === 'maximum' && selectedCount > quantity) {
                    return this.createError({
                      message: t('form.validation.max_dish_qty', { quantity: quantity })
                    })
                  }
                }

                return true
              })
          })
        )
        .test('modifiers-required', t('form.validation.atleast_modifier'), function (modifiers) {
          // ✅ Skip validation if selectedDish?.modifierIds is empty
          if (!selectedDish?.modifierIds || selectedDish?.modifierIds.length === 0) {
            return true
          }
          // ✅ Enforce at least one modifier if modifiers array is empty

          return modifiers && modifiers.length > 0
        })
    })

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

  const handleOrderNow = vendorId => {
    if ((cartData?.length || 0) > 0) {
      router.push(getLocalizedUrl(`${getPanelName(pathname)}/meal-selection/${vendorId}/cart`, locale))
    }
  }

  const fetchLatestCartDetails = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.STAFF.GET_CART_DETAILS(userId))

      setCartData(response?.data?.cartItems || [])
    } catch (error) {
      console.error('Error fetching updated cart:', error)
    }
  }

  const checkRun = useRef(false)

  useEffect(() => {
    if (userId) {
      fetchLatestCartDetails()
    }
  }, [userId])

  useEffect(() => {
    axiosApiCall
      .get(API_ROUTER.STAFF.GET_ALL_CATEGORIES, {
        params: {
          vendorId,
          searchQuery: searchQuery
        }
      })
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
  }, [vendorId, searchQuery])

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

  const handleDialogOpen = dish => {
    setSelectedDish(dish)
    setTotalPrice(dish?.pricing)
    setValidationError(false)
    setDialogOpen(true)
  }

  const handleDialogOpenFromDialog = dishFromDialog => {
    const matchedDish = filteredDishes.find(dish => dish._id === dishFromDialog.dishId._id)

    setSelectedDish(matchedDish)
    setTotalPrice(matchedDish?.pricing)
    setValidationError(false)
    setDialogOpen(true)
    setDishDialogOpen(false)
  }

  const handleDecreaseDialogOpen = async dish => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.STAFF?.ITEMS_BY_DISH, {
        params: {
          dishId: dish._id,
          orderDate: selectedDates
        }
      })

      setDishDialogOpen(true)
      setDishData(response?.data?.data || [])
      setSelectedDish(dish)
      setTotalPrice(dish?.pricing)
      setValidationError(false)
    } catch (error) {
      console.error('Error fetching updated cart:', error)
    }
  }

  const handleDecrease = async (dishId, dish) => {
    setIsDataLoaded(true)

    const currentQuantity = dish.quantity || 1

    const updatedQuantity = Math.max(currentQuantity - 1, 0)

    updateQuantityApiCall(dishId, updatedQuantity, dish.modifiers, dish.notes)

    setIsDataLoaded(false)
  }

  const updateQuantityApiCall = async (dishId, newQuantity, modifiers = []) => {
    try {
      const payload = {
        dishId,
        quantity: newQuantity,

        modifiers: modifiers.map(mod => ({
          modifierId: mod.modifierId._id,
          dishId: mod.dishId._id
        }))
      }

      const response = await axiosApiCall.post(API_ROUTER.STAFF.UPDATE_CART_QUANTITY, payload)

      if (response.status === 201) {
        await fetchLatestCartDetails()
        setDishDialogOpen(false)
      } else {
        console.error('Failed to update quantity:', response)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleDialogClose = () => {
    setValidationError(false)
    reset()
    setTotalPrice(0)
    setSelectedDish(null)
    setSelectedModifierIds([])
    setDialogOpen(false)
    setDishDialogOpen(false)
  }

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
        orderDate: selectedDates,
        cartItems: [cartItem]
      }

      await axiosApiCall.post(API_ROUTER.STAFF.ADD_CART, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      fetchLatestCartDetails()
      reset()
      handleDialogClose()
    } catch (error) {
      console.error('Error submitting cart item:', error)
    }
  }

  return (
    <div className='multi-order-custom'>
      <div className='common-block-dashboard p-0'>
        <div className='common-form-dashboard flex justify-between items-center'>
          <Typography variant='h5' className='font-bold'>
            {dictionary?.common?.menu}
          </Typography>
          <div className='flex items-center gap-4'>
            <div className='form-group'>
              <TextField
                size='small'
                placeholder={dictionary?.common?.search}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className='cart-icon-block'>
              <Typography
                onClick={() => handleOrderNow(vendorId)}
                style={{
                  cursor: cartData?.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: cartData?.length > 0 ? 1 : 0.5
                }}
              >
                <svg width='25' height='26' viewBox='0 0 25 26' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M17.8143 6.2443C17.8143 3.26171 15.3965 0.843798 12.4139 0.843798C10.9776 0.83776 9.5981 1.40405 8.58036 2.41749C7.56263 3.43093 6.99052 4.80804 6.99052 6.2443M17.6427 24.8713H7.20791C3.37496 24.8713 0.434459 23.4869 1.2697 17.9148L2.24224 10.3633C2.75711 7.58298 4.53057 6.5189 6.08663 6.5189H18.8097C20.3887 6.5189 22.0592 7.66307 22.6541 10.3633L23.6267 17.9148C24.3361 22.8576 21.4756 24.8713 17.6427 24.8713Z'
                    stroke='#006838'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                {/* {dictionary?.common?.cart}  */}
                <span>({cartData.reduce((sum, item) => sum + (item.quantity || 0), 0)})</span>
              </Typography>
            </div>
          </div>
        </div>

        <div className='card-category-img'>
          <CardContent className='p-0 flex gap-4 overflow-x-auto'>
            <div
              className={`card-category-img-first cursor-pointer border p-4 rounded-lg flex items-center gap-2 ${
                selectedCategory === null ? 'bg-green-100' : ''
              }`}
              onClick={() => handleSelectCategory(null)}
            >
              <Typography className='font-medium text-center'>{dictionary?.form?.label?.all}</Typography>
            </div>

            {categories.map(category => (
              <div
                key={category._id}
                className={`card-category-img-common cursor-pointer border p-4 rounded-lg flex items-center gap-2 ${
                  selectedCategory?._id === category._id ? 'bg-green-100' : ''
                }`}
                onClick={() => handleSelectCategory(category)}
              >
                <div className='category-img-block'>
                  <img src={category.imageUrl} alt={category.name} className='w-12 h-12' />
                </div>
                <Typography className='font-medium'>{category.name}</Typography>
              </div>
            ))}
          </CardContent>
        </div>
      </div>

      <Card className='menu-selection-block'>
        <CardContent className='p-0'>
          <Grid container spacing={6}>
            {filteredDishes.length > 0 ? (
              filteredDishes.map(dish => {
                // Find matching cart item from cartData
                const totalQty = cartData.reduce((acc, cartItem) => {
                  if (cartItem.dishId._id === dish._id) {
                    acc += cartItem.quantity
                  }

                  return acc
                }, 0)

                return (
                  <Grid item xs={12} sm={6} md={6} key={`${dish._id}-${totalQty}`}>
                    <div className='menu-selection-block-inner flex gap-2 relative cursor-pointer'>
                      <div className='menu-selection-block-inner-content'>
                        {/* Dish name and description */}
                        <Typography className='title-medium-custom'>{dish.name}</Typography>
                        <TruncatedTextWithModal
                          id={dish._id}
                          title={dish.name}
                          text={dish.description}
                          wordLimit={20}
                          activeId={activeId}
                          setActiveId={setActiveId}
                        />
                        <Typography className='title-medium-custom theme-color'>${dish.pricing}</Typography>
                      </div>
                      {/* Dish image with tooltip */}
                      <div className='menu-selection-block-inner-img'>
                        <Tooltip title={`Ingredients: ${dish.ingredients.map(ing => ing.name).join(', ')}`} arrow>
                          <img
                            src={dish.image || 'https://via.placeholder.com/150'}
                            alt={dish.name}
                            className='object-cover rounded-lg'
                          />
                        </Tooltip>

                        {/* Quantity buttons and field */}
                        <div className='menu-selection-block-inner-p-l flex justify-between items-center'>
                          <Button variant='outlined' onClick={() => handleDialogOpen(dish)}>
                            <i className='tabler-plus' />
                          </Button>

                          {/* Qty field placed between + and - */}
                          <TextField
                            value={totalQty}
                            InputProps={{ readOnly: true }} // Non-editable qty field
                            className='text-center' // Center align qty
                            variant='outlined'
                            size='small'
                          />

                          <Button
                            className='border-radius-block'
                            variant='outlined'
                            onClick={() => handleDecreaseDialogOpen(dish)}
                          >
                            <i className='tabler-minus' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Grid>
                )
              })
            ) : (
              <Typography variant='body1' color='textSecondary' className='text-center w-full'>
                {dictionary?.meal?.no_dishes_found}.
              </Typography>
            )}
          </Grid>
        </CardContent>
      </Card>

      {selectedDish && (
        <Dialog
          className='common-modal-theme'
          open={dialogOpen}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              handleDialogClose()
            }
          }}
          fullWidth
        >
          <DialogTitle className='title-medium-custom'>
            {selectedDish?.name ?? 'Dish'}
            <IconButton edge='end' color='inherit' onClick={handleDialogClose} aria-label='close'>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent className='modal-body-custom'>
            {selectedDish && (
              <form
                onSubmit={handleSubmit(data => {
                  onSubmit(data)
                  handleDialogClose()
                })}
              >
                {selectedDish?.modifierIds?.map((modifier, index) => (
                  <div key={modifier._id} className='modal-inner-block'>
                    <Typography variant='h6' className='title-small-medium-custom mb-3'>
                      {modifier.name}
                    </Typography>
                    <Typography className='title-small-custom' variant='subtitle2' color='textSecondary'>
                      {modifier.requireCustomerToSelectDish ? 'Required' : 'Optional'}
                    </Typography>

                    {modifier.dishIds?.map((dish, dishIndex) => (
                      <Controller
                        key={dish._id}
                        name={`modifiers[${index}].dishIds[${dishIndex}].selected`}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <FormControlLabel
                            className='label-block-modal-body'
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                onChange={e => {
                                  const isSelected = e.target.checked
                                  const dishPrice = parseFloat(dish.pricing) || 0

                                  dishTotal(isSelected, dishPrice)

                                  setSelectedModifierIds(prev => {
                                    const updatedModifierIds = prev[modifier._id] || []

                                    return {
                                      ...prev,
                                      [modifier._id]: isSelected
                                        ? [...updatedModifierIds, { id: dish._id, name: dish.name }]
                                        : updatedModifierIds.filter(item => item.id !== dish._id)
                                    }
                                  })

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
                <div className='block-chart-common flex align-center justify-between'>
                  <div className='block-chart-inner' style={{ width: 200, height: 200 }}>
                    <SpeedometerChart />
                  </div>
                </div>
                <div className='modal-footer'>
                  <Typography variant='h6' color='textSecondary' className='title-small-medium-custom'>
                    {dictionary?.meal?.total_price}: ${totalPrice.toFixed(2)}
                  </Typography>

                  <div className=''>
                    <Button className='theme-common-btn' variant='contained' color='success' type='submit'>
                      {dictionary?.form?.button?.add_to_cart}
                    </Button>
                  </div>
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

      {/* {dishData.length > 0 && ( */}
      <Dialog
        open={dishDialogOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleDialogClose()
          }
        }}
        fullWidth
      >
        <DialogTitle>
          {dictionary?.common?.selected_dishes}
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
          {dishData.length === 0 ? (
            <Typography>{dictionary?.meal?.no_dishes_found}</Typography>
          ) : (
            dishData.map((item, index) => {
              const dish = item.dishId

              return (
                <div key={index} className='mb-4 flex items-center justify-between'>
                  {/* Dish Image & Name */}
                  <div className='flex items-center gap-4'>
                    {dish.image && (
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          ml: 2,
                          backgroundImage: `url(${dish.image || '/default-image.jpg'})`,
                          backgroundSize: 'cover',
                          borderRadius: 1
                        }}
                      />
                    )}
                    <div>
                      <Typography variant='h6'>{dish.name}</Typography>
                      {/* <Typography variant='body2' color='textSecondary'>
                        Ingredients: {dish.ingredients?.map(ing => ing.name).join(', ') || 'N/A'}
                      </Typography> */}
                      {item.modifiers.length > 0 && (
                        <Typography variant='body2' color='textSecondary'>
                          {dictionary?.form?.placeholder?.modifiers}:{' '}
                          {item.modifiers.map(mod => mod?.dishId?.name).join(', ') || 'None'}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className='flex items-center'>
                    <Button variant='outlined' onClick={() => handleDialogOpenFromDialog(item)}>
                      +
                    </Button>

                    {/* Qty field placed between + and - */}
                    <Typography variant='h6' className='mx-2'>
                      {item.quantity}
                    </Typography>

                    <Button variant='outlined' onClick={() => handleDecrease(dish._id, item)}>
                      -
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} color='error'>
            {dictionary?.form?.placeholder?.close}
          </Button>
        </DialogActions>
      </Dialog>
      {/* )} */}
    </div>
  )
}

export default Menu
