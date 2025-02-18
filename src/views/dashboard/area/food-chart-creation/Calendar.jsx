// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import 'bootstrap-icons/font/bootstrap-icons.css'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

/**
 * Page
 */
const Calendar = props => {
  // Props
  const { calendarApi, setCalendarApi, handleAddEventSidebarToggle, handleLeftSidebarToggle, calendarEvents } = props

  // Refs
  const calendarRef = useRef()

  // Hooks
  const theme = useTheme()

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // calendarOptions(Props)
  const calendarOptions = {
    events: calendarEvents,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'prev, next, title',
      end: ''
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },

    /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
    editable: true,

    /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
    eventResizableFromStart: true,

    /*
      Automatically scroll the scroll-containers during event drag-and-drop and date selecting
      ? Docs: https://fullcalendar.io/docs/dragScroll
    */
    dragScroll: true,

    /*
      Max number of events within a given day
      ? Docs: https://fullcalendar.io/docs/dayMaxEvents
    */
    dayMaxEvents: 2,

    /*
      Determines if day names and week names are clickable
      ? Docs: https://fullcalendar.io/docs/navLinks
    */
    navLinks: true,
    // eventClassNames({ event: calendarEvent }) {
    //   // @ts-ignore
    //   const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

    //   return [
    //     // Background Color
    //     `event-bg-${colorName}`
    //   ]
    // },
    eventClick({ event: clickedEvent, jsEvent }) {
      jsEvent.preventDefault()

      if (!clickedEvent?.extendedProps?.isApproved || clickedEvent?.extendedProps?.isApproved === 'Pending') {
        handleAddEventSidebarToggle({ clickedEvent })
      }

      // if (clickedEvent.url) {
      //   window.open(clickedEvent.url, '_blank')
      // }
    },
    customButtons: {
      sidebarToggle: {
        icon: 'tabler tabler-menu-2',
        click() {
          handleLeftSidebarToggle()
        }
      }
    },

    // @ts-ignore
    ref: calendarRef,
    direction: theme.direction
  }

  return <FullCalendar {...calendarOptions} {...props?.calendarOptions} />
}

export default Calendar
