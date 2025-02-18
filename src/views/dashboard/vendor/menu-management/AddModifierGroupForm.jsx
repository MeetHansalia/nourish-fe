import React, { useEffect, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import { useForm, Controller, useFieldArray } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'

//import EditIcon from '@mui/icons-material/Edit'

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'

import { isCancel } from 'axios'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

import { useTranslation } from '@/utils/getDictionaryClient'

import AddDishDialog from './add-dish-model'

import { API_ROUTER } from '@/utils/apiRoutes'

import { apiResponseErrorHandling, toastError, toastSuccess } from '@/utils/globalFunctions'

import axiosApiCall from '@/utils/axiosApiCall'

export default function ModifyGroupForm({ onDelete, handleBackToTabs, tabValue, editId }) {
  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)

  // Validation schema

  const schema = yup.object().shape({
    name: yup.string().required(t('form.validation.name')),
    dishes: yup
      .array()
      .of(yup.string().required(t('form.validation.each_dish_must_string')))
      .min(1, t('form.validation.you_must_select_at_least_one_dishes'))
      .required(t('form.validation.dishes_field_is_required')),
    requireSelection: yup.boolean().default(false),
    required_rule: yup
      .string()
      .nullable()
      .test('required_rule-check', t('form.validation.rules'), function (value) {
        const { requireSelection } = this.parent

        return requireSelection ? !!value : true
      }),

    quantity: yup
      .number()
      .nullable()
      .test('quantity-check', t('form.validation.quantity'), function (value) {
        const { requireSelection } = this.parent

        return requireSelection ? !!value : true
      }),

    requireHowManySelection: yup.boolean().default(false),
    max_selection: yup
      .number()
      .nullable()
      .test('max_selection-check', t('form.validation.max_seaction'), function (value) {
        const { requireHowManySelection } = this.parent

        return requireHowManySelection ? !!value : true
      })
  })

  const buttonProps = {
    variant: 'contained',
    color: 'primary',
    children: t('form.label.add_new_dish')
  }

  const [dishCreateData, setDishCreateData] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    register,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      dishes: [],
      requireSelection: false,
      required_rule: '',
      quantity: '',
      requireHowManySelection: false,
      max_selection: ''
    }
  })

  const [dishes, setDishes] = useState([])

  const [selectedDishIds, setSelectedDishIds] = useState([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // const [selectedDishId, setSelectedDishId] = useState(null)

  const dialogProps = {
    data: '' //selectedDishId
  }

  //Delete Dialog Open State
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const [loading, setLoading] = useState(false)

  const filteredDishes = dishes.filter(dish => selectedDishIds.includes(dish._id))

  const abortController = useRef(null)

  const requireSelection = watch('requireSelection')
  const requireHowManySelection = watch('requireHowManySelection')

  // const openEditDishDialog = dish => {
  //   console.log('Editing dish:', dish)
  //   setSelectedDishId(dish?._id)
  //   setIsDialogOpen(true)
  // }

  // Fetch categories
  useEffect(() => {
    if (editId) {
      const fetchModifier = async () => {
        try {
          const response = await axiosApiCall.get(`${API_ROUTER.GET_MODIFIER_DISH}/${editId}`)
          const data = response?.data?.response

          setValue('name', data.name)
          setValue('requireSelection', data.requireCustomerToSelectDish)
          setValue('quantity', data.quantity)
          setValue('requireHowManySelection', data.what_the_maximum_amount_of_item_customer_can_select)
          setValue('max_selection', data.max_selection)
          setValue('required_rule', data.required_rule)

          const dishIds = (data.dishIds || []).map(dish => dish._id)

          setSelectedDishIds(dishIds)
          setValue('dishes', dishIds)
          trigger('dishes')
        } catch (error) {
          toastError('Failed to fetch details for editing.')
        }
      }

      fetchModifier()
    }
  }, [editId, setValue])

  useEffect(() => {
    if (requireSelection) {
      control.register('quantity')
    } else {
      control.unregister('quantity')
    }
  }, [requireSelection, control])

  useEffect(() => {
    if (requireHowManySelection) {
      control.register('max_selection')
    } else {
      control.unregister('max_selection')
    }
  }, [requireHowManySelection, control])

  useEffect(() => {
    fetchDishes()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [dishCreateData])

  useEffect(() => {
    register('dishes')
  }, [register])

  const fetchDishes = async () => {
    try {
      if (abortController.current) {
        abortController.current.abort()
      }

      abortController.current = new AbortController()
      setLoading(true)

      const response = await axiosApiCall.get(API_ROUTER.GET_FOOD_DISH, {
        signal: abortController.current.signal
      })

      const dishesData = response?.data?.response?.dishes || []

      const dishIds = dishesData.map(dish => dish._id)

      setDishes(dishesData)
      setValue('dishes', dishIds)
      await trigger('dishes')

      if (!editId) {
        setSelectedDishIds([dishCreateData?.response?._id || null])
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message || 'Failed to fetch dishes')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async editId => {
    try {
      const response = await axiosApiCall.delete(`${API_ROUTER.DELETE_FOOD_MODIFIER}/${editId}`)

      if (response?.status === 200) {
        handleBackToTabs(tabValue)
        toastSuccess(response?.data?.message)
        onSuccess()
      } else {
        toastError('Failed to delete Modifier.')
      }
    } catch (error) {
      // toastError('An error occurred while deleting the Modifier.')
    } finally {
      setOpen(false)
    }
  }

  const handleChange = event => {
    const value = event.target.value

    setSelectedDishIds(value)
    setValue('dishes', value)
    trigger('dishes')
    // setSelectedDishIds(event.target.value)
  }

  const onSubmit = async data => {
    // Transform data for the API
    const transformedData = {
      name: data.name.toString(),
      dishIds: selectedDishIds,
      requireCustomerToSelectDish: data.requireSelection,
      quantity: data.quantity,
      what_the_maximum_amount_of_item_customer_can_select: data.requireHowManySelection,
      max_selection: data.max_selection
    }

    // Include required_rule only if it exists
    if (data.required_rule) {
      transformedData.required_rule = data.required_rule.toLowerCase()
    }

    try {
      setIsSubmitting(true)

      let response

      if (editId) {
        // Edit Mode
        response = await axiosApiCall.patch(`${API_ROUTER.ADD_MODIFIER_DISH}/${editId}`, transformedData, {})
      } else {
        // Create Mode
        response = await axiosApiCall.post(API_ROUTER.ADD_MODIFIER_DISH, transformedData, {})
      }

      const responseBody = response?.data

      // Show success toast
      toastSuccess(responseBody?.message)

      // Navigate back to tabs
      handleBackToTabs(tabValue)
    } catch (error) {
      if (!isCancel(error)) {
        const errorMessage = apiResponseErrorHandling(error)

        // Show error toast
        toastError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Typography variant='h6' fontWeight='bold' mb={3}>
        {editId ? t('form.label.edit_modify_group') : t('form.label.add_modify_group')}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.label.name')}
                  variant='outlined'
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id='dish-select-label'> {t('form.label.select_dishes')}</InputLabel>
              <Select
                labelId='dish-select-label'
                multiple
                value={selectedDishIds.filter(id => dishes.some(d => d._id === id))}
                onChange={handleChange}
                input={<OutlinedInput label={t('form.label.select_dishes')} />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected
                      .map(id => dishes.find(d => d._id === id))
                      .filter(dish => dish && dish.name && dish.name.trim() !== '')
                      .map(dish => (
                        <Chip
                          key={dish._id}
                          label={dish.name}
                          sx={{ display: 'flex', alignItems: 'center' }}
                          // onMouseDown={e => e.stopPropagation()}
                          // deleteIcon={
                          // <EditIcon
                          //   fontSize='small'
                          //   onClick={e => {
                          //     e.stopPropagation()
                          //     openEditDishDialog(dish)
                          //   }}
                          // />
                          // }
                          onDelete
                        />
                      ))}
                  </Box>
                )}
              >
                {Array.isArray(dishes) && dishes.length > 0 ? (
                  dishes
                    .filter(dish => dish.name && dish.name.trim() !== '')
                    .map(dish => (
                      <MenuItem key={dish._id} value={dish._id}>
                        {dish.name}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>No dishes available</MenuItem>
                )}
              </Select>
              <Typography color='error' variant='caption'>
                {errors.dishes?.message}
              </Typography>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps}
              dialog={AddDishDialog}
              dialogProps={dialogProps}
              setDishCreateData={setDishCreateData}
              openFromParent={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
            />
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                {t('form.label.rules')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='requireSelection'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t('form.label.require_customers_to_select_a_dish')}
                  />
                )}
              />
            </Grid>

            {requireSelection && (
              <>
                <Grid item xs={6}>
                  <Controller
                    name='required_rule'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} fullWidth error={!!errors.required_rule}>
                        <MenuItem value='exactly'>{t('form.label.exactly')}</MenuItem>
                        <MenuItem value='atleast'>{t('form.label.at_least')}</MenuItem>
                        <MenuItem value='maximum'>{t('form.label.maxi_mum')}</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.required_rule && <Typography color='error'>{errors.required_rule.message}</Typography>}
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name='quantity'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type='text'
                        label={t('form.label.quantity')}
                        variant='outlined'
                        fullWidth
                        error={!!errors.quantity}
                        helperText={errors.quantity?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Controller
                name='requireHowManySelection'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t('form.label.what_is_the_maximum_number_of_dishes_customers_can_select?')}
                  />
                )}
              />
            </Grid>

            {requireHowManySelection && (
              <Grid item xs={6}>
                <Controller
                  name='max_selection'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type='text'
                      label={t('form.label.max_selection')}
                      variant='outlined'
                      fullWidth
                      error={!!errors.max_selection}
                      helperText={errors.max_selection?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>

          <div>
            <Typography variant='h5' component='h1' gutterBottom>
              {t('form.label.ingredients')}
            </Typography>

            {filteredDishes.length > 0 ? (
              <TableContainer component={Paper} elevation={3} style={{ borderRadius: '10px' }}>
                <Table>
                  {/* Table Header */}
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('form.label.name')}</TableCell>
                      <TableCell style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {t('form.label.ingredients')}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  {/* Table Body */}
                  <TableBody>
                    {filteredDishes.map(dish => (
                      <TableRow key={dish._id}>
                        <TableCell>{dish.name}</TableCell>
                        <TableCell>
                          {/* Nested Table for Ingredients */}
                          <TableContainer component={Paper} style={{ borderRadius: '5px', marginTop: '10px' }}>
                            <Table size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ fontWeight: 'bold' }}>{t('form.label.ingredients')}</TableCell>
                                  <TableCell style={{ fontWeight: 'bold' }}>{t('form.label.unit')}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dish.ingredients.map((ingredient, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{ingredient.name}</TableCell>
                                    <TableCell>
                                      {ingredient.quantity}
                                      {ingredient.unit}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant='body1' color='textSecondary'>
                {t('form.validation.no_dishes_selected.')}
              </Typography>
            )}
          </div>
        </Grid>

        {/* Action Buttons */}
        <Box mt={3} display='flex' justifyContent='flex-end' gap={2}>
          <Button type='submit' variant='contained' color='success'>
            {isSubmitting ? t('common.saving') : editId ? t('form.button.update') : t('form.button.save')}
          </Button>
          {editId && (
            <div>
              <Button variant='contained' color='error' onClick={handleClickOpen}>
                {t('form.button.delete')}
              </Button>
              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
              >
                <DialogTitle id='alert-dialog-title'>{t('form.button.delete')}</DialogTitle>
                <DialogContent>
                  <DialogContentText id='alert-dialog-description'>
                    {t('dialog.delete_category_confirmation')}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color='primary'>
                    {t('form.button.cancel')}
                  </Button>
                  <Button onClick={() => handleDelete(editId)} color='error' autoFocus>
                    {t('form.button.delete')}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          )}
        </Box>
      </form>
    </Box>
  )
}
