import { UsageSamplePoint } from '@/app/domains/customers/data';

export type UsageBucket = {
  /** Bucket start, epoch millis. */
  time: number;
  inputOctets: number;
  outputOctets: number;
}

/**
 * Buckets raw per-packet samples into fixed time bins (sums of delta bytes per bin). Empty bins
 * between the first and last sample are included with zeros so the chart shows gaps honestly.
 */
export function bucketSamples(samples: UsageSamplePoint[], binMs: number): UsageBucket[] {
  if (samples.length === 0) return [];

  const sums = new Map<number, { inputOctets: number; outputOctets: number }>();
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const sample of samples) {
    const bucket = Math.floor(Date.parse(sample.timestamp) / binMs) * binMs;
    min = Math.min(min, bucket);
    max = Math.max(max, bucket);
    const sum = sums.get(bucket) ?? { inputOctets: 0, outputOctets: 0 };
    sum.inputOctets += sample.inputOctets;
    sum.outputOctets += sample.outputOctets;
    sums.set(bucket, sum);
  }

  const buckets: UsageBucket[] = [];
  for (let time = min; time <= max; time += binMs) {
    const sum = sums.get(time);
    buckets.push({
      time,
      inputOctets: sum?.inputOctets ?? 0,
      outputOctets: sum?.outputOctets ?? 0,
    });
  }
  return buckets;
}
