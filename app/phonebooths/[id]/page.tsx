"use client";
import {useLayoutEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {format, isSameDay, parseISO} from "date-fns";
import React from "react";

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
  const hours = Array.from({ length: 13 }, (_, i) => i + 6); // 6 AM to 5 PM

  const getEventStyle = (event: any) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    const startHour = start.getHours(); // Adjust for 6 AM start
    const endHour = end.getHours();

    return {
      gridRowStart: startHour + 10,
      gridRowEnd: `span ${Math.ceil(endHour - startHour) * 4}`,
    };
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM d, yyyy')}</h2>
        <p className="text-gray-600">{format(currentDate, 'EEEE')}</p>
      </div>

      <div className="grid grid-cols-[4rem_1fr] grid-rows-[repeat(52,2rem)] gap-0 relative">

        <div className="absolute -left-2 right-0 flex flex-row items-center">
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
            className="col-start-2 col-end-2 bg-blue-100 border border-blue-200 rounded p-2 overflow-hidden z-10"
            style={getEventStyle(event)}
          >
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
          <h3 className="text-xl mb-2">Bookings</h3>
          <Calendar currentDate={new Date()} events={bookings} />
        </div>
      </div>
    </div>
  )
}
