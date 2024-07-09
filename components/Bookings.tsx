"use client";
import React, {useEffect, useState} from "react";
import {WeekView} from '@/components/calendar'
import {addDays, addMinutes, areIntervalsOverlapping, Interval, isAfter, isBefore, isFuture, isWeekend} from "date-fns";
import { useDisclosure } from '@mantine/hooks'
import {Modal, Button, Title, Textarea, Text, Select, Drawer} from '@mantine/core'
import {DateTimePicker, DateValue} from "@mantine/dates";
import {useSupabase} from "@/utils/supabase/useSupabase";

function EditBookingForm(props: any) {
  function handleChangePhonebooth(resourceId: string | null) {
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
        <Title order={3}>Edit a booking</Title>
        <Text size="md" c="dimmed">Use this form to edit an existing booking.</Text>
      </div>
      <div>
        <div className="mb-3">
          <Select
            label="Room to book"
            placeholder="Select a phone booth"
            onChange={handleChangePhonebooth}
            value={String(props.value.resourceId)}
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
      <div className="flex flex-row justify-between">
        <div>
          <Button radius="xl" color="red" onClick={props.onDelete}>Delete</Button>
        </div>
        <div>
          <Button classNames={{ root: 'mr-1' }} radius="xl" variant="subtle" onClick={props.onCancel}>Cancel</Button>
          <Button radius="xl" onClick={props.onSubmit}>Update Booking</Button>
        </div>
      </div>
    </div>
  )
}

function NewBookingForm(props: any) {
  function handleChangePhonebooth(resourceId: string | null) {
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
  function isValid(value: any) {
    if (!value.resourceId) {
      console.info('No phone booth selected')
      return false
    }
    if (!value.start) {
      console.info('No start date selected')
      return false;
    }
    if (!value.end) {
      console.info('No end date selected')
      return false;
    }
    if (!isFuture(value.start)) {
      console.info('Start date past')
      return false;
    }
    if (!isAfter(value.end, value.start)) {
      console.info('End date invalid')
      return false;
    }
    return true;
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
        <Button radius="xl" disabled={!isValid(props.value)} onClick={props.onSubmit}>Submit</Button>
      </div>
    </div>
  )
}

const EMPTY_BOOKING = { resourceId: null, notes: '', start: null, end: null }

export default function Bookings() {
  const supabase = useSupabase();
  const [bookings, setBookings] = useState<any[]>([]);
  const [opened, { open, close }] = useDisclosure(false)
  const [activeForm, setActiveForm] = useState<'new' | 'edit'>('new');
  const [newBookingParams, setNewBookingParams] = useState<{ resourceId: number | null, notes: string, start: DateValue, end: DateValue }>(EMPTY_BOOKING)
  const [editBookingParams, setEditBookingParams] = useState<{ id?: number, resourceId: number | null, notes: string, start: DateValue, end: DateValue }>(EMPTY_BOOKING)

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return; }

    const {data, error} = await supabase
      .from('bookings')
      .select(`*, resource:resources(id, name, image_url)`)

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
    setActiveForm('new');
    open();
  }

  const handleStartEdit = (event: { id: number, resourceId: number, title: string, notes: string, startDate: Date, endDate: Date }) => {
    setEditBookingParams({
      id: event.id,
      resourceId: event.resourceId,
      notes: event.notes,
      start: event.startDate,
      end: event.endDate,
    });
    setActiveForm('edit');
    open();
  }

  function getConflictingBookings(bookingIntervalToCheck: Interval, bookings: any[]) {
    return bookings.filter(booking => areIntervalsOverlapping(
      bookingIntervalToCheck,
      { start: new Date(booking.start), end: new Date(booking.end)
      }));
  }

  async function handleSubmit() {
    if (!supabase) { return; }
    else if (!newBookingParams.start || !newBookingParams.end) {
      return;
    }

    const tomorrow = addDays(new Date(), 1).toISOString();

    const { data: bookingsForRoomToday, error: conflictError } = await supabase
      .from('bookings')
      .select('*')
      .eq('resource_id', newBookingParams.resourceId)
      .gte('end', newBookingParams.start.toISOString())
      .lte('end', tomorrow)

    const conflictingBookings = getConflictingBookings(
      { start: newBookingParams.start as Date, end: newBookingParams.end as Date },
      bookingsForRoomToday || []
    );

    console.info({ bookingsForRoomToday, conflictingBookings })

    if (conflictError) {
      alert('Error checking for conflicts. Please try again.');
      return;
    }

    if (conflictingBookings.length > 0) {
      alert('There is a conflicting booking for this resource and time slot.');
      return;
    }

    const { data, error } = await supabase
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

  async function handleUpdateBooking() {
    const { data, error } = await supabase
      .from('bookings')
      .update([
        {
          resource_id: editBookingParams.resourceId,
          start: editBookingParams.start,
          end: editBookingParams.end,
          notes: editBookingParams.notes,
        },
      ])
      .eq('id', editBookingParams.id)
      .select()

    if (error) {
      alert('Something went wrong. Please try again.');
    }

    await fetchBookings();
    handleClose();
  }

  async function handleDeleteBooking() {
    const confirmed = confirm('Are you sure you want to delete this booking?');
    if (!confirmed) { return; }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', editBookingParams.id)
      .select()

    if (error) {
      alert('Something went wrong. Please try again.');
    }

    await fetchBookings();
    handleClose();
  }

  const handleClose = () => {
    setNewBookingParams(EMPTY_BOOKING);
    setEditBookingParams(EMPTY_BOOKING)
    close();
  }

  useEffect(() => {
    fetchBookings();
  }, [])

  return (
    <div className="w-full max-w-screen-2xl">
      <div className="flex flex-row items-start justify-between w-full">
        <h2 className="font-bold text-4xl mb-4">Your Bookings</h2>
        <Button onClick={() => handleStartCreate()}>Book a phone booth</Button>
      </div>
      <WeekView
        initialDate={new Date()}
        weekStartsOn={1}
        disabledCell={(date) => !isFuture(date)}
        // rendering of the events on the calendar is not dependent on cells but rather hours in a day
        hiddenHour={(date) => date.getHours() < 6 || date.getHours() > 18}
        onCellClick={(cell) => {
          handleStartCreate(cell)
        }}
        onEventClick={(event: { id: number, title: string, resourceId: number, notes: string, startDate: Date, endDate: Date }) => {
          handleStartEdit(event)
        }}
        events={bookings.map(booking => ({
          id: booking.id,
          title: booking.resource.name,
          notes: booking.notes,
          resourceId: booking.resource.id,
          startDate: new Date(booking.start),
          endDate: new Date(booking.end),
        }))
        }
      />
      <Drawer
        position="right"
        onClose={handleClose}
        opened={opened}
      >
        {activeForm === 'new' && (
          <NewBookingForm
            value={newBookingParams}
            onChange={setNewBookingParams}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        )}
        {activeForm === 'edit' && (
          <EditBookingForm
            value={editBookingParams}
            onChange={setEditBookingParams}
            onSubmit={handleUpdateBooking}
            onDelete={handleDeleteBooking}
            onCancel={handleClose}
          />
        )}
      </Drawer>
    </div>

  );
}
