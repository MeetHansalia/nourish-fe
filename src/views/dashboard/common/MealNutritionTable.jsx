'use client'

import React, { useEffect } from 'react'

import { Table, TableBody, TableRow, TableCell, TableHead } from '@mui/material'

const MealNutritionTable = ({ dictionary, cartData, setNutrition }) => {
  const calculateTotalNutrients = () => {
    const totalNutrients = {
      carbohydrate: 0,
      fat: 0,
      protein: 0,
      sodium: 0,
      sugar: 0
    }

    if (!cartData) return totalNutrients

    const cartArray = Array.isArray(cartData) ? cartData : [cartData]

    cartArray.forEach(cart => {
      if (!cart.cartItems) return

      cart.cartItems.forEach(cartItem => {
        const quantity = cartItem.quantity || 1

        if (cartItem.dishId?.calculatedNutrition) {
          Object.keys(totalNutrients).forEach(nutrient => {
            totalNutrients[nutrient] += (cartItem.dishId.calculatedNutrition[nutrient] || 0) * quantity
          })
        }

        cartItem.modifiers.forEach(modifier => {
          if (modifier.dishId?.calculatedNutrition) {
            Object.keys(totalNutrients).forEach(nutrient => {
              totalNutrients[nutrient] += (modifier.dishId.calculatedNutrition[nutrient] || 0) * quantity
            })
          }
        })
      })
    })

    Object.keys(totalNutrients).forEach(key => {
      totalNutrients[key] = parseFloat(totalNutrients[key].toFixed(2))
    })

    return totalNutrients
  }

  useEffect(() => {
    const totalNutrients = calculateTotalNutrients()

    // setNutrition(totalNutrients) // Update parent state
  }, [cartData]) // Recalculate when cartData changes

  return (
    <Table size='small' sx={{ maxWidth: 280 }}>
      <TableHead>
        <TableRow>
          <TableCell>{dictionary?.meal?.ingredients}</TableCell>
          <TableCell>{dictionary?.meal?.per_100g}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>{dictionary?.meal?.carbohydrate}</TableCell>
          <TableCell>
            {calculateTotalNutrients().carbohydrate} {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.total_fat}</TableCell>
          <TableCell>
            {calculateTotalNutrients().fat} {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.protein}</TableCell>
          <TableCell>
            {calculateTotalNutrients().protein} {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.sodium}</TableCell>
          <TableCell>
            {calculateTotalNutrients().sodium} {dictionary?.meal?.mg}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.total_sugar}</TableCell>
          <TableCell>
            {calculateTotalNutrients().sugar} {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default MealNutritionTable
