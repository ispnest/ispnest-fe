/** One completed day's usage totals (dates are ISO `yyyy-MM-dd`, octets are bytes). */
export type DailyUsagePoint = {
  date: string;
  inputOctets: number;
  outputOctets: number;
}

/** One raw per-packet usage sample (timestamp is an ISO instant, octets are delta bytes). */
export type UsageSamplePoint = {
  timestamp: string;
  inputOctets: number;
  outputOctets: number;
}

/**
 * Per-customer usage timeseries: `daily` covers completed days from the rollup table, `samples`
 * covers today's not-yet-rolled-up tail. The two never overlap.
 */
export type CustomerUsageTimeseries = {
  customerId: string;
  from: string;
  to: string;
  daily: DailyUsagePoint[];
  samples: UsageSamplePoint[];
}

/** Network-wide usage for the dashboard: daily totals plus today's live totals. */
export type NetworkDailyUsage = {
  from: string;
  to: string;
  daily: DailyUsagePoint[];
  todayInputOctets: number;
  todayOutputOctets: number;
}

/** One row of the dashboard "top consumers today" ranking. */
export type TopConsumer = {
  customerId: string;
  fullName: string;
  accountCode: string;
  inputOctets: number;
  outputOctets: number;
}

/** SSE `usage-delta` event: delta bytes carried by one accounting packet. */
export type UsageDeltaEvent = {
  timestamp: string;
  inputOctets: number;
  outputOctets: number;
}

/** SSE `network-usage` event: total delta bytes across all customers in the window. */
export type NetworkUsageEvent = {
  windowStart: string;
  windowEnd: string;
  inputOctets: number;
  outputOctets: number;
}
