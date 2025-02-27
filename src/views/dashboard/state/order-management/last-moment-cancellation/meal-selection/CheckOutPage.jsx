'use client'

import React, { useEffect, useState } from 'react'

import { useParams, usePathname, useRouter } from 'next/navigation'

import { getSession } from 'next-auth/react'

import { useSelector } from 'react-redux'

import { Add, Remove, Close as CloseIcon } from '@mui/icons-material'

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastSuccess, getPanelName } from '@/utils/globalFunctions'
import { getLocalizedUrl } from '@/utils/i18n'

import SpeedometerChart from '@/components/nourishubs/GaugeChart'
import MealNutritionTable from '@/views/dashboard/common/MealNutritionTable'
import { globalState } from '@/redux-store/slices/global'

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

export default function CheckoutPage({ dictionary, kidId, vendorId }) {
  const router = useRouter()

  const { lang: locale } = useParams()
  const pathname = usePathname()
  const [cartData, setCartData] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [validationError, setValidationError] = useState(false)

  const [totalPrice, setTotalPrice] = useState(0)

  const [selectedModifierIds, setSelectedModifierIds] = useState([])

  const [deliveryPrice, setDeliveryPrice] = useState(0)

  const [itemTotal, setItemTotal] = useState(0)

  const selectedDates = useSelector(state => state.date.singleDate)
  const { orderId } = useSelector(globalState)

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
            required_rule: modifier.required_rule,
            quantity: modifier.quantity || 1,
            dishIds:
              modifier.dishIds?.map(dish => ({
                selected: false
              })) || []
          })) || []
      })
    }
  }, [selectedDish, reset])

  const handleDialogOpen = dish => {
    setSelectedDish(dish)
    setTotalPrice(dish?.price)
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

  const dishTotal = (isSelected, dishPrice, selectedDish) => {
    setTotalPrice(prevTotal => {
      const priceToUse = dishPrice + (selectedDish?.pricing || 0)

      return isSelected ? prevTotal + priceToUse : prevTotal - priceToUse
    })
  }

  const fetchLatestCartModifierDetails = async dishId => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.PARENT.GET_CART_MODIFIER_DISH(dishId))

      setSelectedDish(prevDish => ({
        ...prevDish,
        modifierIds: response?.data?.modifierIds || []
      }))
    } catch (error) {
      console.error('Error fetching updated cart:', error)
    }
  }

  const handlePayNow = async () => {
    try {
      const response = await axiosApiCall.post(API_ROUTER.STATE.PLACE_ORDER(cartData._id))

      const { status, message } = response?.data || {}

      if (status) {
        // await fetchLatestCartDetails()
        toastSuccess(message)
        router.push(getLocalizedUrl(`${getPanelName(pathname)}/order-management`, locale))
      }
    } catch (error) {}
  }

  const emptyCart = () => {
    router.push(getLocalizedUrl(`${getPanelName(pathname)}/order-management`, locale))

    return
  }

  const fetchLatestCartDetails = async (orderId, selectedDates) => {
    try {
      setLoading(true)
      const response = await axiosApiCall.get(API_ROUTER.STATE.GET_CART_DETAILS(orderId, selectedDates))

      if (!response?.data || (typeof response.data === 'string' && response.data.trim() === '')) {
        emptyCart()
      }

      setCartData(response?.data)

      if (response?.data && response?.data?.cartItems) {
        let totalItem = 0

        response?.data?.cartItems.forEach(dish => {
          const modifiersTotal = dish.modifiers
            ? dish.modifiers.reduce((sum, modifier) => sum + (modifier.price || 0), 0)
            : 0

          totalItem += (dish.price + modifiersTotal) * dish.quantity
        })

        setItemTotal(totalItem)
      }

      const updatedQuantities = response?.data.cartItems.reduce((acc, dish) => {
        acc[dish.dishId._id] = dish.quantity || 1

        return acc
      }, {})

      setQuantities(updatedQuantities)
    } catch (error) {
    } finally {
      setLoading(false)
      setIsDataLoaded(false)
    }
  }

  const updateQuantityApiCall = async (dishId, newQuantity, kidId, modifiers = []) => {
    try {
      const payload = {
        dishId,
        quantity: newQuantity,

        modifiers: modifiers.map(mod => ({
          modifierId: mod.modifierId._id,
          dishId: mod.dishId._id
        })),
        cartId: cartData._id
      }

      const response = await axiosApiCall.post(API_ROUTER.STATE.UPDATE_CART_QUANTITY, payload)

      if (response.status === 201) {
        await fetchLatestCartDetails(orderId)
      } else {
        console.error('Failed to update quantity:', response)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleDecrease = async (dishId, kidId, dish) => {
    setIsDataLoaded(true)

    const currentQuantity = dish.quantity || 1

    const updatedQuantity = Math.max(currentQuantity - 1, 0)

    updateQuantityApiCall(dishId, updatedQuantity, kidId, dish.modifiers, dish.notes)

    setIsDataLoaded(false)
  }

  const handleIncrease = async (dishId, kidId, dish) => {
    setIsDataLoaded(true)

    setSelectedDish(dish)
    handleDialogOpen(dish)

    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [dishId]: (prevQuantities[dishId] || 0) + 1
    }))

    try {
      await fetchLatestCartModifierDetails(dishId)
    } catch (error) {
      console.error('Error fetching modifiers:', error)
    }
  }

  const handleAddToCart = async (dishId, kidId) => {
    try {
      const session = await getSession()

      if (!session || !session.user?._id) return

      const modifiers = Object.entries(selectedModifierIds).flatMap(([modifierId, dishes]) =>
        dishes.map(dish => ({
          modifierId,
          dishId: dish.id
        }))
      )

      let cartItem = {
        dishId: dishId._id,
        quantity: quantities[dishId] || 1,
        modifiers
      }

      const payload = {
        vendorId,
        cartItems: [cartItem],
        orderId
      }

      await axiosApiCall.post(API_ROUTER.STATE.ADD_TO_CART, payload, {
        headers: { 'Content-Type': 'application/json' }
      })

      fetchLatestCartDetails(orderId)
      reset()
      handleDialogClose()
    } catch (error) {
      console.error('Error submitting cart item:', error)
    }
  }

  // Initial Cart Fetch
  useEffect(() => {
    if (orderId) {
      fetchLatestCartDetails(orderId)
    }
  }, [])

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8} lg={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6'>
                {cartData?.kidId?.first_name} {cartData?.kidId?.last_name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {cartData?.schoolId?.schoolName}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SpeedometerChart />
              </Box>

              {Object.keys(cartData).length > 0 && (
                <MealNutritionTable key={JSON.stringify(cartData)} dictionary={dictionary} cartData={cartData} />
              )}
            </CardContent>
          </Card>
          {/* <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6'>{dictionary?.common?.account}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...
              </Typography>
            </CardContent>
          </Card> */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6'>{dictionary?.common?.delivery_address}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {cartData?.deliveryAddress}
              </Typography>
            </CardContent>
          </Card>

          {/* <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6'>{dictionary?.common?.payment}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...
              </Typography>
            </CardContent>
          </Card> */}
        </Grid>

        <Grid item xs={12} md={4} lg={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between' mb={1}>
                <Typography variant='h6'>{dictionary?.common?.checkout}</Typography>
                <Button variant='contained' color='success' onClick={handlePayNow}>
                  {dictionary?.form?.button?.pay_now}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ p: 3 }}>
            {cartData?.cartItems?.map((dish, index) => {
              const modifiersTotal = dish.modifiers?.reduce((sum, modifier) => sum + (modifier.price || 0), 0) || 0
              const dishTotal = (dish.price + modifiersTotal) * dish.quantity // Include quantity

              return (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                      <Box flex='1'>
                        <Typography variant='subtitle1'>{dish.dishId.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {dish.dishId.description?.substring(0, 80)}...
                        </Typography>

                        {dish.modifiers && dish.modifiers.length > 0 && (
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              {dictionary?.form?.placeholder?.modifiers}:
                            </Typography>
                            <ul>
                              {dish.modifiers.map((modifier, modIndex) => (
                                <li key={modIndex}>
                                  {modifier.dishId?.name && (
                                    <Typography variant='body2' color='text.secondary'>
                                      {`${modifier.dishId.name} - $${modifier.price}`}
                                    </Typography>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}

                        <Typography variant='body2' sx={{ mt: 1 }}>
                          {dictionary?.form?.label?.quantity}: {dish.quantity}
                        </Typography>
                        <Typography variant='subtitle1' sx={{ mt: 1 }}>
                          ${dishTotal.toFixed(2)}
                        </Typography>
                      </Box>

                      <Box display='flex' alignItems='center'>
                        <IconButton
                          color='primary'
                          disabled={isDataLoaded}
                          onClick={() => handleDecrease(dish.dishId._id, kidId, dish)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography>{dish.quantity}</Typography>
                        <IconButton
                          color='primary'
                          disabled={isDataLoaded}
                          onClick={() => handleIncrease(dish.dishId._id, kidId, dish)}
                        >
                          <Add />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          ml: 2,
                          backgroundImage: `url(${dish.dishId.image || '/default-image.jpg'})`,
                          backgroundSize: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Box>

          <Card>
            {loading ? (
              <CircularProgress size={40} />
            ) : (
              <CardContent>
                <Typography variant='h6'>{dictionary?.common?.bill_details}</Typography>
                {/ Item Total Calculation /}
                <Box display='flex' justifyContent='space-between' mt={2}>
                  <Typography>{dictionary?.common?.item_total}</Typography>
                  <Typography>${itemTotal.toFixed(2)}</Typography>
                </Box>

                {/ Delivery Fees /}
                <Box display='flex' justifyContent='space-between' mt={1}>
                  <Typography>{dictionary?.common?.delivery_fees}</Typography>
                  <Typography>${deliveryPrice}</Typography>
                </Box>
              </CardContent>
            )}
          </Card>

          <Card>
            {loading ? (
              <CircularProgress size={40} />
            ) : (
              <CardContent>
                {/ Total Pay /}
                <Box display='flex' justifyContent='space-between' mt={2}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {dictionary?.common?.total_pay}
                  </Typography>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    ${itemTotal.toFixed(2) + deliveryPrice}
                  </Typography>
                </Box>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
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
              <form onSubmit={handleSubmit(() => handleAddToCart(selectedDish?.dishId, kidId))}>
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

                                  dishTotal(isSelected, dishPrice) // Update total price

                                  setSelectedModifierIds(prev => {
                                    const updatedModifierIds = prev[modifier._id] || []

                                    return {
                                      ...prev,
                                      [modifier._id]: isSelected
                                        ? [...updatedModifierIds, { id: dish._id, name: dish.name, price: dishPrice }]
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
                <div style={{ width: 200, height: 200 }}>
                  <SpeedometerChart />
                </div>

                <Typography variant='h6' color='textSecondary' className='mb-3'>
                  {dictionary?.meal?.total_price}: ${totalPrice?.toFixed(2)}
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
    </Box>
  )
}
