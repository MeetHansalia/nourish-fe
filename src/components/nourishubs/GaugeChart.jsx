// SpeedometerChart.jsx
import React from 'react'

import ReactSpeedometer from 'react-d3-speedometer'

const SpeedometerChart = () => {
  return (
    <div style={{ width: '50%', margin: 'auto' }}>
      <ReactSpeedometer
        maxValue={100} // Maximum value of the speedometer
        value={60} // Current value (dynamic based on your data)
        needleColor='#000000' // Color of the needle
        startColor='red' // Color at the beginning of the arc
        segments={5} // Number of segments in the speedometer
        endColor='green' // Color at the end of the arc
        textColor='black' // Color of the text
        currentValueText='Current Value: ${value}' // Customize value display text
      />
    </div>
  )
}

export default SpeedometerChart
