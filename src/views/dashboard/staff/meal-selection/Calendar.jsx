import React, { useState } from 'react'

import { useTheme } from '@mui/material/styles'

import FullCalendar from '@fullcalendar/react'

import dayGridPlugin from '@fullcalendar/daygrid'

import listPlugin from '@fullcalendar/list'

import timeGridPlugin from '@fullcalendar/timegrid'

import interactionPlugin from '@fullcalendar/interaction'

import { addDays, startOfToday, format } from 'date-fns'

import { useDispatch } from 'react-redux'

import { Chip } from '@mui/material'

import { getSingleDate } from '@/redux-store/slices/dateSlice'

const Calendar = ({ events, onEventClick, setSelectedVendor, calendarRef, onOrderNow }) => {
  const dispatch = useDispatch()
  const [selectedDate, setSelectedDate] = useState(null)

  const handleDateClick = info => {
    const clickedDate = format(info.date, 'yyyy-MM-dd')


    setSelectedDate(clickedDate)
    dispatch(getSingleDate(clickedDate))
  }

  const theme = useTheme()

  const validRange = {
    start: addDays(startOfToday(), 7)
  }

  const calendarOptions = {
    plugins: [dayGridPlugin, listPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next title',
      right: 'dayGridMonth,timeGridWeek,listWeek'
    },
    events,
    editable: true,
    selectable: true,
    eventClick: ({ event }) => {
      if (onEventClick) {
        onEventClick(event)
      }
    },
    dateClick: handleDateClick,
    eventContent: renderEventContent,
    height: 'auto',
    dayMaxEvents: false,
    direction: theme.direction,
    validRange: validRange
  }

  const handleOrderNow = eventInfo => {
    if (eventInfo?.event?._def?.publicId) {

      setSelectedVendor(eventInfo?.event?._def?.publicId)

      let finalDate = selectedDate || format(new Date(eventInfo.event.start), 'yyyy-MM-dd')

      setSelectedDate(finalDate)
      dispatch(getSingleDate(finalDate))

      if (onOrderNow) {
        onOrderNow({
          eventId: eventInfo?.event?._def?.publicId,
          selectedDate: finalDate
        })
      }

      setSelectedDate(null)
    }
  }

  function renderEventContent(eventInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '5px' }}>
        <div style={{ fontSize: '12px', color: 'black', fontWeight: 'bold' }}>{eventInfo.event.title}</div>
        <Chip
          label='Order Now'
          color='success'
          size='small'
          style={{ marginTop: '5px', cursor: 'pointer' }}
          onClick={() => handleOrderNow(eventInfo)}
        />
      </div>
    )
  }

  return <FullCalendar {...calendarOptions} ref={calendarRef} />
}

export default Calendar
