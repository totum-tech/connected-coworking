"use client";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";
import {WeekView} from '@/components/calendar'
import {isWeekend} from "date-fns";
import {Modal, useModal} from '@geist-ui/core'

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const { visible, setVisible, bindings } = useModal()

  const fetchBookings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return; }

    const {data, error} = await supabase
      .from('bookings')
      .select(`*, resource:resources(id, name, image_url)`)
      .eq('user_id', user.id)

    console.info('fetched', data)
    if (error) {
      console.error('Error fetching bookings:', error.message);
      return;
    }
    setBookings(data);
  }

  const handleStartCreate = () => {
    setVisible(true)
  }

  useEffect(() => {
    fetchBookings();
  }, [])

  return (
    <div className="flex flex-col max-w-screen-2xl">
      <div className="flex flex-row items-start justify-between w-full">
        <h2 className="font-bold text-4xl mb-4">Your Bookings</h2>
        <button className="text-foreground/80 font-bold hover:underline" onPointerDown={handleStartCreate}>
          Add a booking
        </button>
      </div>
      <WeekView
        initialDate={new Date()}
        weekStartsOn={1}
        disabledDay={(date) => isWeekend(date)}
        // rendering of the events on the calendar is not dependent on cells but rather hours in a day
        hiddenHour={(date) => date.getHours() < 6 || date.getHours() > 18}
        onCellClick={(cell) => {
          handleStartCreate(cell)
        }}
        events={bookings.map(booking => ({
          id: booking.id,
          title: booking.resource.name,
          startDate: new Date(booking.start),
          endDate: new Date(booking.end),
        }))
        }
      />
      <Modal {...bindings}>
        <Modal.Title>Modal</Modal.Title>
        <Modal.Subtitle>This is a modal</Modal.Subtitle>
        <Modal.Content>
          <p>Some content contained within the modal.</p>
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>Cancel</Modal.Action>
        <Modal.Action>Submit</Modal.Action>
      </Modal>
    </div>

  );
}
