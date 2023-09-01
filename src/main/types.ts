export interface Stats {
    count: number;
    min: number;
    max: number;
    sum: number;
    sumSq: number;
}

export interface Labels {
    [key: string]: string;
}

export interface Bucket {
    timestamp: number;
    labels: Labels;
    data: any;
    stats: Stats;
}
