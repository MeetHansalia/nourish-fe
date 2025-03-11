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
  Checkbox,
  TextField
} from '@mui/material'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import MealNutritionTable from '../../common/MealNutritionTable'

import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastSuccess, getPanelName } from '@/utils/globalFunctions'
import { getLocalizedUrl } from '@/utils/i18n'

import SpeedometerChart from '@/components/nourishubs/GaugeChart'
import { useTranslation } from '@/utils/getDictionaryClient'
import FullPageLoader from '@/components/FullPageLoader'
import IngredientsTable from '../../common/IngredientsTable'

export default function CheckoutPage({ dictionary, kidId, vendorId }) {
  const router = useRouter()

  const { lang: locale } = useParams()
  const pathname = usePathname()
  const [cartData, setCartData] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isCheckOutDataLoaded, setIsCheckOutDataLoaded] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [validationError, setValidationError] = useState(false)
  const { t } = useTranslation(locale)
  const [totalPrice, setTotalPrice] = useState(0)

  const [selectedModifierIds, setSelectedModifierIds] = useState([])

  const [deliveryPrice, setDeliveryPrice] = useState(0)

  const [itemTotal, setItemTotal] = useState(0)

  const [speedValue, setSpeedValue] = useState(0)

  const [nutrition, setNutrition] = useState({})
  const [kidNutrition, setKidNutrition] = useState({})

  const selectedDates = useSelector(state => state.date.singleDate)

  const [notes, setNote] = useState('') // State to store the notes

  const handleNoteChange = event => {
    setNote(event.target.value) // Update state when the user types
  }

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
            required_rule: yup
              .string()
              .oneOf(['atleast', 'exactly', 'maximum'])
              .when('requireCustomerToSelectDish', {
                is: true, // ✅ Only validate `required_rule` when `requireCustomerToSelectDish` is true
                then: schema => schema.required(t('form.validation.selection_rule')),
                otherwise: schema => schema.notRequired()
              }),
            quantity: yup.number().when('requireCustomerToSelectDish', {
              is: true, // ✅ Only validate `quantity` when `requireCustomerToSelectDish` is true
              then: schema => schema.required(t('form.validation.quantity')),
              otherwise: schema => schema.notRequired()
            }),
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

                // ✅ If `requireCustomerToSelectDish` is not true, **skip validation**
                if (!requireCustomerToSelectDish) return true

                const selectedCount = dishIds.filter(dish => dish.selected).length

                if (what_the_maximum_amount_of_item_customer_can_select && max_selection) {
                  if (selectedCount > max_selection) {
                    return this.createError({
                      message: t('form.validation.max_dish', { max_selection: max_selection })
                    })
                  }
                }

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

                return true
              })
          })
        )
        .test('modifiers-required', t('form.validation.atleast_modifier'), function (modifiers) {
          // ✅ If selectedDish has no modifiers, skip validation
          if (!selectedDish?.modifierIds || selectedDish?.modifierIds.length === 0) {
            return true
          }

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
    setIsDataLoaded(false)
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
      const response = await axiosApiCall.post(API_ROUTER.PARENT.PAY_NOW, {
        kidId,
        notes,
        speedometerValue: speedValue
      })

      const { status, message } = response?.data || {}

      if (status) {
        await fetchLatestCartDetails()
        toastSuccess(message)
        router.push(getLocalizedUrl(`${getPanelName(pathname)}/meal-selection`, locale))
      }
    } catch (error) {}
  }

  const emptyCart = () => {
    router.push(getLocalizedUrl(`${getPanelName(pathname)}/meal-selection`, locale))

    return
  }

  const fetchLatestCartDetails = async (kidId, selectedDates) => {
    try {
      setIsCheckOutDataLoaded(true)
      setLoading(true)
      const response = await axiosApiCall.get(API_ROUTER.PARENT.GET_CART_DETAILS(kidId, selectedDates))

      if (!response?.data || (typeof response.data === 'string' && response.data.trim() === '')) {
        emptyCart()
      }

      setKidNutrition(
        response?.data?.kidId?.nutrition
          ? response?.data.kidId.nutrition
          : {
              fat: 0,
              sugar: 0,
              protein: 0,
              sodium: 0,
              carbohydrate: 0
            }
      )

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
      setIsCheckOutDataLoaded(false)
    } catch (error) {
    } finally {
      setLoading(false)
      setIsDataLoaded(false)
      setIsCheckOutDataLoaded(false)
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
        kidId
      }

      const response = await axiosApiCall.post(API_ROUTER.PARENT.UPDATE_CART_QUANTITY, payload)

      if (response.status === 201) {
        await fetchLatestCartDetails(kidId)
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
        userId: session.user._id,
        orderDate: selectedDates,
        cartItems: [cartItem],
        kidId
      }

      await axiosApiCall.post(API_ROUTER.PARENT.PARENT_ADD_CART, payload, {
        headers: { 'Content-Type': 'application/json' }
      })

      fetchLatestCartDetails(kidId)
      reset()
      handleDialogClose()
    } catch (error) {
      console.error('Error submitting cart item:', error)
    }
  }

  // Initial Cart Fetch
  useEffect(() => {
    if (kidId) {
      fetchLatestCartDetails(kidId)
    }
  }, [])

  const handleCalculatedValue = value => {
    setSpeedValue(value)
  }

  return (
    <>
      {isCheckOutDataLoaded ? (
        <FullPageLoader open={isCheckOutDataLoaded} color='primary' spinnerSize={60} />
      ) : (
        <>
          <Box className='checkout-main-custom'>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6} lg={6}>
                <Card className='common-block-dashboard'>
                  <CardContent className='p-0 flex gap-4'>
                    <Button className='theme-common-btn mr-2' variant='contained' onClick={() => router.back()}>
                      {dictionary?.form?.button?.back}
                    </Button>
                    <div>
                      <Typography variant='h6' className='title-small-medium-custom'>
                        {cartData?.kidId?.first_name} {cartData?.kidId?.last_name}
                      </Typography>
                      <Typography className='disc-common-custom-small' variant='body2' color='text.secondary'>
                        {cartData?.schoolId?.schoolName}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
                <Card className='common-block-dashboard'>
                  <CardContent className='p-0'>
                    <TextField
                      className='mt-2'
                      label={dictionary?.form?.label?.notes || 'Notes'}
                      variant='outlined'
                      multiline
                      fullWidth
                      rows={4}
                      placeholder={dictionary?.form?.placeholder?.notes || 'Enter your notes here...'}
                      value={notes} // Controlled input
                      onChange={handleNoteChange} // Update state on change
                    />
                  </CardContent>
                </Card>

                <Card className='common-block-dashboard'>
                  <CardContent
                    className='p-0'
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div className='block-chart-common'>
                      <Box
                        className='block-chart-inner'
                        sx={{
                          width: 120,
                          height: 120,

                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <SpeedometerChart
                          totalNutrition={nutrition}
                          kidNutrition={kidNutrition}
                          onCalculatedValue={handleCalculatedValue}
                        />
                      </Box>
                    </div>
                    <div className='block-chart-table-in'>
                      {Object.keys(cartData).length > 0 && (
                        <MealNutritionTable
                          key={JSON.stringify(cartData)}
                          dictionary={dictionary}
                          cartData={cartData}
                          setNutrition={setNutrition}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className='common-block-dashboard'>
                  <CardContent className='p-0 user-checkout-block'>
                    <div className='tabler-icon-block'>
                      <i className='tabler-user' />
                    </div>
                    <div className='checkout-detials pl-3'>
                      <Typography variant='h6' className='title-small-medium-custom'>
                        {dictionary?.common?.account}
                      </Typography>
                      <Typography className='disc-common-custom-small' variant='body2' color='text.secondary'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
                <Card className='common-block-dashboard'>
                  <CardContent className='p-0 user-checkout-block'>
                    <div className='tabler-icon-block'>
                      <i className='tabler-truck' />
                    </div>
                    <div className='checkout-detials pl-3'>
                      <Typography variant='h6' className='title-small-medium-custom'>
                        {dictionary?.common?.delivery_address}
                      </Typography>
                      <Typography className='disc-common-custom-small' variant='body2' color='text.secondary'>
                        {cartData?.deliveryAddress}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>

                <Card className='common-block-dashboard'>
                  <CardContent className='p-0 user-checkout-block'>
                    <div className='tabler-icon-block'>
                      <i className='tabler-credit-card-pay' />
                    </div>
                    <div className='checkout-detials pl-3'>
                      <Typography className='title-small-medium-custom' variant='h6'>
                        {dictionary?.common?.payment}
                      </Typography>
                      <Typography className='disc-common-custom-small' variant='body2' color='text.secondary'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={6}>
                <Box className=''>
                  {cartData?.cartItems?.map((dish, index) => {
                    const modifiersTotal =
                      dish.modifiers?.reduce((sum, modifier) => sum + (modifier.price || 0), 0) || 0

                    const dishTotal = (dish.price + modifiersTotal) * dish.quantity // Include quantity

                    return (
                      <Card key={index} sx={{ mb: 2 }} className='common-block-dashboard border-none-card'>
                        <CardContent className='p-0'>
                          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                            <Box flex='1'>
                              <Typography className='title-small-medium-custom' variant='subtitle1'>
                                {dish.dishId.name}
                              </Typography>
                              <Typography className='disc-common-custom-small' variant='body2' color='text.secondary'>
                                {dish.dishId.description?.substring(0, 80)}...
                              </Typography>

                              {dish.modifiers && dish.modifiers.length > 0 && (
                                <Box>
                                  <Typography
                                    className='disc-common-custom-small'
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    {dictionary?.form?.placeholder?.modifiers}:
                                  </Typography>
                                  <ul>
                                    {dish.modifiers.map((modifier, modIndex) => (
                                      <li key={modIndex}>
                                        {modifier.dishId?.name && (
                                          <Typography
                                            className='disc-common-custom-small'
                                            variant='body2'
                                            color='text.secondary'
                                          >
                                            {`${modifier.dishId.name} - $${modifier.price}`}
                                          </Typography>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                              <Typography className='disc-common-custom-small' variant='body2' sx={{ mt: 1 }}>
                                {dictionary?.form?.label?.quantity}: {dish.quantity}
                              </Typography>
                              <Typography
                                className='title-small-medium-custom theme-color mt-2'
                                variant='subtitle1'
                                sx={{ mt: 1 }}
                              >
                                ${dishTotal.toFixed(0)}
                              </Typography>
                            </Box>
                            <div className='menu-pl-block'>
                              <div className='menu-selection-block-inner-p-l checkout-flex flex justify-between items-center'>
                                <IconButton
                                  color='primary'
                                  disabled={isDataLoaded}
                                  onClick={() => handleDecrease(dish.dishId._id, kidId, dish)}
                                >
                                  {/* <Remove /> */}
                                  <i className='tabler-minus' />
                                </IconButton>
                                <Typography className='input-block-p text-center'>{dish.quantity}</Typography>
                                <IconButton
                                  color='primary'
                                  className='border-radius-block'
                                  disabled={isDataLoaded}
                                  onClick={() => handleIncrease(dish.dishId._id, kidId, dish)}
                                >
                                  {/* <Add /> */}
                                  <i className='tabler-plus' />
                                </IconButton>
                              </div>
                              <Box
                                className='block-img-box'
                                sx={{
                                  width: 64,
                                  height: 64,
                                  ml: 2,
                                  backgroundImage: `url(${dish.dishId.image || '/default-image.jpg'})`,
                                  backgroundSize: 'cover',
                                  borderRadius: 1
                                }}
                              />
                            </div>
                          </Box>
                        </CardContent>
                      </Card>
                    )
                  })}
                </Box>

                <Card className='common-block-dashboard'>
                  {loading ? (
                    <CircularProgress size={40} />
                  ) : (
                    <CardContent className='p-0'>
                      <Typography className='title-small-medium-custom mt-1' variant='h6'>
                        {dictionary?.common?.bill_details}
                      </Typography>

                      {/* Item Total Calculation */}
                      <Box display='flex' justifyContent='space-between' mt={2}>
                        <Typography className='disc-common-custom-small'>{dictionary?.common?.item_total}</Typography>
                        <Typography className='disc-common-custom-small'>${itemTotal?.toFixed(0)}</Typography>
                      </Box>

                      {/* Delivery Fees */}
                      <Box display='flex' justifyContent='space-between' mt={1}>
                        <Typography className='disc-common-custom-small'>
                          {dictionary?.common?.delivery_fees}
                        </Typography>
                        <Typography className='disc-common-custom-small'>${deliveryPrice?.toFixed(0)}</Typography>
                      </Box>
                    </CardContent>
                  )}
                </Card>

                <Card className='common-block-dashboard'>
                  {loading ? (
                    <CircularProgress size={40} />
                  ) : (
                    <CardContent className='p-0'>
                      {/* Total Pay */}
                      <Box display='flex' justifyContent='space-between'>
                        <Typography
                          className='title-small-medium-custom theme-color'
                          variant='subtitle1'
                          fontWeight='bold'
                        >
                          {dictionary?.common?.total_pay}
                        </Typography>
                        <Typography
                          className='title-small-medium-custom theme-color'
                          variant='subtitle1'
                          fontWeight='bold'
                        >
                          ${(itemTotal + deliveryPrice).toFixed(0)}
                        </Typography>
                      </Box>
                    </CardContent>
                  )}
                </Card>
                <Card className='common-block-dashboard'>
                  <CardContent className='p-0'>
                    <Box display='flex' alignItems='center' justifyContent='space-between' mb={1}>
                      <Typography className='title-small-medium-custom' variant='h6'>
                        {dictionary?.common?.checkout}
                      </Typography>
                      <Button
                        className='theme-common-btn theme-btn-color'
                        variant='contained'
                        color='success'
                        onClick={handlePayNow}
                      >
                        {dictionary?.form?.button?.pay_now}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {selectedDish && (
              <Dialog
                open={dialogOpen}
                className='common-modal-theme'
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
                    <form onSubmit={handleSubmit(() => handleAddToCart(selectedDish?.dishId, kidId))}>
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

                                        dishTotal(isSelected, dishPrice) // Update total price

                                        setSelectedModifierIds(prev => {
                                          const updatedModifierIds = prev[modifier._id] || []

                                          return {
                                            ...prev,
                                            [modifier._id]: isSelected
                                              ? [
                                                  ...updatedModifierIds,
                                                  { id: dish._id, name: dish.name, price: dishPrice }
                                                ]
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
                          <SpeedometerChart
                            totalNutrition={selectedDish?.dishId?.calculatedNutrition}
                            kidNutrition={kidNutrition}
                          />
                        </div>
                      </div>
                      <div className='block-chart-table-in'>
                        <IngredientsTable
                          ingredientsData={selectedDish?.dishId?.ingredients}
                          selectedDish={selectedDish?.dishId}
                          dictionary={dictionary}
                        />
                      </div>
                      <div className='modal-footer'>
                        <Typography className='title-small-medium-custom'>
                          {dictionary?.meal?.total_price}: ${totalPrice?.toFixed(0)}
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
          </Box>
        </>
      )}
    </>
  )
}
