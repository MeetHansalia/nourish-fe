import React, { useEffect, useState } from 'react'

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
  FormHelperText
} from '@mui/material'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'

import { isCancel } from 'axios'

import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'

import { toastError, apiResponseErrorHandling, toastSuccess } from '@/utils/globalFunctions'

import { useTranslation } from '@/utils/getDictionaryClient'

function AddDishForm({ onSave, onDelete, handleBackToTabs, tabValue, editId }) {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const [imageURL, setImageURL] = useState('')
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  const [modifierList, setModifierList] = useState([])
  const [selectedModifierList, setSelectedModifierList] = useState([])

  // Validation schema
  const schema = yup.object({
    dishName: yup.string().required(t('form.validation.dish_name')),

    dishDescription: yup.string().required(t('form.validation.dish_description')),

    // modifier: yup
    //   .array()
    //   .of(yup.string().required(t('form.validation.each_modifier_must_string')))
    //   .min(1, t('form.validation.you_must_select_at_least_one_modifier'))
    //   .required(t('form.validation.modifier_field_is_required')),

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
        if (!editId) {
          return value instanceof File
        }

        return true
      })
      .test('fileType', t('form.validation.invalid_file_type'), value => {
        return !value || (value instanceof File && value.type.startsWith('image/'))
      })
      .test('fileSize', t('form.validation.category.file_size_exceeded'), value => {
        return !value || (value instanceof File && value.size <= 2 * 1024 * 1024)
      }),

    ingredients: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required(t('form.validation.name')),
          quantity: yup.string().required(t('form.validation.quantity')),
          unit: yup.string().required(t('form.validation.unit'))
        })
      )
      .min(1, t('form.validation.min'))
  })

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
      file: null
    },
    resolver: yupResolver(schema)
  })

  //Delete Dialog Open State
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
            reset({
              dishName: dishData.name || '',
              dishDescription: dishData.description || '',

              price: dishData.pricing || '',
              tax_pricing: dishData.tax_pricing || ''
            })

            setIngredients(dishData?.ingredients)

            setSelectedCategories(dishData?.categoryIds)
            setValue('category', dishData?.categoryIds)
            trigger('category')
            setSelectedModifierList(dishData?.modifierIds)
            // setValue('modifier', dishData?.modifierIds)
            // trigger('modifier')

            if (dishData.image) {
              setImageURL(dishData.image)
            }
          }
        } catch (error) {
          // toastError('Failed to fetch dish details.')
        }
      }

      fetchDishDetails()
    } else {
      reset({
        dishName: '',
        dishDescription: '',
        category: [],
        modifier: [],
        price: '',
        tax_pricing: '',
        ingredients: [{ name: '', quantity: '', unit: '' }]
      })
    }
  }, [editId, reset])

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
    const formData = new FormData()

    formData.append('name', data.dishName)

    formData.append('description', data.dishDescription)

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

    data.ingredients?.forEach((ingredient, index) => {
      Object.keys(ingredient).forEach(key => {
        formData.append(`ingredients[${index}][${key}]`, ingredient[key])
      })
    })

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
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
      <Typography variant='h6' fontWeight='bold' mb={3}>
        {editId ? t('form.label.edit_dish') : t('form.label.add_dish')}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography mb={1}>{t('form.label.dish_name')}</Typography>
            <TextField
              fullWidth
              placeholder={t('form.placeholder.enter_dish_name')}
              variant='outlined'
              size='small'
              {...register('dishName')}
              error={!!errors.dishName}
              helperText={errors.dishName?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography mb={1}>{t('form.label.dish_description')}</Typography>
            <TextField
              fullWidth
              placeholder={t('form.placeholder.enter_description_name')}
              multiline
              rows={3}
              variant='outlined'
              size='small'
              {...register('dishDescription')}
              error={!!errors.dishDescription}
              helperText={errors.dishDescription?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('form.label.modifier')}</InputLabel>
              <Select
                fullWidth
                multiple
                value={selectedModifierList}
                onChange={handleModifierChange}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={modifierList.find(modifier => modifier._id === value)?.name || value}
                        onDelete={() => handleRemoveModifier(value)}
                      />
                    ))}
                  </Box>
                )}
              >
                {modifierList.map(modifier => (
                  <MenuItem key={modifier._id} value={modifier._id}>
                    {modifier.name}
                  </MenuItem>
                ))}
              </Select>
              {/* <Typography color='error' variant='caption'>
                {errors.modifier?.message}
              </Typography> */}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('form.label.category_name')}</InputLabel>
              <Select
                fullWidth
                multiple
                value={selectedCategories}
                onChange={handleChange}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={categoriesList.find(category => category._id === value)?.name || value}
                        onDelete={() => handleRemoveCategory(value)}
                      />
                    ))}
                  </Box>
                )}
              >
                {categoriesList.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography color='error' variant='caption'>
                {errors.category?.message}
              </Typography>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography mb={1}>{t('form.label.price')}</Typography>
            <TextField
              fullWidth
              placeholder={t('form.placeholder.pricing')}
              variant='outlined'
              size='small'
              {...register('price')}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography mb={1}>{t('form.label.tax_pricing')}</Typography>
            <TextField
              fullWidth
              placeholder={t('form.placeholder.tax_pricing')}
              variant='outlined'
              size='small'
              {...register('tax_pricing')}
              error={!!errors.tax_pricing}
              helperText={errors.tax_pricing?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography mb={1}>{t('form.label.dish_image')}</Typography>
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
          </Grid>
          <Grid container spacing={2} xs={12}>
            <Typography mb={2}>{t('form.label.add_ingredient')}</Typography>
            {ingredients.map((ingredient, index) => (
              <Grid item xs={12} key={index}>
                <Box display='flex' gap={2} alignItems='center'>
                  {/* Name Field */}
                  <TextField
                    label={t('form.label.name')}
                    size='small'
                    value={ingredient.name}
                    onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                    error={!!errors.ingredients?.[index]?.name}
                    helperText={errors.ingredients?.[index]?.name?.message}
                  />

                  {/* Quantity Field */}
                  <TextField
                    label={t('form.label.quantity')}
                    size='small'
                    value={ingredient.quantity}
                    onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                    error={!!errors.ingredients?.[index]?.quantity}
                    helperText={errors.ingredients?.[index]?.quantity?.message}
                  />

                  {/* Unit Dropdown */}
                  <FormControl fullWidth size='small' error={!!errors.ingredients?.[index]?.unit}>
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
                  </FormControl>
                  <IconButton color='primary' onClick={addIngredient}>
                    <AddCircleIcon />
                  </IconButton>
                  {ingredients.length > 1 && (
                    <IconButton color='error' onClick={() => removeIngredient(index)}>
                      <RemoveCircleIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}
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
    </Paper>
  )
}

export default AddDishForm
