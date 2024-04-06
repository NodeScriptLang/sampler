import { Event } from 'nanoevent';

import { Bucket } from './types.js';

/**
 * Collects measurements aggregated by time-based buckets.
 *
 * Each Sampler should correspond to a single numeric measurable (e.g. a latency of some operation).
 * Measurements are grouped by labels (key-value pairs) and time windows (e.g. each minute).
 *
 * Collected buckets are flushed when:
 *
 * - new values are added, if the current time window elapses
 * - when `flushNow` is called
 *
 * When buckets are flushed, the following happens:
 *
 * - all buckets accumulated in preceding time window are emitted via `onFlush` event
 * - current buckets are reset
 * - current time window is updated
 *
 * Usage considerations:
 *
 * - create a sampler per one numeric measurable (e.g. a latency of some operation)
 * - use `onFlush` event to send the accumulated samples to the datastore, those are guaranteed to
 *   not emit more frequently than the configured bucket interval (e.g. only once a minute)
 * - call `flushNow` at the end of the application to make sure that the latest accumulated samples are flushed
 */
export class Sampler<L extends object = {}> {

    onFlush = new Event<Bucket[]>();

    private bucketMap = new Map<string, Bucket>();
    private currentWindowTs = 0;

    constructor(
        readonly bucketInverval = 60_000,
    ) {}

    add(value: number, labels: L, data: any) {
        this.flushBuckets();
        const key = this.getLabelsKey(labels);
        const bucket = this.bucketMap.get(key);
        if (bucket) {
            bucket.stats.count += 1;
            bucket.stats.sum += value;
            bucket.stats.sumSq += value * value;
            bucket.stats.min = Math.min(bucket.stats.min, value);
            bucket.stats.max = Math.max(bucket.stats.max, value);
            bucket.data = data;
        } else {
            this.bucketMap.set(key, {
                timestamp: this.currentWindowTs,
                labels,
                data,
                stats: {
                    count: 1,
                    min: value,
                    max: value,
                    sum: value,
                    sumSq: value * value,
                },
            });
        }
    }

    flushNow() {
        this.flushBuckets(true);
    }

    private getLabelsKey(labels: L) {
        return Object.entries(labels)
            .map(([k, v]) => `${k}=${v}`)
            .sort()
            .join(',');
    }

    private flushBuckets(force = false) {
        const ts = Math.floor(Date.now() / this.bucketInverval) * this.bucketInverval;
        if (!force && ts === this.currentWindowTs) {
            return;
        }
        this.currentWindowTs = ts;
        const buckets = [...this.bucketMap.values()];
        this.onFlush.emit(buckets);
        this.bucketMap.clear();
    }

}
