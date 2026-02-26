import { supabase } from '../supabase';

// dateStr: "YYYY-MM-DD"
export async function fetchBusyIntervals(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+05:00`);
  const endExclusive = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  // Query from booking_slots, select start_datetime, end_datetime, and status_id
  // You may need to adjust status_id values for HELD/BOOKED as per your DB

  let data, error;
  try {
    const res = await supabase
      .from('booking_slots')
      .select('id,status_id,start_datetime,end_datetime')
      .in('status_id', [1,2])
      .lt('start_datetime', endExclusive.toISOString())
      .gt('end_datetime', start.toISOString());
    data = res.data;
    error = res.error;
  } catch (err) {
    error = err;
    data = null;
  }

  if (error) {
    console.error('fetchBusyIntervals error:', error?.message || error);
    console.error(JSON.stringify(error, null, 2));
    return { error };
  }

  console.log('PKT day:', dateStr);
  console.log('range:', start.toISOString(), endExclusive.toISOString());
  console.log('busy count:', data?.length, data);

  return { data: data ?? [] };
}
