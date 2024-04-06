export interface Stats {
    count: number;
    min: number;
    max: number;
    sum: number;
    sumSq: number;
}

export interface Bucket {
    timestamp: number;
    labels: object;
    data: any;
    stats: Stats;
}
