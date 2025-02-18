/**
 * Number format libraries
 */
import numeral from 'numeral'

/**
 * Filters
 */
export const numberFormat = (numberValue = 0, numberFormatStr = '0,0') => {
  if (!numberValue) {
    return numberValue
  }

  return numeral(numberValue)?.format(numberFormatStr)
}

export const titleize = value => {
  if (!value) {
    return value
  }

  return value?.replace(/(?:^|\s|-)\S/g, x => x?.toUpperCase())
}

export const prependZero = value => {
  if (!value) {
    return value
  }

  return value > 9 ? value : '0' + value
}

const fileDefaultExport = {
  numberFormat,
  titleize,
  prependZero
}

export default fileDefaultExport
