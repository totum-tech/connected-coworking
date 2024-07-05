"use client";
import {createClient} from "@/utils/supabase/client";
import React, {useEffect, useState} from "react";
import {WeekView} from '@/components/calendar'
import {addMinutes, isWeekend} from "date-fns";
import { useDisclosure } from '@mantine/hooks'
import {Modal, Button, Title, Textarea} from '@mantine/core'

type NewBookingModalProps = {
  initialValues: { start: Date, end: Date } | null
  onOpen: () => void
  onClose: () => void
  visible: boolean
}
function NewBookingModal(props: NewBookingModalProps) {
  const [notes, setNotes] = useState('');

  function handleCancel() {
    props.onClose()
    setNotes('');
  }
  function handleSubmit() {
    console.info('submit', { notes })
    props.onClose()
  }
  return (
    <Modal opened={props.visible} onClose={props.onClose}>
      <div className="flex flex-col">
        <div className="mb-3">
          <Title order={3}>Create a new booking</Title>
        </div>
        <div>
          <div className="mb-3">
            <Textarea
              placeholder="Notes about this booking"
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
            />
          </div>
          <div className="mb-3">
            <Title order={5}>Start Time</Title>
            {props.initialValues?.start?.toString()}
          </div>
          <div className="mb-3">
            <Title order={5}>End Time</Title>
            {props.initialValues?.end?.toString()}
          </div>
        </div>
        <div className="flex flex-row justify-end">
          <Button classNames={{ root: 'mr-1' }} radius="xl" variant="subtle" onClick={handleCancel}>Cancel</Button>
          <Button radius="xl" onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [opened, { open, close }] = useDisclosure(false)
  const [initialBookingParams, setInitialBookingParams] = useState<{ start: Date, end: Date } | null>(null);

  const fetchBookings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return; }

    const {data, error} = await supabase
      .from('bookings')
      .select(`*, resource:resources(id, name, image_url)`)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching bookings:', error.message);
      return;
    }
    setBookings(data);
  }

  const handleStartCreate = (cell?: {date: Date, hour: string, minute: string, hourAndMinute: string, disabled: boolean}) => {
    if (cell) {
      setInitialBookingParams({
        start: cell.date,
        end: addMinutes(cell.date, 30)
      });
    }
    open();
  }

  const handleClose = () => {
    close();
    setInitialBookingParams(null);
  }

  useEffect(() => {
    fetchBookings();
  }, [])

  return (
    <div className="flex flex-col max-w-screen-2xl">
      <div className="flex flex-row items-start justify-between w-full">
        <h2 className="font-bold text-4xl mb-4">Your Bookings</h2>
        <button className="text-foreground/80 font-bold hover:underline" onPointerDown={() => handleStartCreate()}>
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
      <NewBookingModal initialValues={initialBookingParams} onOpen={open} onClose={handleClose} visible={opened} />
    </div>

  );
}
