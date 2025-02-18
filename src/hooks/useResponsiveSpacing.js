import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const useResponsiveSpacing = (spacingConfig = { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }) => {
  const theme = useTheme()

  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const isSm = useMediaQuery(theme.breakpoints.only('sm'))
  const isMd = useMediaQuery(theme.breakpoints.only('md'))
  const isLg = useMediaQuery(theme.breakpoints.only('lg'))
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))

  if (isXs) return spacingConfig.xs
  if (isSm) return spacingConfig.sm
  if (isMd) return spacingConfig.md
  if (isLg) return spacingConfig.lg
  if (isXl) return spacingConfig.xl

  return spacingConfig.xs // Fallback for unknown cases
}

export default useResponsiveSpacing
