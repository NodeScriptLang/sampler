import { Stats } from './types.js';

export function getEmptyStats(): Stats {
    return {
        count: 0,
        sum: 0,
        sumSq: 0,
        min: +Infinity,
        max: -Infinity,
    };
}

export function aggregateStats(stats: Stats[]) {
    const res = getEmptyStats();
    for (const stat of stats) {
        res.count += stat.count;
        res.sum += stat.sum;
        res.sumSq += stat.sumSq;
        res.min = Math.min(stat.min, res.min);
        res.max = Math.max(stat.max, res.max);
    }
    return res;
}
