"use client";
import React, {useEffect, useState} from "react";
import {WeekView} from '@/components/calendar'
import {addMinutes, isWeekend} from "date-fns";
import { useDisclosure } from '@mantine/hooks'
import {Modal, Button, Title, Textarea, Text, Select} from '@mantine/core'
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

  async function handleSubmit() {
    if (!supabase) { return; }

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
      <Modal
        onClose={handleClose}
        opened={opened}
        size="lg"
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
      </Modal>
    </div>

  );
}
