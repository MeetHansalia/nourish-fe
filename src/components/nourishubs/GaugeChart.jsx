import React, { useEffect, useState } from 'react'

import ReactSpeedometer from 'react-d3-speedometer'

const SpeedometerChart = ({ totalNutrition, kidNutrition, onCalculatedValue }) => {
  // Function to determine color based on limits
  const getColor = (value = 0, limit = 0) => {
    if (value > limit) return 'red' // Exceeds limit
    if (value >= limit * 0.9) return 'orange' // Approaching limit (90-100%)

    return 'green' // Healthy range
  }

  // Ensure values exist and default to 0 if undefined
  const total = totalNutrition || {}
  const limits = kidNutrition || {}

  // Determine colors for each nutrient
  const carbColor = getColor(total.carbohydrate, limits.carbohydrate)
  const fatColor = getColor(total.fat, limits.fat)
  const proteinColor = getColor(total.protein, limits.protein)
  const sodiumColor = getColor(total.sodium, limits.sodium)
  const sugarColor = getColor(total.sugar, limits.sugar)

  // Determine overall meal rating based on majority color
  const colorCounts = {
    red: 0,
    orange: 0,
    green: 0
  }

  // Array of all nutrient colors
  const nutrientColors = [carbColor, fatColor, proteinColor, sodiumColor, sugarColor]

  // Count occurrences of each color
  nutrientColors.forEach(color => {
    colorCounts[color] += 1
  })

  // Determine majority color
  let overallColor = 'orange' // Default to amber if tied
  let gaugeValue = 50

  if (colorCounts.red > colorCounts.orange && colorCounts.red > colorCounts.green) {
    overallColor = 'red'
    gaugeValue = 80
  } else if (colorCounts.orange > colorCounts.red && colorCounts.orange > colorCounts.green) {
    overallColor = 'orange'
    gaugeValue = 50
  } else if (colorCounts.green > colorCounts.red && colorCounts.green > colorCounts.orange) {
    overallColor = 'green'
    gaugeValue = 20
  }

  // ✅ Send calculated gauge value back to parent component
  useEffect(() => {
    if (onCalculatedValue) {
      onCalculatedValue(gaugeValue)
    }
  }, [totalNutrition, kidNutrition]) // Trigger when any nutrition value changes

  return (
    <div style={{ width: '50%', margin: 'auto' }}>
      <ReactSpeedometer
        maxValue={100}
        value={gaugeValue}
        needleColor='#000000'
        startColor='green'
        segments={3}
        endColor='red'
        textColor='black'
        currentValueText='' // Hides the numeric value
        customSegmentStops={[0, 33, 66, 100]}
        segmentColors={['green', 'orange', 'red']}
        showSegmentLabels={false}
        labelFontSize='0px'
        valueTextFontSize='0px'
      />
    </div>
  )
}

export default SpeedometerChart
