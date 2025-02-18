import React, { useState, useEffect, useRef } from 'react'

import { useParams } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'

import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'

import axiosApiCall from '@/utils/axiosApiCall'

import { toastError, toastSuccess, apiResponseErrorHandling } from '@/utils/globalFunctions'

import { API_ROUTER } from '@/utils/apiRoutes'

import { useTranslation } from '@/utils/getDictionaryClient'

function AddCategoryForm({ handleBackToTabs, tabValue, editId }) {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  //Validtion Handler
  const schema = yup.object().shape({
    categoryName: yup.string().required(t('form.validation.category_name')),
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
      })
  })

  //Category Image State

  const [imageURL, setImageURL] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  //Delete Dialog Open State
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryName: '',
      file: null
    }
  })

  // Category Edit Flow
  useEffect(() => {
    if (editId) {
      const fetchCategoryDetails = async () => {
        try {
          const response = await axiosApiCall.get(`${API_ROUTER.GET_FOOD_CATEGORY}/${editId}`)
          const category = response?.data?.response || {}

          setValue('categoryName', category.name || '')

          if (category.imageUrl) {
            setImageURL(category.imageUrl)
          }
        } catch (error) {
          toastError('Failed to fetch category details.')
        }
      }

      fetchCategoryDetails()
    }
  }, [editId, setValue])

  //Category Delete Flow

  const handleDelete = async editId => {
    try {
      const response = await axiosApiCall.delete(`${API_ROUTER.DELETE_FOOD_CATEGORY}/${editId}`)

      if (response?.status === 200) {
        handleBackToTabs(tabValue)

        toastSuccess(response?.data?.message)

        onSuccess()
      } else {
        toastError(response?.data?.message)
      }
    } catch (error) {
      // toastError('An error occurred while deleting the category.')
    } finally {
      setOpen(false)
    }
  }

  //Image Upload Code

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setValue('file', file || null, { shouldValidate: true })

      setImageURL(file ? URL.createObjectURL(file) : '')
    } else {
      toastError(t('form.validation.please_select_valid_file'))
    }
  }

  //Add Category API Function

  const addCategory = async data => {
    const formData = new FormData()

    formData.append('name', data.categoryName)

    formData.append('file', data.file)

    try {
      const response = await axiosApiCall.post(API_ROUTER.ADD_FOOD_CATEGORY, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toastSuccess(response?.data?.message)

      handleBackToTabs(tabValue)
    } catch (error) {
      const errorMessage = apiResponseErrorHandling(error)

      toastError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  //Update Category API Function

  const editCategory = async data => {
    const formData = new FormData()

    formData.append('name', data.categoryName)

    if (data.file instanceof File) {
      formData.append('file', data.file)
    }

    try {
      const response = await axiosApiCall.patch(`${API_ROUTER.UPDATE_FOOD_CATEGORY}/${editId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toastSuccess(response?.data?.message)

      handleBackToTabs(tabValue)
    } catch (error) {
      const errorMessage = apiResponseErrorHandling(error)

      toastError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = data => {
    setIsSubmitting(true)

    if (editId) {
      editCategory(data)
    } else {
      addCategory(data)
    }
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, backgroundColor: '#ffffff' }}>
      <Typography variant='h6' fontWeight='bold' mb={3}>
        {editId ? t('form.label.edit_category') : t('form.label.add_category')}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={12} md={6}>
            <Typography mb={1} variant='body1' color='textSecondary'>
              {t('form.label.category_name')}
            </Typography>
            <Controller
              name='categoryName'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder={t('form.placeholder.category_name')}
                  variant='outlined'
                  size='small'
                  error={!!errors.categoryName}
                  helperText={errors.categoryName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography mb={1} variant='body1' color='textSecondary'>
              {t('form.label.category_image')}
            </Typography>
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

export default AddCategoryForm
