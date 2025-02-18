// React imports
import * as React from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import parse from 'autosuggest-highlight/parse'
import { debounce } from '@mui/material/utils'

// This key was created specifically for the demo in mui.com.
// You need to create a new one for your application.
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

function loadScript(src, position, id) {
  if (!position) {
    return
  }

  const script = document.createElement('script')

  script.setAttribute('async', '')
  script.setAttribute('id', id)
  script.src = src
  position.appendChild(script)
}

const autocompleteService = { current: null }
const placesService = { current: null }

const GoogleAddressAutoComplete = React.forwardRef((props, ref) => {
  const [value, setValue] = React.useState(null)
  const [inputValue, setInputValue] = React.useState('')
  const [options, setOptions] = React.useState([])
  const loaded = React.useRef(false)

  if (typeof window !== 'undefined' && !loaded.current) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps'
      )
    }

    loaded.current = true
  }

  const fetch = React.useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback)
      }, 400),
    []
  )

  React.useEffect(() => {
    let active = true

    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
    }

    if (!autocompleteService.current) {
      return undefined
    }

    if (inputValue === '') {
      setOptions(value ? [value] : [])

      return undefined
    }

    fetch({ input: inputValue }, results => {
      if (active) {
        let newOptions = []

        if (value) {
          newOptions = [value]
        }

        if (results) {
          newOptions = [...newOptions, ...results]
        }

        setOptions(newOptions)
      }
    })

    return () => {
      active = false
    }
  }, [value, inputValue, fetch])

  const onChangeHandler = (event, newValue) => {
    // console.log('on onChangeHandler')

    setOptions(newValue ? [newValue, ...options] : options)
    setValue(newValue)

    if (newValue) {
      const place = newValue

      placesService.current.getDetails({ placeId: place.place_id }, (details, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const detailsForAPI = {}
          const addressComponents = details.address_components

          addressComponents.forEach(component => {
            const types = component.types

            if (types.includes('country')) {
              detailsForAPI.country = component.long_name || ''
            }

            if (types.includes('administrative_area_level_1')) {
              detailsForAPI.state = component.long_name || ''
            }

            if (types.includes('locality')) {
              detailsForAPI.city = component.long_name || ''
            }

            if (types.includes('administrative_area_level_3')) {
              detailsForAPI.district = component.long_name || ''
            }
          })

          detailsForAPI.lat = details?.geometry.location.lat() || ''
          detailsForAPI.lng = details?.geometry.location.lng() || ''
          detailsForAPI.latitude = details?.geometry.location.lat() || ''
          detailsForAPI.longitude = details?.geometry.location.lng() || ''
          detailsForAPI.address = newValue?.description || ''
          detailsForAPI.description = newValue?.description || ''

          try {
            delete details.utc_offset
          } catch (error) {}

          newValue.places_api_details = details
          newValue.places_api_status = status
          newValue.details_for_api = detailsForAPI

          props?.onChange(event, newValue)
        } else {
          props?.onChange(event, newValue)
        }
      })
    } else {
      props?.onChange(event, newValue)
    }
  }

  React.useEffect(() => {
    // console.log('props?.value: ', props?.value)

    if (!value) {
      setValue(props?.value)
    } else if (value && value?.description !== props?.value?.description) {
      setValue(props?.value)
    }
  }, [props?.value])

  return (
    <Autocomplete
      renderInput={params => <TextField {...params} label='Add a location' fullWidth />}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props

        const matches = option?.structured_formatting?.main_text_matched_substrings || []

        const parts = parse(
          option?.structured_formatting?.main_text,
          matches?.map(match => [match?.offset, match?.offset + match?.length])
        )

        return (
          <li key={key} {...optionProps}>
            <Grid container sx={{ alignItems: 'center' }}>
              <Grid item sx={{ display: 'flex', width: 44 }}>
                <LocationOnIcon sx={{ color: 'text.secondary' }} />
              </Grid>
              <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                {parts?.map((part, index) => (
                  <Box key={index} component='span' sx={{ fontWeight: part?.highlight ? 'bold' : 'regular' }}>
                    {part?.text}
                  </Box>
                ))}
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {option?.structured_formatting?.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )
      }}
      noOptionsText='No locations'
      // sx={{ width: 300 }}
      getOptionLabel={option => (typeof option === 'string' ? option : option.description)}
      filterOptions={x => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      {...props}
      ref={ref}
      value={value}
      //   onChange={(event, newValue) => {
      //     setOptions(newValue ? [newValue, ...options] : options)
      //     setValue(newValue)
      //     props?.onChange(event, newValue)
      //   }}
      onChange={onChangeHandler}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
    />
  )
})

export default GoogleAddressAutoComplete
