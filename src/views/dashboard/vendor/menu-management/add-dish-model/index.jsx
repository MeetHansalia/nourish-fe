// React Imports
import React, { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

// Third-party Imports
import * as yup from 'yup'

import { useForm, Controller, useFieldArray } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

// MUI Imports
import {
  Grid,
  Dialog,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Card
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

// Utility Imports
import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'

import { toastError, toastSuccess } from '@/utils/globalFunctions'

import { useTranslation } from '@/utils/getDictionaryClient'
import CustomTextField from '@/@core/components/mui/TextField'

const AddDishDialog = ({ open, setOpen, mode, data, setDishCreateData, dialogProps }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  // Validation Schema
  const schema = yup.object().shape({
    name: yup.string().required(t('form.validation.dish_name')),
    file: yup
      .mixed()
      .nullable()
      .test('fileRequired', t('form.validation.image_required'), value => {
        return value instanceof File
      })
      .test('fileType', t('form.validation.invalid_file_type'), value => {
        return !value || (value instanceof File && value.type.startsWith('image/'))
      })
      .test('fileSize', t('form.validation.category.file_size_exceeded'), value => {
        return !value || (value instanceof File && value.size <= 2 * 1024 * 1024)
      }),
    description: yup.string().required(t('form.validation.dish_description')),
    pricing: yup.number().typeError(t('form.validation.price_must_be')).required(t('form.validation.price')),
    tax_pricing: yup
      .number()
      .typeError(t('form.validation.tax_pricing_be_a_number'))
      .required(t('form.validation.tax_pricing')),
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
    reset,
    register,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: data?.name || '',
      description: data?.description || '',
      pricing: data?.pricing || 0,
      tax_pricing: data?.tax_pricing || 0,
      ingredients: data?.ingredients || [{ name: '', quantity: '', unit: '' }],
      file: null
    }
  })

  const [imageURL, setImageURL] = useState('')

  console.log('imageURL', imageURL)

  //Image Upload Code

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  })

  const handleClose = () => {
    setOpen(false)
    reset(data) // Reset to the original data
  }

  useEffect(() => {
    if (mode === 'edit' && data) {
      reset(data) // Prefill form for edit mode
    } else {
      reset({
        name: '',
        description: '',
        pricing: 0,
        tax_pricing: 0,
        ingredients: [{ name: '', quantity: '', unit: '' }]
      }) // Clear form for add mode
    }
  }, [mode, data, reset])

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setValue('file', file || null, { shouldValidate: true })

      setImageURL(file ? URL.createObjectURL(file) : '')
    } else {
      toastError('Please select a valid file.')
    }
  }

  const onSubmit = async formData => {
    try {
      if (mode === 'add') {
        // Perform add API call
        const response = await axiosApiCall.post(API_ROUTER.ADD_FOOD_DISH, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const responseBody = response?.data

        setDishCreateData(responseBody)

        if (responseBody.status === true) {
          setImageURL('')
          toastSuccess(responseBody?.message)
          handleClose()
        }
      } else if (mode === 'edit') {
        // Perform edit API call
        const response = await axiosApiCall.put(`${API_ROUTER.EDIT_FOOD_DISH}/${data.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const responseBody = response?.data

        setDishCreateData(responseBody)

        if (responseBody.status === true) {
          toastSuccess(responseBody?.message)
          handleClose()
        }
      }
    } catch (error) {
      toastError(error?.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <Card className='common-block-dashboard'>
        <DialogTitle>{mode === 'add' ? t('form.label.add_dish') : t('form.label.edit_dish')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('form.label.dish_name')}
                      variant='outlined'
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                /> */}
                <div className='form-group'>
                  <Controller
                    name='name'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        placeholder={t('form.placeholder.enter_dish_name')}
                        variant='outlined'
                        size='small'
                        label={t('form.label.dish_name')}
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </div>
              </Grid>

              {/* Description Field */}
              <Grid item xs={12}>
                <div className='form-group'>
                  <Controller
                    name='description'
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
                        {...register('description')}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </div>
                {/* <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('form.label.dish_description')}
                      variant='outlined'
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                /> */}
              </Grid>

              {/* Pricing Fields */}
              <Grid item xs={6}>
                <div className='form-group'>
                  <Controller
                    name='pricing'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        placeholder={t('form.placeholder.pricing')}
                        variant='outlined'
                        size='small'
                        label={t('form.label.price')}
                        {...register('pricing')}
                        error={!!errors.pricing}
                        helperText={errors.pricing?.message}
                      />
                    )}
                  />
                </div>
                {/* <Controller
                  name='pricing'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('form.label.price')}
                      type='number'
                      variant='outlined'
                      fullWidth
                      error={!!errors.pricing}
                      helperText={errors.pricing?.message}
                    />
                  )}
                /> */}
              </Grid>
              <Grid item xs={6}>
                <div className='form-group address-fill-common'>
                  <Controller
                    name='tax_pricing'
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
                {/* <Controller
                  name='tax_pricing'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('form.label.tax_pricing')}
                      type='number'
                      variant='outlined'
                      fullWidth
                      error={!!errors.tax_pricing}
                      helperText={errors.tax_pricing?.message}
                    />
                  )}
                /> */}
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display='flex' alignItems='center' gap={2}>
                  <label htmlFor='image-upload'>
                    <input
                      accept='image/*'
                      style={{ display: 'none' }}
                      id='image-upload'
                      type='file'
                      onChange={handleImageChange}
                    />
                    <Button variant='outlined' component='span'>
                      {t('common.upload_img')}
                    </Button>
                  </label>
                  {imageURL && (
                    <img
                      src={imageURL}
                      alt='Uploaded'
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                  {errors.file && (
                    <Typography variant='caption' color='error'>
                      {errors.file.message}
                    </Typography>
                  )}
                </Box>
              </Grid>
              {/* Ingredients */}
              <Grid item xs={12}>
                <Typography mb={2}>{t('form.label.add_ingredient')}</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('form.label.name')}</TableCell>
                        <TableCell>{t('form.label.quantity')}</TableCell>
                        <TableCell>{t('form.label.unit')}</TableCell>
                        <TableCell>{t('datatable.column.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((ingredient, index) => (
                        <TableRow key={ingredient.id}>
                          <TableCell>
                            <Controller
                              name={`ingredients.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  variant='outlined'
                                  fullWidth
                                  placeholder={t('form.placeholder.name')}
                                  error={!!errors.ingredients?.[index]?.name}
                                  helperText={errors.ingredients?.[index]?.name?.message}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`ingredients.${index}.quantity`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  placeholder={t('form.placeholder.enter_quantity')}
                                  variant='outlined'
                                  fullWidth
                                  error={!!errors.ingredients?.[index]?.quantity}
                                  helperText={errors.ingredients?.[index]?.quantity?.message}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
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
                          </TableCell>

                          <TableCell>
                            <IconButton color='error' onClick={() => remove(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => append({ name: '', quantity: '', unit: '' })}
                  sx={{ mt: 2 }}
                >
                  {t('form.label.add_ingredient')}
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' type='submit'>
              {mode === 'add' ? t('form.button.save') : t('form.common.update')}
            </Button>
            <Button variant='outlined' onClick={handleClose}>
              {t('form.button.cancel')}
            </Button>
          </DialogActions>
        </form>
      </Card>
    </Dialog>
  )
}

export default AddDishDialog
