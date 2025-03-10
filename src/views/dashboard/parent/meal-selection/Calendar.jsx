import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react'

import { useTheme } from '@mui/material/styles'

import FullCalendar from '@fullcalendar/react'

import dayGridPlugin from '@fullcalendar/daygrid'

import listPlugin from '@fullcalendar/list'

import timeGridPlugin from '@fullcalendar/timegrid'

import interactionPlugin from '@fullcalendar/interaction'

import { addDays, startOfToday, format, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns'

import { useDispatch } from 'react-redux'

import { Chip } from '@mui/material'

import { getSingleDate } from '@/redux-store/slices/dateSlice'

const Calendar = ({
  events,
  onEventClick,
  setSelectedVendor,
  setCalStartDate,
  setCalEndDate,
  orderTypeValue,
  onDateSelect
}) => {
  const [eventData, setEventData] = useState([])
  const [selectedDates, setSelectedDates] = useState([])

  useEffect(() => {
    if (events.length > 0) {
      const eventsDa = events.map((item, index) => ({
        title: item.vendorId?.companyName || 'N/A',
        id: index + 1,
        start: item.date,
        vendorId: item.vendorId?._id || 'N/A'
      }))

      // Add selected dates as "highlighted" events
      const selectedDateEvents = selectedDates.map(date => ({
        title: '',
        id: `selected-${date}`,
        start: date,
        display: 'background', // ✅ Highlights full day
        backgroundColor: '#1976d2', // ✅ Blue color for selection
        borderColor: '#1976d2'
      }))

      setEventData([...eventsDa, ...selectedDateEvents])
    }
  }, [events, selectedDates])

  const dispatch = useDispatch()
  const [selectedDate, setSelectedDate] = useState(null)

  const handleDateClick = info => {
    if (orderTypeValue === 'multiple') {
      const clickedDate = format(info.date, 'yyyy-MM-dd')

      setSelectedDates(prevDates => {
        return prevDates.includes(clickedDate)
          ? prevDates.filter(date => date !== clickedDate) // Remove if already selected
          : [...prevDates, clickedDate] // Add new date
      })
    }
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
  }

  const validRange = {
    start: addDays(startOfToday(), 7),
    end: addDays(startOfToday(), 22)
  }

  const handleSelect = selectionInfo => {
    if (onDateSelect) {
      onDateSelect(selectionInfo) // ✅ Calls parent function
    }
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
    selectable: orderTypeValue === 'multiple', // ✅ Disables selecting single or multiple days when 'single'
    select: orderTypeValue === 'multiple' ? handleSelect : null,
    dateClick: handleDateClick, // ✅ No selection in 'single' mode
    eventClick: ({ event }) => {
      if (onEventClick) {
        onEventClick(event)
      }
    },
    eventContent: renderEventContent,
    height: 'auto',
    dayMaxEvents: false,
    direction: theme.direction,
    validRange: validRange,
    datesSet: handleDatesSet,
    weekends: true
  }

  const handleOrderNow = eventInfo => {
    if (eventInfo?.event?._def?.extendedProps?.vendorId) {
      setSelectedVendor(eventInfo?.event?._def?.extendedProps?.vendorId)

      let finalDate = selectedDate || format(new Date(eventInfo.event.start), 'yyyy-MM-dd')

      setSelectedDate(finalDate)
      dispatch(getSingleDate(finalDate))

      setSelectedDate(null)
    }
  }

  function renderEventContent(eventInfo) {
    return (
      <div className='calender-flow'>
        <div className='calender-flow-name'>{eventInfo.event.title}</div>
        {orderTypeValue === 'single' && (
          <Chip
            // className='theme-common-btn'
            label='Order Now'
            color='success'
            size='small'
            // style={{ marginTop: '5px', cursor: 'pointer' }}
            onClick={() => handleOrderNow(eventInfo)}
          />
        )}
      </div>
    )
  }

  return <FullCalendar {...calendarOptions} />
}

export default Calendar
