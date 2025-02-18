'use client'

import { useEffect, useRef, useState } from 'react'

import { useParams, usePathname, useRouter } from 'next/navigation'

import { Button, Card, CardContent, CardHeader, CircularProgress, Grid, Typography } from '@mui/material'

import { isCancel } from 'axios'

import { useTranslation } from 'react-i18next'

import { useSelector } from 'react-redux'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, getPanelName, toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'
import { profileState } from '@/redux-store/slices/profile'

const LocationSelectorForm = ({
  dictionary,
  showButton,
  spacing,
  lg,
  onSchoolSelect,
  selectedParamData,
  setKidName
}) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const pathname = usePathname()
  const panelName = getPanelName(pathname)
  const router = useRouter()
  const { user = null } = useSelector(profileState)

  const [districtOptions, setDistrictOptions] = useState([])

  const [schools, setSchools] = useState([])
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)

  // state for selected data
  const [selectedData, setSelectedData] = useState(() => ({
    district: selectedParamData?.district || null,
    school: selectedParamData?.school || null,
    kidName: null
  }))

  const districtController = useRef(null)
  const getSchoolListController = useRef()

  // Fetch District List Based on Selected State
  const getDistrictList = (stateName, countryName) => {
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
      })
      .catch(error => {
        if (!isCancel(error)) {
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
      .get(`${API_ROUTER.STATE.GET_SCHOOLS}?${queryParams.toString()}`, {
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

        if (selectedParamData && response?.data) {
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
    getDistrictList(user?.location?.state, user?.location?.country)
  }, [])

  // passing the selected data to other page
  const handleClick = () => {
    const { district, school, kidName } = selectedData

    if (!district || !school) {
      console.error('All fields must be selected before proceeding.')

      return
    }

    const queryParams = new URLSearchParams({
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
    if (!selectedParamData) return

    // if (selectedParamData?.country?._id) {
    //   getStateList(selectedParamData.country._id)
    // }

    if (user.location.state && user.location.country) {
      getDistrictList(user.location.state, user.location.country)
    }

    if (selectedParamData?.district?.districtName) {
      fetchSchoolList(user.location.country, user.location.state, selectedParamData?.district?.districtName)
    }
  }, [selectedParamData])

  // set the school after retrieving the data
  useEffect(() => {
    if (schools.length > 0 && selectedParamData?.school) {
      const selectedSchool = schools.find(school => school?._id === selectedParamData.school._id)

      if (selectedSchool) {
        setSelectedData(prev => ({
          ...prev,
          school: selectedSchool
        }))

        if (selectedParamData.kidName) {
          setSelectedData(prev => ({
            ...prev,
            kidName: selectedParamData.kidName
          }))
        }

        onSchoolSelect(selectedParamData.school._id)

        if (selectedParamData.kidName) {
          setKidName(selectedParamData.kidName)
        }
      }
    }
  }, [schools])

  return (
    <Card sx={{ fontFamily: 'Mulish, sans-serif' }}>
      {showButton && (
        <CardHeader
          title={dictionary?.page?.meal_details?.meal_monitoring}
          action={
            <Button variant='contained' sx={{ bgcolor: 'green', color: 'white' }} onClick={() => handleClick()}>
              {dictionary?.form?.button?.submit}
            </Button>
          }
        />
      )}
      <CardContent>
        <Grid container spacing={spacing}>
          <Grid item lg={lg} md={6} sm={12}>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
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
          </Grid>

          <Grid item lg={lg} md={6} sm={12}>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
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
                  if (selectedParamData) {
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
          </Grid>
          {selectedData?.school && (
            <Grid item lg={lg} md={6} sm={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
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
                  setKidName(e.target.value)
                }}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default LocationSelectorForm
