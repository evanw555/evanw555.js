
interface KMeansPoint {
    data: string,
    rank: number
}

function getMinClusterIndex(value: number, centers: number[]): number {
    let minCenter: number = Number.MAX_SAFE_INTEGER;
    let minDifference: number = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < centers.length; i++) {
        const difference: number = Math.abs(value - centers[i]);
        if (difference < minDifference) {
            minCenter = i;
            minDifference = difference;
        }
    }
    return minCenter;
}

// TODO: This is all experimental and should be cleaned up before use
export function generateKMeansClusters(input: Record<string, number>, k: number): any[] {
    const points: KMeansPoint[] = Object.keys(input).map(key => {
        return { data: key, rank: input[key] };
    });
    const minValue: number = Math.min(...Object.values(input));
    const maxValue: number = Math.max(...Object.values(input));
    const valueSet: Set<number> = new Set(Object.values(input));
    valueSet.delete(minValue);
    valueSet.delete(maxValue);
    const randomValues: number[] = Array.from(valueSet)
        .map((x) => ({ x, sort: Math.random() }))
        .sort((x, y) => x.sort - y.sort)
        .map(x => x.x);
    randomValues.push(maxValue);
    randomValues.push(minValue);
    const valueOccurrences: Record<string, number> = {};
    Object.values(input).forEach((value) => {
        valueOccurrences[value.toString()] = valueOccurrences[value.toString()] || 0;
        valueOccurrences[value.toString()]++;
    });
    const range: number = maxValue - minValue;
    const centers: number[] = [];
    for (let i = 0; i < k; i++) {
        const randomCenter: number = randomValues.pop() as number;
        centers.push(randomCenter)
    }
    const getClusters = () => {
        const clusters: KMeansPoint[][] = centers.map((x) => []);
        // Group each point into a particular cluster
        for (let j = 0; j < points.length; j++) {
            const point: KMeansPoint = points[j];
            let minCenter = getMinClusterIndex(point.rank, centers);
            clusters[minCenter].push(point);
        }
        return clusters;
    };
    const printState = () => {
        for (let i = minValue; i <= maxValue; i++) {
            process.stdout.write((i % 10).toString().replace('-', ''));
        }
        process.stdout.write('\n');
        for (let i = minValue; i <= maxValue; i++) {
            if (i.toString() in valueOccurrences) {
                process.stdout.write(valueOccurrences[i.toString()].toString());
            } else {
                process.stdout.write(' ');
            }
        }
        process.stdout.write('\n');
        for (let i = minValue; i <= maxValue; i++) {
            const centerSet: Set<number> = new Set(centers.map(Math.floor.bind(null)));
            if (centerSet.has(i)) {
                process.stdout.write('X');
            } else {
                process.stdout.write(' ');
            }
        }
        process.stdout.write('\n');
    };
    const getClusterAverage = (cluster: KMeansPoint[]): number => {
        return cluster.map((x) => x.rank).reduce((x, y) => x + y) / cluster.length;
    };
    const numPasses: number = 10;
    console.log(Object.values(input).sort());
    let n: number = 0;
    while (true) {
        console.log(`=== Iteration: ${n++} ===`);
        console.log(centers);
        printState();
        const clusters: KMeansPoint[][] = getClusters();
        // Now update the centers for each cluster
        let shouldBreak: boolean = true;
        for (let i = 0; i < k; i++) {
            const center: number = centers[i];
            const cluster: KMeansPoint[] = clusters[i];
            const averageValue: number = getClusterAverage(cluster);
            if (centers[i] !== averageValue) {
                shouldBreak = false;
            }
            centers[i] = averageValue;
        }
        if (shouldBreak) {
            break;
        }
    }
    const finalClusters: KMeansPoint[][] = getClusters();
    return finalClusters.sort((x, y) => {
        return getClusterAverage(x) - getClusterAverage(y);
    }).map((x) => {
        return x.map((y) => {
            return { data: y.data, sort: Math.random() };
        }).sort((a, b) => a.sort - b.sort).map((y) => {
            return `<@${y.data}>`;
        });
    });
}