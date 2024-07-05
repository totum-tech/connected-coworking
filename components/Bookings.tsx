"use client";
import {createClient} from "@/utils/supabase/client";
import React, {useEffect, useState} from "react";
import {WeekView} from '@/components/calendar'
import {addMinutes, isWeekend} from "date-fns";
import { useDisclosure } from '@mantine/hooks'
import {Modal, Button, Title, Textarea, Text, Select} from '@mantine/core'
import {DateTimePicker, DateValue} from "@mantine/dates";
import {SupabaseClient} from "@supabase/supabase-js";

function NewBookingForm(props: any) {
  function handleChangePhonebooth(resourceId: string) {
    props.onChange({ ...props.value, resourceId: Number(resourceId) })
  }
  function handleChangeNotes(notes: string) {
    props.onChange({ ...props.value, notes })
  }
  function handleChangeStart(start: DateValue) {
    props.onChange({ ...props.value, start })
  }
  function handleChangeEnd(end: DateValue) {
    props.onChange({ ...props.value, end })
  }
  return (
    <div className="flex flex-col">
      <div className="mb-3">
        <Title order={3}>Create a new booking</Title>
        <Text size="md" c="dimmed">Use this form to book time in one of our call booths.</Text>
      </div>
      <div>
        <div className="mb-3">
          <Select
            label="Room to book"
            placeholder="Select a phone booth"
            onChange={handleChangePhonebooth}
            data={[
              { label: '⚡️Power Phonebooth', value: '2' },
              { label: '😎 Private Phonebooth', value: '1' },
            ]}
          />
        </div>
        <div className="flex flex-row pb-3">
          <div className="flex-1 pr-3">
            <DateTimePicker
              valueFormat="dddd, MMMM D hh:mm A"
              label="Start"
              placeholder="Pick date and time"
              value={props.value.start} onChange={handleChangeStart}
            />
          </div>
          <div className="flex-1">
            <DateTimePicker
              valueFormat="dddd, MMMM D hh:mm A"
              label="End"
              placeholder="Pick date and time"
              value={props.value.end} onChange={handleChangeEnd}
            />
          </div>
        </div>
        <div className="mb-3">
          <Textarea
            placeholder="Notes about this booking"
            label="Notes"
            value={props.value?.notes}
            onChange={(event) => handleChangeNotes(event.currentTarget.value)}
          />
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <Button classNames={{ root: 'mr-1' }} radius="xl" variant="subtle" onClick={props.onCancel}>Cancel</Button>
        <Button radius="xl" onClick={props.onSubmit}>Submit</Button>
      </div>
    </div>
  )
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [opened, { open, close }] = useDisclosure(false)
  const [newBookingParams, setNewBookingParams] = useState<{ resourceId: number | null, notes: string, start: DateValue, end: DateValue }>({ resourceId: null, notes: '', start: null, end: null })
  const supabaseRef = React.useRef<SupabaseClient>();

  useEffect(() => {
    if (supabaseRef.current) return;
    supabaseRef.current = createClient();
  }, [supabaseRef]);

  const fetchBookings = async () => {
    if (!supabaseRef.current) { return; }
    const { data: { user } } = await supabaseRef.current.auth.getUser();

    if (!user) { return; }

    const {data, error} = await supabaseRef
      .current
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
      setNewBookingParams({
        resourceId: null,
        notes: '',
        start: cell.date,
        end: addMinutes(cell.date, 30),
      });
    }
    open();
  }

  async function handleSubmit() {
    if (!supabaseRef.current) { return; }

    console.info(newBookingParams);
    const { data, error } = await supabaseRef
      .current
      .from('bookings')
      .insert([
        {
          resource_id: newBookingParams.resourceId,
          start: newBookingParams.start,
          end: newBookingParams.end,
          notes: newBookingParams.notes,
        },
      ])
      .select()

    if (error) {
      alert('Something went wrong. Please try again.');
    }

    await fetchBookings();
    handleClose();
  }

  const handleClose = () => {
    setNewBookingParams({
      resourceId: null,
      notes: '',
      start: null,
      end: null,
    });
    close();
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
      <Modal
        onClose={handleClose}
        opened={opened}
        size="lg"
      >
        <NewBookingForm
          value={newBookingParams}
          onChange={setNewBookingParams}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </div>

  );
}
