import { calculateMedian } from "./processData";

export class Filter {
  constructor() {

  }

  public static hampel(input: number[], windowSize: number, sigma: number = 3): number[] {
    const n = input.length;
    const inputCopy = [...input];
    const k = 1.4826;

    for (let i = windowSize; i < n - windowSize; i++) {
      const slicedArray = input.slice(i - windowSize, i + windowSize);
      const rMedian = calculateMedian(slicedArray);
      slicedArray.forEach((val, index) => {
        slicedArray[index] = val - rMedian;
      });
      slicedArray.forEach((val, index) => {val = Math.abs(val)});
      const rMAD = k * calculateMedian(slicedArray);
      if (Math.abs(input[i] - rMedian) > sigma * rMAD) {
        inputCopy[i] = rMedian;
      }
    }

    return inputCopy;
  }
}
