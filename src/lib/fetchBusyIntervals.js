import { supabase } from '../supabase';

// dateStr: "YYYY-MM-DD"
export async function fetchBusyIntervals(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+05:00`);
  const endExclusive = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('bookings')
    .select('id,status,start_time,end_time')
    .in('status', ['HELD', 'BOOKED'])
    .lt('start_time', endExclusive.toISOString())
    .gt('end_time', start.toISOString());

  if (error) {
    console.error('fetchBusyIntervals error:', error);
    return [];
  }

  console.log('PKT day:', dateStr);
  console.log('range:', start.toISOString(), endExclusive.toISOString());
  console.log('busy count:', data?.length, data);

  return data ?? [];
}
