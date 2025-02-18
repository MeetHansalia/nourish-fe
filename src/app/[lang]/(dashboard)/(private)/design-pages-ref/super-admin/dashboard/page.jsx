'use client'
// React Imports
import React, { useState } from 'react'

import Link from 'next/link'

// MUI Imports
import { Card, CardContent, Grid, Typography } from '@mui/material'

import Box from '@mui/material/Box'

import InputLabel from '@mui/material/InputLabel'

import MenuItem from '@mui/material/MenuItem'

import FormControl from '@mui/material/FormControl'

import Button from '@mui/material/Button'

import Select from '@mui/material/Select'

import { Controller, useForm } from 'react-hook-form'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

import CustomTextField from '@core/components/mui/TextField'

// Page
const Dashboard = ({ params }) => {
  const [age, setAge] = React.useState('')

  const handleChange = event => {
    setAge(event.target.value)
  }

  return (
    <div className=''>
      <div className='top-block-card'>
        <div className='card-block-inner'>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Orders</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Profits</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Profits</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Profits</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <div className='common-block-dashboard'>
        <div className='common-block-title'>
          <h4>Monthly Orders</h4>
        </div>
      </div>
      <div className='common-block-dashboard'>
        <div className='common-block-title'>
          <h4>All Vendors List</h4>
          <div className='common-select-dropdown'>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-label'>Age</InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  value={age}
                  label='Age'
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
        </div>
      </div>
      <div className='last-dashboard-block'>
        <div className='last-dashboard-block-inner'>
          <div className='common-block-dashboard'>
            <div className='text-left-block'>
              <h4>Revenue Growth</h4>
              <p>Monthly Reports</p>
            </div>
            <h2>$ 1236</h2>
          </div>
        </div>
        <div className='last-dashboard-block-inner'>
          <div className='common-block-dashboard'>
            <div className='text-left-block'>
              <h4>Sales</h4>
              <p>Last 6 Months</p>
            </div>
            <h2>$ 6736</h2>
          </div>
        </div>
      </div>
      <div className='common-block-dashboard'>
        <div className='common-block-title'>
          <h4>Nutritional Management</h4>
          <div className='button-group-block'>
            <div className='button-group-block-inner'>
              <Button variant='contained' className='theme-common-btn'>
                Search
              </Button>
            </div>
            <div className='button-group-block-inner'>
              <Button variant='contained' className='theme-common-btn-second'>
                Cancel
              </Button>
            </div>
            <div className='button-group-block-inner'>
              <Button variant='contained' className='theme-common-btn-border'>
                Search
              </Button>
            </div>
            <div className='button-group-block-inner'>
              <Button variant='contained' className='theme-common-btn-inprogress'>
                Search
              </Button>
            </div>
          </div>
        </div>
        <div className='common-form-dashboard'>
          <form>
            <div className='two-block-form'>
              <div className='form-group'>
                <CustomTextField fullWidth type='email' label='Frist Name' placeholder='Abc' />
              </div>
              <div className='form-group'>
                <CustomTextField fullWidth type='email' label='Last Name' placeholder='Abc' />
              </div>
            </div>
            <div className='form-group'>
              <CustomTextField fullWidth type='email' label='Frist Name' placeholder='Abc' />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
