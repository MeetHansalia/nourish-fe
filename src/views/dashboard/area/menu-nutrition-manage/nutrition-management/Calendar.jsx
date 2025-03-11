import React from 'react'

import { useTheme } from '@mui/material/styles'

import FullCalendar from '@fullcalendar/react'

import dayGridPlugin from '@fullcalendar/daygrid'

import listPlugin from '@fullcalendar/list'

import timeGridPlugin from '@fullcalendar/timegrid'

import interactionPlugin from '@fullcalendar/interaction'

import { Chip } from '@mui/material'

import { format } from 'date-fns'

const Calendar = ({ events }) => {
  const theme = useTheme()

  // Extract order dates from events
  const orderDates = new Map()

  events.forEach(event => {
    const formattedDate = format(new Date(event.orderDate), 'yyyy-MM-dd')

    orderDates.set(formattedDate, event._id) // Store order ID for navigation
  })

  // Handle date click
  const handleDateClick = arg => {
    console.log('Date clicked:', arg.dateStr)
  }

  // Handle "Order Now" button click
  const handleOrderNow = eventInfo => {
    console.log('Order Now clicked for:', eventInfo.event.title)
  }

  // Handle dot click to redirect
  const handleDotClick = orderId => {
    window.location.href = `/orders/${orderId}` // Change this to your order details page URL
  }

  // Customizing calendar day cell to show green dot
  const dayCellContent = arg => {
    const date = format(arg.date, 'yyyy-MM-dd')

    return (
      <div className='custom-day-cell'>
        {arg.dayNumberText}
        {orderDates.has(date) && (
          <button
            onClick={() => handleDotClick(orderDates.get(date))}
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              backgroundColor: 'green',
              borderRadius: '50%',
              marginLeft: '5px',
              border: 'none',
              cursor: 'pointer'
            }}
            title='View Order'
          />
        )}
      </div>
    )
  }

  // Calendar options
  const calendarOptions = {
    plugins: [dayGridPlugin, listPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: events,
    editable: true,
    dateClick: handleDateClick,
    eventContent: renderEventContent,
    height: 'auto',
    dayMaxEvents: false,
    direction: theme.direction,
    weekends: true,
    dayCellContent: dayCellContent // Highlight order dates with clickable dot
  }

  function renderEventContent(eventInfo) {
    return (
      <div className='calender-flow'>
        <div className='calender-flow-name'>{eventInfo.event.title}</div>
        <Chip label='Order Now' color='success' size='small' onClick={() => handleOrderNow(eventInfo)} />
      </div>
    )
  }

  return <FullCalendar {...calendarOptions} />
}

export default Calendar
