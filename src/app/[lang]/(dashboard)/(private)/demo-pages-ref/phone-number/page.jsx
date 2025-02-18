'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import { Autocomplete, Box, Grid, IconButton, InputAdornment, Popper, TextField } from '@mui/material'

import PhoneInput from 'react-phone-input-2'

// import 'react-phone-input-2/lib/style.css'

import 'react-phone-input-2/lib/material.css'
// import '@/styles/country-selector.scss' // Import CSS module

// Util Imports
// import startsWith from 'lodash.startswith'

import useResponsiveSpacing from '@/hooks/useResponsiveSpacing'

import { countries } from '@/data/countries'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'

const countries2 = [
  { code: 'IN', label: 'India', phone: '91', flag: '🇮🇳' },
  { code: 'US', label: 'United States', phone: '1', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', phone: '44', flag: '🇬🇧' },
  { code: 'CA', label: 'Canada', phone: '1', flag: '🇨🇦' }
]

/**
 * Page
 */
const About = ({ mode }) => {
  // States
  const [value, setValue] = useState(null)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  useEffect(() => {
    console.log('value: ', value)
  }, [value])

  const [selectedCountry, setSelectedCountry] = useState(countries2[0]) // Default to India
  const [phoneNumber, setPhoneNumber] = useState('')

  const [country, setCountry] = useState('')

  const spacing = useResponsiveSpacing({ xs: 2, sm: 4, md: 6, lg: 8, xl: 10 })

  useEffect(() => {
    console.log('spacing: ', spacing)
  }, [spacing])

  return (
    <div>
      {/* <TextField
        label='With normal TextField'
        id='outlined-start-adornment'
        sx={{ m: 1, width: '25ch' }}
        InputProps={{
          startAdornment: <InputAdornment position='start'>kg</InputAdornment>
        }}
      /> */}

      {/* <Autocomplete
        autoHighlight
        id='country-select-demo'
        options={countries}
        getOptionLabel={option => option.label}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props

          return (
            <Box key={key} component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...optionProps}>
              <img
                loading='lazy'
                width='20'
                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                alt=''
              />
              {option.label} ({option.code}) +{option.phone}
            </Box>
          )
        }}
        renderInput={params => (
          <TextField
            {...params}
            label='Choose a country'
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password' // disable autocomplete and autofill
            }}
          />
        )}
      /> */}

      {/* <CustomAutocomplete
        autoHighlight
        id='autocomplete-country-select'
        options={countries}
        getOptionLabel={option => option?.code || ''}
        renderOption={(props, option) => (
          <li {...props} key={option.label}>
            <img
              key={option.code}
              className='mie-4 flex-shrink-0'
              alt=''
              width='20'
              loading='lazy'
              src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
            />
            {option.label} ({option.code}) +{option.phone}
          </li>
        )}
        renderInput={params => (
          <CustomTextField
            {...params}
            label='Choose a country'
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password' // disable autocomplete and autofill
            }}
          />
        )}
        value={value}
        onChange={handleChange}
      /> */}

      <Grid container spacing={6}>
        {/* <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: 320,
              border: '1px solid #ccc',
              borderRadius: 2,
              p: 1
            }}
          >
            <Autocomplete
              options={countries2}
              value={selectedCountry}
              onChange={(event, newValue) => setSelectedCountry(newValue)}
              getOptionLabel={option => `${option.flag} +${option.phone}`}
              renderOption={(props, option) => (
                <Box component='li' {...props} key={option.label}>
                  {option.flag} {option.label} (+{option.phone})
                </Box>
              )}
              sx={{ width: 100 }}
              renderInput={params => <TextField {...params} variant='standard' />}
              disableClearable
              isOptionEqualToValue={(option, value) => option.code === value.code}
              // PopperComponent={props => <Popper {...props} style={{ width: '100%' }} />}
              PopperComponent={props => <Popper {...props} style={{ width: 'auto' }} />}
              // PopperComponent={props => (
              //   <Popper
              //     {...props}
              //     style={{
              //       width: 'auto', // Allow the width to fit content
              //       maxWidth: '500px', // Set a max width to limit expansion
              //       minWidth: '200px' // Optional: Set a minimum width
              //     }}
              //   />
              // )}
            />

            <TextField
              placeholder='Phone'
              variant='standard'
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ style: { fontSize: 16 } }}
            />
          </Box>
        </Grid> */}

        <Grid item xs={12}>
          <div className='country-selector-container'>
            <PhoneInput
              country={'us'} // Default country
              value={'919904250770'}
              onChange={(value, countryData) => {
                console.log('value: ', value)
                console.log('countryData: ', countryData)

                setCountry(countryData.countryCode)
              }}
              enableSearch
              inputProps={{ autoComplete: 'off' }} // Avoid browser autofill
              // inputStyle={{ display: 'none' }} // Hides the phone input field
              // buttonStyle={{ border: 'none', background: 'transparent' }} // Removes default styling
              // containerClass='react-tel-input' // Apply the SCSS styling
              // buttonClass='flagDropdown' // Apply the SCSS styling for the dropdown button
              specialLabel=''
              countryCodeEditable={false}
              disableCountryCode={false}
              // isValid={(inputNumber, country, countries) => {
              //   console.log('countries: ', countries)

              //   return countries.some(country => {
              //     return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber)
              //   })
              // }}
            />
          </div>
        </Grid>
      </Grid>

      <Grid container spacing={spacing}>
        <Grid item xs={12} sm={6} md={4}>
          <Box bgcolor='lightblue' p={2}>
            Item 1
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box bgcolor='lightgreen' p={2}>
            Item 2
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box bgcolor='lightcoral' p={2}>
            Item 3
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box bgcolor='lightblue' p={2}>
            Item 4
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box bgcolor='lightgreen' p={2}>
            Item 5
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box bgcolor='lightcoral' p={2}>
            Item 6
          </Box>
        </Grid>
      </Grid>
    </div>
  )
}

export default About
