import * as React from 'react'

import Box from '@mui/material/Box'

import TextField from '@mui/material/TextField'

import Autocomplete from '@mui/material/Autocomplete'

import LocationOnIcon from '@mui/icons-material/LocationOn'

import Grid from '@mui/material/Grid'

import Typography from '@mui/material/Typography'

import parse from 'autosuggest-highlight/parse'

import { debounce } from '@mui/material/utils'

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

export default function GoogleMaps({ setPlaceDetails, setCountry, setState, setCity, setDistrict }) {
  const [inputValue, setInputValue] = React.useState('')
  const [options, setOptions] = React.useState([])
  const loaded = React.useRef(false)

  // Load Google Maps API and Places library
  if (typeof window !== 'undefined' && !loaded.current) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps'
      )
    }

    loaded.current = true
  }

  // Debounced fetch for autocomplete results
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

    if (!inputValue) {
      setOptions([])

      return undefined
    }

    fetch({ input: inputValue }, results => {
      if (active) {
        setOptions(results || [])
      }
    })

    return () => {
      active = false
    }
  }, [inputValue, fetch])

  const handlePlaceSelected = (event, newValue) => {
    if (newValue) {
      const place = newValue

      placesService.current.getDetails({ placeId: place.place_id }, (details, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaceDetails(details)
          const addressComponents = details.address_components

          addressComponents.forEach(component => {
            const types = component.types

            if (types.includes('country')) setCountry(component.long_name)
            if (types.includes('administrative_area_level_1')) setState(component.long_name)
            if (types.includes('locality')) setCity(component.long_name)
            if (types.includes('administrative_area_level_3')) setDistrict(component.long_name)
          })
        }
      })
    }
  }

  return (
    <Box sx={{ width: 500, maxWidth: '100%' }}>
      <Autocomplete
        onChange={handlePlaceSelected}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
        id='google-maps-autocomplete'
        disableClearable
        options={options}
        getOptionLabel={option => option.description}
        isOptionEqualToValue={(option, value) => option.place_id === value.place_id}
        renderOption={(props, option) => {
          const matches = parse(option.description, option.structured_formatting.main_text_matched_substrings)

          const { key, ...otherProps } = props

          return (
            <li {...otherProps} key={key}>
              <Grid container alignItems='center'>
                <Grid item>
                  <LocationOnIcon />
                </Grid>
                <Grid item xs>
                  <Typography variant='body2'>
                    {matches.map((match, index) => (
                      <span
                        key={match.id || `${option.description}-${index}`}
                        style={{
                          fontWeight: match.highlight ? 'bold' : 'normal'
                        }}
                      >
                        {match.text}
                      </span>
                    ))}
                  </Typography>
                </Grid>
              </Grid>
            </li>
          )
        }}
        renderInput={params => <TextField {...params} label='Search for a place' variant='outlined' />}
      />
    </Box>
  )
}
