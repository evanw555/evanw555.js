"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKMeansClusters = void 0;
function getMinClusterIndex(value, centers) {
    let minCenter = Number.MAX_SAFE_INTEGER;
    let minDifference = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < centers.length; i++) {
        const difference = Math.abs(value - centers[i]);
        if (difference < minDifference) {
            minCenter = i;
            minDifference = difference;
        }
    }
    return minCenter;
}
// TODO: This is all experimental and should be cleaned up before use
function generateKMeansClusters(input, k) {
    const points = Object.keys(input).map(key => {
        return { data: key, rank: input[key] };
    });
    const minValue = Math.min(...Object.values(input));
    const maxValue = Math.max(...Object.values(input));
    const valueSet = new Set(Object.values(input));
    valueSet.delete(minValue);
    valueSet.delete(maxValue);
    const randomValues = Array.from(valueSet)
        .map((x) => ({ x, sort: Math.random() }))
        .sort((x, y) => x.sort - y.sort)
        .map(x => x.x);
    randomValues.push(maxValue);
    randomValues.push(minValue);
    const valueOccurrences = {};
    Object.values(input).forEach((value) => {
        valueOccurrences[value.toString()] = valueOccurrences[value.toString()] || 0;
        valueOccurrences[value.toString()]++;
    });
    const range = maxValue - minValue;
    const centers = [];
    for (let i = 0; i < k; i++) {
        const randomCenter = randomValues.pop();
        centers.push(randomCenter);
    }
    const getClusters = () => {
        const clusters = centers.map((x) => []);
        // Group each point into a particular cluster
        for (let j = 0; j < points.length; j++) {
            const point = points[j];
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
            }
            else {
                process.stdout.write(' ');
            }
        }
        process.stdout.write('\n');
        for (let i = minValue; i <= maxValue; i++) {
            const centerSet = new Set(centers.map(Math.floor.bind(null)));
            if (centerSet.has(i)) {
                process.stdout.write('X');
            }
            else {
                process.stdout.write(' ');
            }
        }
        process.stdout.write('\n');
    };
    const getClusterAverage = (cluster) => {
        return cluster.map((x) => x.rank).reduce((x, y) => x + y) / cluster.length;
    };
    const numPasses = 10;
    console.log(Object.values(input).sort());
    let n = 0;
    while (true) {
        console.log(`=== Iteration: ${n++} ===`);
        console.log(centers);
        printState();
        const clusters = getClusters();
        // Now update the centers for each cluster
        let shouldBreak = true;
        for (let i = 0; i < k; i++) {
            const center = centers[i];
            const cluster = clusters[i];
            const averageValue = getClusterAverage(cluster);
            if (centers[i] !== averageValue) {
                shouldBreak = false;
            }
            centers[i] = averageValue;
        }
        if (shouldBreak) {
            break;
        }
    }
    const finalClusters = getClusters();
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
exports.generateKMeansClusters = generateKMeansClusters;
//# sourceMappingURL=k-means.js.map