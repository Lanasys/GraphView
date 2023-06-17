import * as math from 'mathjs'

export class Filter {
  constructor() {

  }  

  public static hampel(input: number[], windowSize: number, sigma: number = 3): number[] {
    const n = input.length;
    const inputCopy = [...input];
    const k = 1.4826;

    for (let i = windowSize; i < n - windowSize; i++) {
      const slicedArray = input.slice(i - windowSize, i + windowSize);
      const rMedian = math.median(slicedArray);
      slicedArray.forEach((val, index) => {
        slicedArray[index] = val - rMedian;
      });
      const rMAD = k * math.median(math.abs(slicedArray));
      if (math.abs(input[i] - rMedian) > sigma * rMAD) {
        inputCopy[i] = rMedian;
      }
    }

    return inputCopy;
  }  
}
