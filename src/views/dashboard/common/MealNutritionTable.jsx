'use client'

import React, { useEffect, useState } from 'react';

import { Table, TableBody, TableRow, TableCell,TableHead } from '@mui/material';

const MealNutritionTable = ({ dictionary, cartData }) => {
  const [nutrition, setNutrition] = useState({})

  const calculateTotalNutrients = () => {
    console.log(cartData);

    const totalNutrients = {
      calories: 0,
      protein: 0,
      total_sugar: 0,
      total_fat: 0,
      sodium: 0,
      cholesterol: 0,
    };

    if (!cartData) return totalNutrients;

    // Normalize cartData to always be an array
    const cartArray = Array.isArray(cartData) ? cartData : [cartData];

    cartArray.forEach((cart) => {
      if (!cart.cartItems) return;

      cart.cartItems.forEach((cartItem) => {
        const quantity = cartItem.quantity || 1; // Default to 1 if quantity is missing

        console.log("quantity", quantity)
        // Loop through the dish ingredients
        cartItem.dishId.ingredients.forEach((ingredient) => {
          totalNutrients.calories += (ingredient.nf_calories || 0) * quantity;
          totalNutrients.protein += (ingredient.nf_protein || 0) * quantity;
          totalNutrients.total_sugar += (ingredient.nf_sugars || 0) * quantity;
          totalNutrients.total_fat += (ingredient.nf_total_fat || 0) * quantity;
          totalNutrients.sodium += (ingredient.nf_sodium || 0) * quantity;
          totalNutrients.cholesterol += (ingredient.nf_cholesterol || 0) * quantity;
        });

        // Loop through modifiers
        cartItem.modifiers.forEach((modifier) => {
          modifier.dishId.ingredients.forEach((ingredient) => {
            totalNutrients.calories += (ingredient.nf_calories || 0) * quantity;
            totalNutrients.protein += (ingredient.nf_protein || 0) * quantity;
            totalNutrients.total_sugar += (ingredient.nf_sugars || 0) * quantity;
            totalNutrients.total_fat += (ingredient.nf_total_fat || 0) * quantity;
            totalNutrients.sodium += (ingredient.nf_sodium || 0) * quantity;
            totalNutrients.cholesterol += (ingredient.nf_cholesterol || 0) * quantity;
          });
        });
      });
    });

    // Convert values to two decimal places
    Object.keys(totalNutrients).forEach((key) => {
      totalNutrients[key] = parseFloat(totalNutrients[key].toFixed(2));
    });

    return totalNutrients;
  };

  useEffect(() => {
        const totalNutrients = calculateTotalNutrients();

        console.log(totalNutrients)
        setNutrition(totalNutrients)
    }, [])


  return (
    <Table size='small' sx={{ maxWidth: 280 }}>
      <TableHead>
        <TableRow>
          <TableCell>Ingredients</TableCell>
          <TableCell>Per 100g</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>{dictionary?.meal?.calories}</TableCell>
          <TableCell>
            {nutrition.calories} {dictionary?.meal?.cal}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.protein}</TableCell>
          <TableCell>
            {nutrition.protein}
            {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.total_sugar}</TableCell>
          <TableCell>
            {nutrition.total_sugar}
            {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.total_fat}</TableCell>
          <TableCell>
            {nutrition.total_fat}
            {dictionary?.meal?.g}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.sodium}</TableCell>
          <TableCell>
            {nutrition.sodium}
            {dictionary?.meal?.mg}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{dictionary?.meal?.cholesterol}</TableCell>
          <TableCell>
            {'<'}
            {nutrition.cholesterol}
            {dictionary?.meal?.mg}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
};

export default MealNutritionTable;
