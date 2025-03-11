import React, { useEffect, useMemo, useState } from 'react'

import { useParams } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'

import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Card,
  CardHeader,
  CardContent
} from '@mui/material'

import AddCircleIcon from '@mui/icons-material/AddCircle'

import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'

import { isCancel } from 'axios'

import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'

import { toastError, apiResponseErrorHandling, toastSuccess } from '@/utils/globalFunctions'

import { useTranslation } from '@/utils/getDictionaryClient'
import CustomTextField from '@/@core/components/mui/TextField'

function AddDishForm({ onSave, onDelete, handleBackToTabs, tabValue, editId }) {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const [imageURL, setImageURL] = useState('')
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [comboMeal, setComboMeal] = useState(false)
  const [modifierList, setModifierList] = useState([])
  const [selectedModifierList, setSelectedModifierList] = useState([])

  const validationSchema = useMemo(
    () =>
      yup.object({
        dishName: yup.string().required(t('form.validation.dish_name')),
        dishDescription: yup.string().required(t('form.validation.dish_description')),
        category: yup
          .array()
          .of(yup.string().required(t('form.validation.each_category_must_string')))
          .min(1, t('form.validation.you_must_select_at_least_one_category'))
          .required(t('form.validation.category_field_is_required')),
        price: yup.number().typeError(t('form.validation.price_must_be')).required(t('form.validation.price')),
        tax_pricing: yup
          .number()
          .typeError(t('form.validation.tax_pricing_be_a_number'))
          .required(t('form.validation.tax_pricing')),
        file: yup
          .mixed()
          .nullable()

          .test('fileRequired', t('form.validation.image_required'), value => {
            if (!editId) return value instanceof File

            return true
          })

          .test('fileType', t('form.validation.invalid_file_type'), value => {
            return !value || (value instanceof File && value.type.startsWith('image/'))
          })

          .test('fileSize', t('form.validation.category.file_size_exceeded'), value => {
            return !value || (value instanceof File && value.size <= 2 * 1024 * 1024)
          }),

        comboMeal: yup.boolean(),

        ingredients: yup
          .array()

          .test('ingredients-required', t('form.validation.min'), function (value) {
            if (!comboMeal && (!value || value.length === 0)) {
              return this.createError({ message: t('form.validation.min') })
            }

            return true
          })

          .of(
            yup.object().shape({
              name: yup.string().test('name-required', t('form.validation.name'), function (value) {
                if (!comboMeal && !value) {
                  return this.createError({ message: t('form.validation.name') })
                }

                return true
              }),
              quantity: yup.string().test('quantity-required', t('form.validation.quantity'), function (value) {
                if (!comboMeal && !value) {
                  return this.createError({ message: t('form.validation.quantity') })
                }

                return true
              }),
              unit: yup.string().test('unit-required', t('form.validation.unit'), function (value) {
                if (!comboMeal && !value) {
                  return this.createError({ message: t('form.validation.unit') })
                }

                return true
              })
            })
          )
      }),
    [comboMeal]
  )

  const {
    control,
    handleSubmit,
    register,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      dishName: '',
      dishDescription: '',
      category: categoriesList,
      modifier: modifierList,
      price: '',
      tax_pricing: '',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      file: null,
      comboMeal: comboMeal
    },
    resolver: yupResolver(validationSchema)
  })

  const handleComboMealChange = event => {
    const newComboMealValue = event.target.checked

    setComboMeal(newComboMealValue)

    // Update ingredients correctly based on the new comboMeal state
    const updatedIngredients = newComboMealValue
      ? [{ name: '', quantity: '', unit: '' }] // Reset ingredients if comboMeal is enabled
      : getValues('ingredients')?.length > 0
        ? getValues('ingredients') // Restore previous ingredients if available
        : [{ name: '', quantity: '', unit: '' }]

    setValue('ingredients', updatedIngredients)
    setIngredients(updatedIngredients) // Ensure local state stays in sync

    // Ensure validation runs after state updates
    setTimeout(() => {
      trigger('ingredients')
    }, 100)
  }

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Fetch dish details for edit mode
  useEffect(() => {
    if (editId) {
      const fetchDishDetails = async () => {
        try {
          const response = await axiosApiCall.get(`${API_ROUTER.GET_FOOD_DISH}/${editId}`)

          const dishData = response?.data?.response

          if (dishData) {
            const isComboMeal = dishData?.is_combo_meal === true

            reset({
              dishName: dishData.name || '',
              dishDescription: dishData.description || '',
              price: dishData.pricing || '',
              tax_pricing: dishData.tax_pricing || '',
              category: dishData?.categoryIds || [],
              ingredients: isComboMeal
                ? [{ name: '', quantity: '', unit: '' }] // ✅ Reset ingredients when `comboMeal` is true
                : dishData?.ingredients || [{ name: '', quantity: '', unit: '' }]
            })

            setComboMeal(isComboMeal) // ✅ Update state

            // ✅ Ensure ingredients are set correctly
            setIngredients(
              isComboMeal
                ? [{ name: '', quantity: '', unit: '' }]
                : dishData?.ingredients || [{ name: '', quantity: '', unit: '' }]
            )

            setSelectedCategories(dishData?.categoryIds)
            setValue('category', dishData?.categoryIds)
            trigger('category')

            setSelectedModifierList(dishData?.modifierIds)

            if (dishData.image) {
              setImageURL(dishData.image)
            }
          }
        } catch (error) {
          console.error('Failed to fetch dish details', error)
          // toastError('Failed to fetch dish details.');
        }
      }

      fetchDishDetails()
    }
  }, [editId, reset, setValue, trigger])

  // Fetch categories
  useEffect(() => {
    const abortController = new AbortController()

    const getAllCategories = async () => {
      try {
        const response = await axiosApiCall.get(API_ROUTER.GET_FOOD_CATEGORY, {
          signal: abortController.signal
        })

        setCategoriesList(response?.data?.response?.categories || [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          toastError(error?.response?.data?.message || 'Failed to fetch categories')
        }
      }
    }

    getAllCategories()

    return () => {
      abortController.abort()
    }
  }, [])

  // Fetch Modifiers
  useEffect(() => {
    const abortController = new AbortController()

    const getAllModifiers = async () => {
      try {
        const response = await axiosApiCall.get(API_ROUTER.GET_MODIFIER_DISH, {
          signal: abortController.signal
        })

        setModifierList(response?.data?.response?.modifiers || [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          toastError(error?.response?.data?.message || 'Failed to fetch categories')
        }
      }
    }

    getAllModifiers()

    return () => {
      abortController.abort()
    }
  }, [])

  // Category Handle Chanege

  const handleChange = event => {
    const value = event.target.value

    setSelectedCategories(value)
    setValue('category', value)
    trigger('category')
  }

  const handleRemoveCategory = categoryToRemove => {
    const updatedList = categoriesList.filter(category => category !== categoryToRemove)

    setSelectedCategories(updatedList)
    setValue('category', updatedList)
    trigger('category')
  }

  // Modifier Handle Chanege

  const handleModifierChange = event => {
    const value = event.target.value

    setSelectedModifierList(value)
    // setValue('modifier', value)
    // trigger('modifier')
  }

  const handleRemoveModifier = modifierToRemove => {
    const updatedList = selectedModifierList.filter(modifier => modifier !== modifierToRemove)

    setSelectedModifierList(updatedList)

    // setValue('modifier', updatedList)

    // trigger('modifier')
  }

  const handleDelete = async editId => {
    try {
      const response = await axiosApiCall.delete(`${API_ROUTER.DELETE_DISH_CATEGORY}/${editId}`)

      if (response?.status === 200) {
        handleBackToTabs(tabValue)
        toastSuccess(response?.data?.message)
        onSuccess()
      } else {
        toastError(response?.data?.message)
      }
    } catch (error) {
      // toastError('An error occurred while deleting the dish.')
    } finally {
      setOpen(false)
    }
  }

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setValue('file', file || null, { shouldValidate: true })
      setImageURL(URL.createObjectURL(file))
    } else {
      toastError(t('form.validation.please_select_valid_file'))
    }
  }

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients]

    updatedIngredients[index][field] = value
    setIngredients(updatedIngredients)
    setValue('ingredients', updatedIngredients)
    trigger('ingredients')
  }

  const addIngredient = () => {
    const updatedIngredients = [...ingredients, { name: '', quantity: '', unit: '' }]

    setIngredients(updatedIngredients)

    setValue('ingredients', updatedIngredients)

    trigger('ingredients')
  }

  const removeIngredient = index => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index)

    setIngredients(updatedIngredients)
    setValue('ingredients', updatedIngredients)
    trigger('ingredients')
  }

  const onSubmit = async data => {
    console.log('data', data)
    const formData = new FormData()

    formData.append('name', data.dishName)

    formData.append('description', data.dishDescription)

    formData.append('is_combo_meal', comboMeal)

    if (data.file) {
      formData.append('file', data.file)
    }

    selectedCategories.forEach((id, index) => {
      formData.append(`categoryIds[${index}]`, id)
    })

    selectedModifierList.forEach((id, index) => {
      formData.append(`modifierIds[${index}]`, id)
    })

    formData.append('pricing', parseFloat(data.price))
    formData.append('tax_pricing', parseFloat(data.tax_pricing))

    if (data.ingredients && data.ingredients.length > 0) {
      data.ingredients.forEach((ingredient, index) => {
        Object.keys(ingredient).forEach(key => {
          if (ingredient[key] !== undefined && ingredient[key] !== null && ingredient[key] !== '') {
            formData.append(`ingredients[${index}][${key}]`, ingredient[key])
          }
        })
      })
    }

    try {
      setIsSubmitting(true)

      let response

      if (editId) {
        response = await axiosApiCall.patch(`${API_ROUTER.ADD_FOOD_DISH}/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        response = await axiosApiCall.post(API_ROUTER.ADD_FOOD_DISH, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      toastSuccess(response?.data?.message)

      handleBackToTabs(tabValue)

      if (onSave) onSave()
    } catch (error) {
      if (!isCancel(error)) {
        const errorMessage = apiResponseErrorHandling(error)

        toastError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='common-block-dashboard'>
      <div className='common-block-title'>
        <CardHeader className='p-0' title={editId ? t('form.label.edit_dish') : t('form.label.add_dish')} />
      </div>
      <CardContent className='p-0 common-form-dashboard'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <div className='form-group'>
                <Controller
                  name='dish_name'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      placeholder={t('form.placeholder.enter_dish_name')}
                      variant='outlined'
                      size='small'
                      label={t('form.label.dish_name')}
                      {...register('dishName')}
                      error={!!errors.dishName}
                      helperText={errors.dishName?.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className='form-group'>
                <Controller
                  name='dishDescription'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      placeholder={t('form.placeholder.enter_description_name')}
                      multiline
                      rows={3}
                      variant='outlined'
                      size='small'
                      label={t('form.label.dish_description')}
                      {...register('dishDescription')}
                      error={!!errors.dishDescription}
                      helperText={errors.dishDescription?.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className='form-group'>
                <InputLabel>{t('form.label.modifier')}</InputLabel>
                <Controller
                  name='modifier'
                  control={control}
                  rules={{ required: t('form.validation.required') }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <Select
                        {...field}
                        multiple
                        displayEmpty
                        value={field.value || []} // Ensuring default empty array
                        onChange={event => field.onChange(event.target.value)}
                        renderValue={selected =>
                          selected.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map(value => (
                                <Chip
                                  key={value}
                                  label={modifierList.find(modifier => modifier._id === value)?.name || value}
                                  onDelete={() => {
                                    field.onChange(field.value.filter(v => v !== value))
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography sx={{ color: 'gray' }}>{t('form.placeholder.enter_modifier_name')}</Typography>
                          )
                        }
                      >
                        <MenuItem disabled value=''>
                          {t('form.placeholder.enter_modifier_name')}
                        </MenuItem>
                        {modifierList.map(modifier => (
                          <MenuItem key={modifier._id} value={modifier._id}>
                            {modifier.name}
                          </MenuItem>
                        ))}
                      </Select>

                      {error && (
                        <Typography color='error' variant='caption'>
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </div>
            </Grid>

            <Grid item xs={6}>
              <div className='form-group address-fill-common'>
                <InputLabel>{t('form.label.category_name')}</InputLabel>
                <Controller
                  name='category'
                  control={control}
                  rules={{ required: t('form.validation.required') }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <FormControl fullWidth>
                        <Select
                          {...field}
                          multiple
                          displayEmpty
                          value={field.value || []}
                          onChange={event => field.onChange(event.target.value)}
                          renderValue={selected =>
                            selected.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map(value => (
                                  <Chip
                                    key={value}
                                    label={categoriesList.find(category => category._id === value)?.name || value}
                                    onDelete={() => {
                                      field.onChange(field.value.filter(v => v !== value))
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography sx={{ color: 'gray' }}>
                                {t('form.placeholder.enter_category_name')}
                              </Typography>
                            )
                          }
                        >
                          <MenuItem disabled value=''>
                            {t('form.placeholder.enter_category_name')}
                          </MenuItem>
                          {categoriesList.map(category => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Display error message separately (no red box) */}
                      {error && (
                        <Typography color='error' variant='caption'>
                          {error.message}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </div>
            </Grid>

            <Grid item xs={3}>
              <div className='form-group'>
                <Controller
                  name='price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      placeholder={t('form.placeholder.pricing')}
                      variant='outlined'
                      size='small'
                      label={t('form.label.price')}
                      {...register('price')}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group address-fill-common'>
                <Controller
                  name='price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      placeholder={t('form.placeholder.tax_pricing')}
                      variant='outlined'
                      size='small'
                      label={t('form.label.tax_pricing')}
                      {...register('tax_pricing')}
                      error={!!errors.tax_pricing}
                      helperText={errors.tax_pricing?.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group'>
                <InputLabel>{t('form.label.dish_image')}</InputLabel>
                <Box display='flex' alignItems='center' gap={2}>
                  <label htmlFor='image-upload'>
                    <input
                      accept='image/*'
                      style={{ display: 'none' }}
                      id='image-upload'
                      type='file'
                      onChange={handleImageChange}
                    />
                    <Button variant='outlined' component='span' fullWidth>
                      +
                    </Button>
                  </label>
                  {imageURL && (
                    <img
                      src={imageURL}
                      alt='Uploaded'
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                </Box>
                {errors.file && (
                  <Typography variant='caption' color='error'>
                    {errors.file.message}
                  </Typography>
                )}
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='form-group address-fill-common'>
                <Box display='flex' gap={2} alignItems='center'>
                  <FormControlLabel
                    control={
                      <Checkbox checked={comboMeal} onChange={handleComboMealChange} name='comboMeal' color='primary' />
                    }
                    label={t('form.label.combo_meal')}
                  />
                </Box>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className='form-group'>
                <InputLabel mb={2}>{t('form.label.add_ingredient')}</InputLabel>
                {ingredients.map((ingredient, index) => (
                  <Grid item xs={3} key={index}>
                    <div className='form-group'>
                      <Controller
                        name='name'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            placeholder={t('form.placeholder.name')}
                            variant='outlined'
                            size='small'
                            label={t('form.label.name')}
                            value={ingredient.name}
                            onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                            error={!!errors.ingredients?.[index]?.name}
                            helperText={errors.ingredients?.[index]?.name?.message}
                          />
                        )}
                      />
                    </div>
                    <Grid item xs={3}>
                      <div className='form-group'>
                        <Controller
                          name='quantity'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              placeholder={t('form.placeholder.enter_quantity')}
                              variant='outlined'
                              size='small'
                              label={t('form.label.quantity')}
                              value={ingredient.quantity}
                              onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                              error={!!errors.ingredients?.[index]?.quantity}
                              helperText={errors.ingredients?.[index]?.quantity?.message}
                            />
                          )}
                        />
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className='form-group address-fill-common'>
                        <InputLabel>{t('form.label.unit')}</InputLabel>
                        <Controller
                          name={`ingredients.${index}.unit`}
                          control={control}
                          rules={{ required: t('form.validation.required') }}
                          render={({ field, fieldState: { error } }) => (
                            <>
                              <FormControl fullWidth>
                                <Select
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e => field.onChange(e.target.value)}
                                  displayEmpty
                                  renderValue={selected =>
                                    selected ? (
                                      t(`form.label.${selected}`)
                                    ) : (
                                      <Typography sx={{ color: 'gray' }}>
                                        {t('form.placeholder.select_unit')}
                                      </Typography>
                                    )
                                  }
                                >
                                  <MenuItem disabled value=''>
                                    {t('form.placeholder.select_unit')}
                                  </MenuItem>

                                  <MenuItem value='kilogram'>{t('form.label.kilogram')}</MenuItem>
                                  <MenuItem value='g'>{t('form.label.gram')}</MenuItem>
                                  <MenuItem value='l'>{t('form.label.liter')}</MenuItem>
                                  <MenuItem value='ml'>{t('form.label.milliliter')}</MenuItem>
                                  <MenuItem value='pcs'>{t('form.label.pieces')}</MenuItem>
                                </Select>
                              </FormControl>

                              {/* Show error message separately, without red border */}
                              {error && (
                                <Typography color='error' variant='caption'>
                                  {error.message}
                                </Typography>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </Grid>

                    {/* <Grid item xs={3}>
                      <div className='form-group'>
                        <Controller
                          name={`ingredients.${index}.unit`} // Ensuring proper nested field name
                          control={control}
                          rules={{ required: t('form.validation.required') }}
                          render={({ field, fieldState: { error } }) => (
                            <FormControl fullWidth size='small' error={!!error}>
                              <InputLabel>{t('form.label.unit')}</InputLabel>
                              <Select
                                {...field}
                                value={field.value || ''}
                                onChange={e => field.onChange(e.target.value)}
                              >
                                <MenuItem value='kilogram'>{t('form.label.kilogram')}</MenuItem>
                                <MenuItem value='g'>{t('form.label.gram')}</MenuItem>
                                <MenuItem value='l'>{t('form.label.liter')}</MenuItem>
                                <MenuItem value='ml'>{t('form.label.milliliter')}</MenuItem>
                                <MenuItem value='pcs'>{t('form.label.pieces')}</MenuItem>
                              </Select>
                              {error && <FormHelperText>{error.message}</FormHelperText>}
                            </FormControl>
                          )}
                        />
                      </div>
                    </Grid> */}

                    {/* <FormControl fullWidth size='small' error={!!errors.ingredients?.[index]?.unit}>
                      <InputLabel> {t('form.label.unit')}</InputLabel>
                      <Select
                        value={ingredient.unit}
                        onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                      >
                        <MenuItem value='kilogram'>{t('form.label.kilogram')}</MenuItem>
                        <MenuItem value='g'>{t('form.label.gram')}</MenuItem>
                        <MenuItem value='l'>{t('form.label.liter')}</MenuItem>
                        <MenuItem value='ml'>{t('form.label.milliliter')}</MenuItem>
                        <MenuItem value='pcs'>{t('form.label.pieces')}</MenuItem>
                      </Select>
                      <FormHelperText>{errors.ingredients?.[index]?.unit?.message}</FormHelperText>
                    </FormControl> */}
                    {/* Show "+" button only for the last ingredient */}
                    {index === ingredients.length - 1 && (
                      <IconButton color='primary' onClick={addIngredient}>
                        <AddCircleIcon />
                      </IconButton>
                    )}

                    {/* Show "-" button for all ingredients except the first one */}
                    {ingredients.length > 1 && (
                      <IconButton color='error' onClick={() => removeIngredient(index)}>
                        <RemoveCircleIcon />
                      </IconButton>
                    )}
                  </Grid>
                ))}
              </div>
            </Grid>
          </Grid>

          <Box mt={3} display='flex' justifyContent='flex-end' gap={2}>
            <Button type='submit' variant='contained' color='success' disabled={isSubmitting}>
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
      </CardContent>
    </Card>
  )
}

export default AddDishForm
