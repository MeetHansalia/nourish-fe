import React from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

export default function IngredientsTable({ ingredientsData, selectedDish, dictionary }) {
  console.log('selectedDish', selectedDish)

  return (
    <>
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
        {Number(selectedDish?.calculatedNutrition?.carbohydrate).toFixed(2)} {dictionary?.meal?.g}
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>{dictionary?.meal?.total_fat}</TableCell>
      <TableCell>
        {Number(selectedDish?.calculatedNutrition?.fat).toFixed(2)} {dictionary?.meal?.g}
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>{dictionary?.meal?.protein}</TableCell>
      <TableCell>
        {Number(selectedDish?.calculatedNutrition?.protein).toFixed(2)} {dictionary?.meal?.g}
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>{dictionary?.meal?.sodium}</TableCell>
      <TableCell>
        {Number(selectedDish?.calculatedNutrition?.sodium).toFixed(2)} {dictionary?.meal?.mg}
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>{dictionary?.meal?.total_sugar}</TableCell>
      <TableCell>
        {Number(selectedDish?.calculatedNutrition?.sugar).toFixed(2)} {dictionary?.meal?.g}
      </TableCell>
    </TableRow>
  </TableBody>
</Table>

      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Calories</TableCell>
              <TableCell>Total Fat (g)</TableCell>
              <TableCell>Sugars (g)</TableCell>
              <TableCell>Protein (g)</TableCell>
              <TableCell>Sodium (mg)</TableCell>
              <TableCell>Cholesterol (mg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredientsData?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.nf_calories}</TableCell>
                <TableCell>{item.nf_total_fat}</TableCell>
                <TableCell>{item.nf_sugars}</TableCell>
                <TableCell>{item.nf_protein}</TableCell>
                <TableCell>{item.nf_sodium}</TableCell>
                <TableCell>{item.nf_cholesterol}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
