"use client";
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {differenceInMinutes, format, isSameDay, parseISO} from "date-fns";

async function fetchResource(id: string) {
  const supabase = createClient();
  const {data, error} = await supabase
    .from('resources')
    .select(`*`)
    .eq('id', Number(id))

  if (error) { throw new Error(error.message) }
  return data[0]
}


async function fetchBookings(id: string) {
  const supabase = createClient();
  const {data, error} = await supabase
    .from('bookings')
    .select(`
      *, 
      resource:resources(id, name, image_url), 
      profile:profiles(id, first_name, last_name)`)
    .eq('resource_id', Number(id))

  if (error) { throw new Error(error.message) }
  return data
}

const Calendar = ({ events, currentDate }: { events: any[], currentDate: Date }) => {
  const calendarRef = useRef<HTMLElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const [timeIndicatorPosition, setTimeIndicatorPosition] = useState(0);
  const hours = Array.from({ length: 13 }, (_, i) => i + 6); // 6 AM to 5 PM

  const getEventStyle = (event: any) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    const startHour = start.getHours(); // Adjust for 6 AM start
    const duration = differenceInMinutes(end, start);

    return {
      gridRowStart: (startHour - 5 + 3 * (startHour - 6)),
      gridRowEnd: `span ${(duration / 15)}`,
    };
  };

  const calculateAndSetIndicatorPosition = useCallback(() => {
    console.info('setting indicator position');
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const minuteOfDay = currentHour * 60 + currentMinute;

    if (minuteOfDay < 360 || minuteOfDay > 1080) { return }
    const segmentSize = (calendarHeight / 780 /* minutes in 13 hours */);
    setTimeIndicatorPosition((minuteOfDay - 360) * segmentSize);
  }, [calendarHeight, setTimeIndicatorPosition]);

  useEffect(() => {
    if (calendarRef.current === null) {
      return
    };
    setCalendarHeight(calendarRef.current.getBoundingClientRect().height);
  }, [calendarRef])

  useEffect(() => {
    if (!calendarHeight) { return; }
    calculateAndSetIndicatorPosition();
    const interval = setInterval(calculateAndSetIndicatorPosition, 60000);
    return () => clearInterval(interval);
  }, [calendarHeight])

  return (
    <div className="bg-white rounded-xl drop-shadow-lg">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM d, yyyy')}</h2>
        <p className="text-gray-600">{format(currentDate, 'EEEE')}</p>
      </div>

      <div ref={calendarRef} className="grid grid-cols-[4rem_1fr] grid-rows-[repeat(52,1.24rem)] gap-0 relative">
        <div className="absolute -left-2 right-0 flex flex-row items-center z-100" style={{ top: timeIndicatorPosition }}>
          <div className="bg-amber-500 rounded-full h-4 w-4"></div>
          <div className="w-full h-1 bg-amber-500"></div>
        </div>

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="text-right pr-2 text-xs text-gray-500 col-start-1 pt-1 border-t" style={{ gridRowStart: (hour - 5 + 3 * (hour - 6)), gridRowEnd: 'span 3' }}>
              {format(new Date().setHours(hour, 0), 'h a')}
            </div>
            <div className="pl-1 text-xs col-start-2 pt-1 border-t" style={{ gridRowStart: (hour - 5 + 3 * (hour - 6)), gridRowEnd: 'span 3' }}>
            </div>
          </React.Fragment>
        ))}
        {events.filter(event => isSameDay(parseISO(event.start), currentDate)).map((event, index) => (
          <div
            key={index}
            className="col-start-2 col-end-2 bg-blue-100 border border-blue-200 rounded p-2 overflow-hidden z-1"
            style={getEventStyle(event)}
          >
            <p className="text-blue-500 text-xs">
              {format(new Date(event.start), "h:mma", {})}
              -
              {format(new Date(event.end), "h:mma", {})}
            </p>
            <h3 className="font-semibold text-sm">{`${event.profile?.first_name} ${event.profile?.last_name}`}</h3>
            <p className="text-xs text-gray-600 truncate">{event.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

type Resource = any;
type Booking = any;

export default function ShowPhoneBooth(props: any) {
  const [resource, setResource] = useState<Resource | null >(null)
  const [bookings, setBookings] = useState<Booking[] | null >(null)
  useLayoutEffect(() => {
    if (!bookings) {
      console.info('Fetching Bookings')
      fetchBookings(props.params.id).then(setBookings);
    }
    if (!resource) {
      console.info('Fetching Resource')
      fetchResource(props.params.id).then(setResource);
    }
  }, [])

  if (!bookings || !resource) { return 'loading' }
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col w-full items-start max-w-screen-xl">
        <h1 className="text-3xl mb-3">{resource.name}</h1>
        <div className="max-w-screen-lg flex-1 w-full">
          <Calendar currentDate={new Date()} events={bookings} />
        </div>
      </div>
    </div>
  )
}
