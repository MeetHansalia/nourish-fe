'use client'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Mui Imports
import { Button, Grid } from '@mui/material'

// Component Imports
import StaffListingComponent from './StaffListingComponent'

// Util Imports
import { useTranslation } from '@/utils/getDictionaryClient'

const StaffManagementComponent = ({ dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Button variant='contained' onClick={() => router.push(`staff-management/add-staff`)}>
          {t('page.staff_management.add_staff')}
        </Button>
      </Grid>
      <Grid item xs={12}>
        <StaffListingComponent dictionary={dictionary} />
      </Grid>
    </Grid>
  )
}

export default StaffManagementComponent
