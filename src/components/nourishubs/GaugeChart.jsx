import React from 'react'

import ReactSpeedometer from 'react-d3-speedometer'

const SpeedometerChart = ({ totalNutrition, kidNutrition }) => {
  // Function to determine color based on limits
  const getColor = (value = 0, limit = 0) => {
    if (value > limit) return 'red' // Exceeds limit
    if (value >= limit * 0.9) return 'orange' // Approaching limit (90-100%)

    return 'green' // Healthy range
  }

  console.log('totalNutrition', totalNutrition)

  console.log('kidNutrition', kidNutrition)
  // Ensure values exist and default to 0 if undefined
  const total = totalNutrition || {}
  const limits = kidNutrition || {}

  // Determine colors for each nutrient
  const carbColor = getColor(total.carbohydrate, limits.carbohydrate)

  console.log('carbColor', carbColor)
  const fatColor = getColor(total.fat, limits.fat)

  console.log('fatColor', fatColor)
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

  if (colorCounts.red > colorCounts.orange && colorCounts.red > colorCounts.green) {
    overallColor = 'red'
  } else if (colorCounts.orange > colorCounts.red && colorCounts.orange > colorCounts.green) {
    overallColor = 'orange'
  } else if (colorCounts.green > colorCounts.red && colorCounts.green > colorCounts.orange) {
    overallColor = 'green'
  }

  console.log('overallColor', overallColor)

  return (
    <div style={{ width: '50%', margin: 'auto' }}>
      <ReactSpeedometer
        maxValue={100}
        value={overallColor === 'red' ? 80 : overallColor === 'orange' ? 50 : 20} // Adjust needle position
        needleColor='#000000'
        startColor='red'
        segments={3}
        endColor='red'
        textColor='black'
        currentValueText='' // Hides the numeric value
        customSegmentStops={[0, 33, 66, 100]} // Defines Red, Amber, Green ranges
        segmentColors={['green', 'orange', 'red']} // Three colors for three zones
        showSegmentLabels={false} // Ensures no segment labels appear
        labelFontSize='0px' // Hides any remaining text
        valueTextFontSize='0px' // Ensures no value text appears
      />
    </div>
  )
}

export default SpeedometerChart
