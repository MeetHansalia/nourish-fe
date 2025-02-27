import React, { useState, useEffect } from 'react'

import { useTheme } from '@mui/material/styles'

import FullCalendar from '@fullcalendar/react'

import dayGridPlugin from '@fullcalendar/daygrid'

import listPlugin from '@fullcalendar/list'

import timeGridPlugin from '@fullcalendar/timegrid'

import interactionPlugin from '@fullcalendar/interaction'

import { useDispatch } from 'react-redux'

import { addDays, startOfToday, format, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns'

import { Chip } from '@mui/material'

import { getSingleDate } from '@/redux-store/slices/dateSlice'

const Calendar = ({ events, onEventClick, setSelectedVendor, setCalStartDate, setCalEndDate }) => {
  const [eventData, setEventData] = useState([])

  useEffect(() => {
    if (events.length > 0) {
      const eventsDa = events.map((item, index) => ({
        title: item.vendorId?.first_name || 'Unknown',
        id: index + 1,
        start: item.date,
        vendorId: item.vendorId?._id || 'N/A'
      }))

      setEventData(eventsDa)
    }
  }, [events])

  console.log('events', events)
  const dispatch = useDispatch()
  const [selectedDate, setSelectedDate] = useState(null)

  const handleDateClick = info => {
    const clickedDate = format(info.date, 'yyyy-MM-dd')

    setSelectedDate(clickedDate)
    dispatch(getSingleDate(clickedDate))
  }

  const theme = useTheme()

  const handleDatesSet = dateInfo => {
    const visibleMonth = getMonth(dateInfo.view.currentStart)
    const visibleYear = getYear(dateInfo.view.currentStart)

    const firstDayOfMonth = startOfMonth(new Date(visibleYear, visibleMonth, 1))
    const lastDayOfMonth = endOfMonth(new Date(visibleYear, visibleMonth, 1))

    const startDate = format(firstDayOfMonth, 'yyyy-MM-dd')
    const endDate = format(lastDayOfMonth, 'yyyy-MM-dd')

    setCalStartDate(startDate)
    setCalEndDate(endDate)

    // console.log('Start Date:', startDate)
    // console.log('End Date:', endDate)
  }

  const validRange = {
    start: addDays(startOfToday(), 7)
  }

  const calendarOptions = {
    plugins: [dayGridPlugin, listPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: eventData,
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
    validRange: validRange,
    datesSet: handleDatesSet
  }

  const handleOrderNow = eventInfo => {
    if (eventInfo?.event?._def?.extendedProps?.vendorId) {
      setSelectedVendor(eventInfo?.event?._def?.extendedProps?.vendorId)

      let finalDate = selectedDate || format(new Date(eventInfo.event.start), 'yyyy-MM-dd')

      setSelectedDate(finalDate)
      dispatch(getSingleDate(finalDate))

      // if (onOrderNow) {
      //   onOrderNow({
      //     eventId: eventInfo?.event?._def?.publicId,
      //     selectedDate: finalDate
      //   })
      // }

      setSelectedDate(null)
    }
  }

  function renderEventContent(eventInfo) {
    return (
      <div className='calender-flow'>
        <div className='calender-flow-name'>{eventInfo.event.title}</div>
        <Chip
          label='Order Now'
          color='success'
          size='small'
          style={{ marginTop: '0px', cursor: 'pointer' }}
          onClick={() => handleOrderNow(eventInfo)}
        />
      </div>
    )
  }

  return <FullCalendar {...calendarOptions} />
}

export default Calendar
