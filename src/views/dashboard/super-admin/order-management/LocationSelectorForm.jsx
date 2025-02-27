'use client'

import { useEffect, useRef, useState } from 'react'

import { useParams, usePathname, useRouter } from 'next/navigation'

import { Button, Card, CardContent, CardHeader, CircularProgress, Grid, Typography } from '@mui/material'

import { isCancel } from 'axios'

import { useTranslation } from 'react-i18next'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, getPanelName, toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

const LocationSelectorForm = ({ dictionary, showButton, spacing, lg, onSchoolSelect, selectedData12, setKidName }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const pathname = usePathname()
  const panelName = getPanelName(pathname)
  const router = useRouter()

  const [countryOptions, setCountryOptions] = useState([])

  const [stateOptions, setStateOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])

  const [schools, setSchools] = useState([])
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // state for selected data
  const [selectedData, setSelectedData] = useState(() => ({
    country: selectedData12?.country || null,
    state: selectedData12?.state || null,
    district: selectedData12?.district || null,
    school: selectedData12?.school || null,
    kidName: null
  }))

  const stateController = useRef(null)
  const districtController = useRef(null)
  const getSchoolListController = useRef()
  const getCountryListController = useRef()

  const getCountryList = () => {
    // if (getCountryListController.current) {
    //   getCountryListController.current?.abort()
    // }

    getCountryListController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.GET_COUNTRIES, {
        signal: getCountryListController?.current?.signal
      })
      .then(response => {
        const responseBody = response.data
        const responseBodyData = responseBody.response

        setCountryOptions(responseBodyData?.countries || [])
      })
      .catch(error => {
        if (!isCancel(error)) {
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  // Fetch State List Based on Selected Country
  const getStateList = countryId => {
    setIsLoading(true)

    if (stateController.current) {
      stateController.current.abort()
    }

    stateController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.GET_STATES, {
        params: { country: countryId },
        signal: stateController.current.signal
      })
      .then(response => {
        setStateOptions(response.data?.response?.states || [])
        setDistrictOptions([])
        setSchools([])
        setIsLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
          toastError(error.message)
        }
      })
  }

  // Fetch District List Based on Selected State
  const getDistrictList = (stateName, countryName) => {
    setIsLoading(true)
    setSchools([])

    if (districtController.current) {
      districtController.current.abort()
    }

    districtController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.GET_DISTRICT, {
        params: { state: stateName, country: countryName },
        signal: districtController.current.signal
      })
      .then(response => {
        setDistrictOptions(response.data?.response?.districts || [])
        setSchools([])
        setIsLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
          toastError(error.message)
        }
      })
  }

  const fetchSchoolList = (countryName, stateName, districtName) => {
    setIsGetSchoolListLoading(true)

    if (getSchoolListController.current) {
      getSchoolListController.current?.abort()
    }

    getSchoolListController.current = new AbortController()

    // Construct query parameters manually
    const queryParams = new URLSearchParams()

    if (countryName) queryParams.append('country', countryName)
    if (stateName) queryParams.append('state', stateName)
    if (districtName) queryParams.append('district', districtName)
    queryParams.append('limit', 5)

    setSchools([])
    axiosApiCall
      .get(`${API_ROUTER.SUPER_ADMIN_ORDER.GET_SCHOOLS}?${queryParams.toString()}`, {
        signal: getSchoolListController?.current?.signal
      })
      // .get(v1/super-admin-order-management/schools, {
      //   //route change aya
      //   signal: getSchoolListController?.current?.signal
      // })
      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setSchools(responseBodyData?.users)

        if (selectedData12 && response?.data) {
          router.push(`/${locale}/${panelName}/order-management/monitor-orders?`)
        }
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  useEffect(() => {
    getCountryList()
  }, [])

  // passing the selected data to other page
  const handleClick = () => {
    const { country, state, district, school, kidName } = selectedData

    if (!country || !state || !district || !school) {
      console.error('All fields must be selected before proceeding.')

      return
    }

    const queryParams = new URLSearchParams({
      countryName: country?.name,
      countryId: country?._id,
      stateName: state?.name,
      stateId: state?._id,
      districtName: district?.districtName,
      districtId: district?._id,
      schoolName: school?.schoolName,
      schoolId: school?._id,
      ...(kidName && { kidName })
    }).toString()

    router.push(`/${locale}/${panelName}/order-management/monitor-orders?${queryParams}`)
  }

  // setting the data from other page to new page for api calls
  useEffect(() => {
    if (!selectedData12) return

    if (selectedData12?.country?._id) {
      getStateList(selectedData12.country._id)
    }

    if (selectedData12?.state?.name && selectedData12?.country?.name) {
      getDistrictList(selectedData12.state.name, selectedData12.country.name)
    }

    if (selectedData12?.district?.districtName) {
      fetchSchoolList(
        selectedData12?.country?.name,
        selectedData12?.state?.name,
        selectedData12?.district?.districtName
      )
    }
  }, [selectedData12])

  // set the school after retrieving the data
  useEffect(() => {
    if (schools.length > 0 && selectedData12?.school) {
      const selectedSchool = schools.find(school => school?._id === selectedData12.school._id)

      if (selectedSchool) {
        setSelectedData(prev => ({
          ...prev,
          school: selectedSchool
        }))

        if (selectedData12.kidName) {
          setSelectedData(prev => ({
            ...prev,
            kidName: selectedData12.kidName
          }))
        }

        onSchoolSelect(selectedData12.school._id)

        if (selectedData12.kidName) {
          setKidName(selectedData12.kidName)
        }
      }
    }
  }, [schools])

  return (
    <Card className='common-block-dashboard'>
      {showButton && (
        <CardHeader
          className='common-block-title p-0'
          title={dictionary?.page?.meal_details?.meal_monitoring}
          action={
            <Button
              className='theme-common-btn theme-btn-color'
              variant='contained'
              sx={{ bgcolor: 'green', color: 'white' }}
              onClick={() => handleClick()}
            >
              {dictionary?.form?.button?.submit}
            </Button>
          }
        />
      )}
      <CardContent className='p-0'>
        <Grid container spacing={6}>
          <Grid item lg={lg} md={6} sm={12}>
            <div className='form-group'>
              <Typography className='label-block-subtitle' variant='subtitle1' sx={{ mb: 2 }}>
                {dictionary?.form?.label?.countries}
              </Typography>
              <CustomAutocomplete
                fullWidth
                options={countryOptions}
                value={selectedData?.country}
                getOptionLabel={option => option?.name || ''}
                renderInput={params => <CustomTextField {...params} placeholder={t('form.placeholder.countries')} />}
                onChange={(_, data) => {
                  setSelectedData(prev => ({
                    ...prev,
                    country: data || null,
                    state: null,
                    district: null,
                    school: null,
                    kidName: null
                  }))
                  // if (selectedData12) {
                  //   router.push(`/${locale}/${panelName}/order-management/monitor-orders?`);
                  // }
                  getStateList(data?.name)
                }}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                noOptionsText={t('form.placeholder.no_options')}
              />
            </div>
          </Grid>

          <Grid item lg={lg} md={6} sm={12}>
            <div className='form-group'>
              <Typography className='label-block-subtitle' variant='subtitle1' sx={{ mb: 2 }}>
                {dictionary?.form?.label?.state}
              </Typography>
              <CustomAutocomplete
                fullWidth
                options={stateOptions}
                value={selectedData?.state}
                getOptionLabel={option => option?.name || ''}
                renderInput={params => <CustomTextField {...params} placeholder={t('form.placeholder.state')} />}
                onChange={(_, data) => {
                  setSelectedData(prev => ({
                    ...prev,
                    state: data || null,
                    district: null,
                    school: null,
                    kidName: null
                  }))
                  getDistrictList(data?.name, data?.countryName)
                }}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                noOptionsText={t('form.placeholder.no_options')}
              />
            </div>
          </Grid>

          <Grid item lg={lg} md={6} sm={12}>
            <div className='form-group'>
              <Typography className='label-block-subtitle' variant='subtitle1' sx={{ mb: 2 }}>
                {dictionary?.form?.label?.district}
              </Typography>
              <CustomAutocomplete
                fullWidth
                options={districtOptions}
                value={selectedData?.district}
                getOptionLabel={option => option?.districtName || ''}
                renderInput={params => <CustomTextField {...params} placeholder={t('form.placeholder.district')} />}
                onChange={(_, data) => {
                  setSelectedData(prev => ({
                    ...prev,
                    district: data || null,
                    school: null,
                    kidName: null
                  }))
                  fetchSchoolList(data?.countryName, data?.stateName, data?.districtName)
                }}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                noOptionsText={t('form.placeholder.no_options')}
              />
            </div>
          </Grid>

          <Grid item lg={lg} md={6} sm={12}>
            <div className='form-group'>
              <Typography className='label-block-subtitle' variant='subtitle1' sx={{ mb: 2 }}>
                {/* {dictionary?.form?.label?.school}
                 */}
                {dictionary?.form?.label?.school}
              </Typography>
              <CustomAutocomplete
                fullWidth
                options={schools}
                value={selectedData?.school}
                getOptionLabel={option => option?.schoolName || ''}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    placeholder={t(`Select school`)}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isGetSchoolListLoading ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                onChange={(_, data) => {
                  console.log(data?._id)

                  if (data?._id) {
                    if (selectedData12) {
                      onSchoolSelect(data?._id)
                    }

                    setSelectedData(prev => ({
                      ...prev,
                      school: data || null,
                      kidName: null
                    }))
                  }
                }}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                noOptionsText={t('form.placeholder.no_options')}
                loading={isGetSchoolListLoading}
              />
            </div>
          </Grid>
          {selectedData?.school && (
            <Grid item lg={lg} md={6} sm={12}>
              <div className='form-group'>
                <Typography className='label-block-subtitle' variant='subtitle1' sx={{ mb: 2 }}>
                  {dictionary?.form?.label?.kidName}
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder={t('Kid Name')}
                  value={selectedData?.kidName || ''}
                  onChange={e => {
                    setSelectedData(prev => ({
                      ...prev,
                      kidName: e.target.value
                    }))

                    if (selectedData12) {
                      setKidName(e.target.value)
                    }
                  }}
                />
              </div>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default LocationSelectorForm
