// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  TextField,
  Tooltip,
  Card,
  CardContent
} from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { useInView } from 'react-intersection-observer'
import { isCancel } from 'axios'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { addDays, format } from 'date-fns'

import TruncatedTextWithModal from '@/components/TruncatedTextWithModal'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@/@core/components/mui/Avatar'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'
import { useTranslation } from '@/utils/getDictionaryClient'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { API_ROUTER } from '@/utils/apiRoutes'

/**
 * Page
 */
const ViewMenuDialog = props => {
  // Props
  const { viewMenuDialog, singleVendor, setViewMenuDialog, threshhold, dialogProps } = props

  // States

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const [categories, setCategories] = useState([])
  const [allDishes, setAllDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeId, setActiveId] = useState(null)

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    title: yup.string().required(t('form.validation.required')),
    vendorId: yup.string().required(t('form.validation.required')),
    isRecurring: yup.boolean(),
    recurringEndDate: yup
      .date()
      .nullable()
      .when('isRecurring', {
        is: true,
        then: () => yup.date().required(t('form.validation.required'))
      })
  })

  const defaultValues = {
    id: '',
    title: '',
    vendorId: '',
    start: null,
    extendedProps: {},
    isRecurring: false,
    recurringEndDate: null
  }

  const {
    control,
    setValue,
    reset,
    clearErrors,
    handleSubmit,
    watch,
    getValues,
    formState: { errors }
  } = useForm({ resolver: yupResolver(formValidationSchema), defaultValues: defaultValues })

  const CARD_TITLE_DATA = [
    {
      title: t('page.food_chart_creation.minimum_order_threshhold'),
      // link: 'parent-registration-request',
      key: 'minThresHold'
    }
    // {
    //   title: t('page.food_chart_creation.total_review'),
    //   // link: 'complete-orders',
    //   key: ''
    // }
  ]

  useEffect(() => {
    console.log(singleVendor)
    axiosApiCall
      .get(API_ROUTER.SCHOOL_ADMIN.GET_ALL_CATEGORIES(singleVendor))
      .then(response => {
        const fetchedCategories = response?.data?.response?.data?.categories || []
        const allFetchedDishes = fetchedCategories.flatMap(cat => cat.dishes || [])

        setCategories(fetchedCategories)
        setAllDishes(allFetchedDishes)
        setFilteredDishes(allFetchedDishes)

        if (fetchedCategories.length > 0) {
          setSelectedCategory(null)
        }

        // setIsDataLoaded(true)
      })
      .catch(error => {
        // setIsDataLoaded(true)
      })
  }, [singleVendor])

  const handleSidebarClose = () => {
    setViewMenuDialog(false)
  }

  const handleSelectCategory = category => {
    setSelectedCategory(category)

    if (category) {
      setFilteredDishes(category.dishes || [])
    } else {
      setFilteredDishes(allDishes)
    }
  }

  /** Page Life Cycle: End */

  return (
    <Dialog
      open={viewMenuDialog}
      onClose={handleSidebarClose}
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      className='common-modal-theme full-modal'
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {t('page.food_chart_creation.vendor_menu')}
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pli-16'>
        <DialogCloseButton onClick={handleSidebarClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>

        {CARD_TITLE_DATA?.map((card, index) => (
          <div className='card-block' key={index}>
            <Card className='card-link-a'>
              <CardContent className='flex flex-col gap-1'>
                <div className='flex items-center gap-4'>
                  <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                    <i className='tabler-clipboard-check text-xl' />
                  </CustomAvatar>
                  <div className='card-text-top'>
                    <Typography variant='h4'>{card.title}</Typography>
                    <Typography variant='body2' color='text.disabled'>
                      Last Month
                    </Typography>
                  </div>
                </div>
                <Typography variant='h4' color='text.primary'>
                  {threshhold}
                </Typography>
              </CardContent>
            </Card>
          </div>
        ))}
        <Typography variant='body2' mb={1}>
          <strong>{t('page.vendor_profile.vendor_name')}:</strong>{' '}
          {`${dialogProps?.first_name} ${dialogProps?.last_name}`}
        </Typography>
        <Typography variant='body2' mb={1}>
          <strong>{t('page.vendor_profile.email_address')}:</strong> {dialogProps?.email}
        </Typography>
        <Typography variant='body2' mb={1}>
          <strong>{t('page.vendor_profile.restaurant_name')}:</strong> {dialogProps?.companyName}
        </Typography>
        <Typography variant='body2' mb={1}>
          <strong>{t('page.vendor_profile.phone_number')}:</strong> {dialogProps?.phoneNo}
        </Typography>
        <Typography variant='body2'>
              <strong>{t('form.label.address')}:</strong> {dialogProps?.location?.address || 'N/A'}
            </Typography>
        <div className='multi-order-custom'>
          <div className='common-block-dashboard p-0'>
            <div className='common-form-dashboard flex justify-between items-center'>
              <div className='flex items-center gap-4'>
                <div className='form-group'>
                  <TextField
                    size='small'
                    // placeholder={dictionary?.common?.search}
                    // value={searchQuery}
                    // onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className='card-category-img'>
              <CardContent className='p-0 overflow-x-auto flex gap-4 overflow-x-auto'>
                <div
                  className={`card-category-img-first cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 ${
                    selectedCategory === null ? 'bg-green-100' : ''
                  }`}
                  onClick={() => handleSelectCategory(null)}
                >
                  <Typography className='font-medium text-center'>{t('form.label.all')}</Typography>
                </div>

                {categories.map(category => (
                  <div
                    key={category._id}
                    className={`card-category-img-common cursor-pointer border flex items-center gap-2 ${
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
                    return (
                      <Grid item xs={12} sm={6} md={6} key={`${dish._id}`}>
                        <div className='menu-selection-block-inner p-4 flex gap-2 relative cursor-pointer'>
                          <div className='menu-selection-block-inner-content text-left'>
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
                          <div className='menu-selection-block-inner-img'>
                            {/* Dish image with tooltip */}
                            <Tooltip title={`Ingredients: ${dish.ingredients.map(ing => ing.name).join(', ')}`} arrow>
                              <img
                                src={dish.image || 'https://via.placeholder.com/150'}
                                alt={dish.name}
                                className='object-cover rounded-lg'
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </Grid>
                    )
                  })
                ) : (
                  <Typography variant='body1' color='textSecondary' className='text-center w-full'>
                    {t('meal.no_dishes_found')}.
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewMenuDialog
