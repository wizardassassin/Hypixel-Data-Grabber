export class MathWrapper {
    static average(arr: number[]) {
        const sum = arr.reduce((a, b) => a + b);
        return sum / arr.length;
    }

    static calculateBoxPlot(arr: number[]) {
        const retObj = {
            Q0: 0,
            Q1: 0,
            Q2: 0,
            Q3: 0,
            Q4: 0,
        };
        const len = arr.length - 1;
        const half = len / 2;
        retObj.Q0 = arr[0];
        retObj.Q4 = arr[len];
        retObj.Q2 = MathWrapper.average([
            arr[Math.floor(half)],
            arr[Math.ceil(half)],
        ]);
        const q1Mid = MathWrapper.average([0, Math.ceil(half - 1)]);
        retObj.Q1 = MathWrapper.average([
            arr[Math.floor(q1Mid)],
            arr[Math.ceil(q1Mid)],
        ]);
        const q3Mid = MathWrapper.average([Math.floor(half + 1), len]);
        retObj.Q3 = MathWrapper.average([
            arr[Math.floor(q3Mid)],
            arr[Math.ceil(q3Mid)],
        ]);
        return retObj;
    }
}
