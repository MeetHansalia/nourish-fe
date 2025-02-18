'use client'
import React, { useState } from 'react'

import VendorSelection from './VendorSelection'

const AddToCartForSchoolView = () => {
  //** STATES */
  const [tab, setTab] = useState(0)
  const [selectedVendor, setSelectedVendor] = useState({})

  return (
    <>
      {tab === 0 && (
        <VendorSelection setTab={setTab} selectedVendor={selectedVendor} setSelectedVendor={setSelectedVendor} />
      )}
      {/* TODO: ADD TAB FOR MENU SELECTION */}
    </>
  )
}

export default AddToCartForSchoolView
