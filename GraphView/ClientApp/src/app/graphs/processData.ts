import { isEqual } from 'lodash';
import { DataSet } from './models';
import csvHeaders from '../../assets/json/csvHeaders.json'

export function ProcessData(data: any, fileName: string) {

  if (!Object.values(csvHeaders).some((arr) => isEqual(arr, data[0]))) return null;

  let dataSet = new DataSet();

  dataSet.name = fileName;
  dataSet.displayName = fileName;
  dataSet.isDisplayed = true;

  let firstLine = data[1];
  dataSet.applicationName = firstLine[0];
  dataSet.runtime = firstLine[4];
  dataSet.resolution = firstLine[3];

  dataSet.gpuName = firstLine[1];
  dataSet.cpuName = firstLine[2];

  let zeroTime = firstLine[12];
  let numbersOfCores = 0;
  for (let c = 0; c <= 63; c++) {
    if (data[42 + c] == "NA") {
      break;
    }
    numbersOfCores++;
  }

  for (let i = 1; i < data.length; i++) {
    dataSet.time.push(Number(data[i][12] - zeroTime));
    dataSet.frameTimePresent.push(Number(data[i][13]));
    if (Number(data[i][14]) != 0) {
      dataSet.frameTimeDisplayChange.push(Number(data[i][14]));
      dataSet.timeDisplay.push(Number(data[i][12] - zeroTime));
    }

    dataSet.gpuClock.push(Number(data[i][20]));
    dataSet.gpuMemoryClock.push(Number(data[i][21]));
    dataSet.gpuUtilization.push(Number(data[i][22]));
    dataSet.gpuTemperature.push(Number(data[i][23]));
    if (data[i][35] != "NA") {
      dataSet.gpuPower.push(Number(data[i][35]));
    } else if (data[i][36] != "NA") {
      dataSet.gpuPower.push(Number(data[i][36]));
    } else {
      dataSet.gpuPower.push(0);
    }
    //dataSet.gpuPower.push(data[i][24]); //треба брати із потрібного джерела

    dataSet.cpuClock.push(Number(data[i][37]));
    dataSet.cpuUtilization.push(Number(data[i][38]));
    dataSet.cpuTemperature.push(Number(data[i][39]));
    dataSet.cpuPower.push(Number(data[i][40]));
    dataSet.cpuTDP.push(Number(data[i][41]));
    let cpuUtilizationPerCorePerFrame: number[] = [];
    for (let c = 0; c < numbersOfCores; c++) {
      cpuUtilizationPerCorePerFrame.push(Number(data[i][42 + c]));
    }
    dataSet.cpuUtilizationPerCore.push(cpuUtilizationPerCorePerFrame);

    dataSet.batteryCapacityWattHours.push(Number(data[i][106]));
    dataSet.batteryPercentRemaining.push(Number(data[i][108]));
    dataSet.batteryDrainRate.push(Number(data[i][109]));
  }

  dataSet.gpuClockAvg = calculateMedian(dataSet.gpuClock);
  dataSet.gpuMemoryClockAvg = calculateMedian(dataSet.gpuMemoryClock);
  dataSet.gpuUtilizationAvg = calculateMedian(dataSet.gpuUtilization);
  dataSet.gpuTemperatureAvg = calculateMedian(dataSet.gpuTemperature);
  dataSet.gpuTemperatureMax = Math.max(...dataSet.gpuTemperature);
  dataSet.gpuTemperatureMin = Math.min(...dataSet.gpuTemperature);
  dataSet.gpuPowerAvg = calculateMedian(dataSet.gpuPower);
  dataSet.gpuPowerMax = Math.max(...dataSet.gpuPower);
  dataSet.gpuPowerMin = Math.min(...dataSet.gpuPower);

  dataSet.cpuClockAvg = calculateMedian(dataSet.cpuClock);
  dataSet.cpuUtilizationAvg = calculateMedian(dataSet.cpuUtilization);
  dataSet.cpuTemperatureAvg = calculateMedian(dataSet.cpuTemperature);
  dataSet.cpuTemperatureMax = Math.max(...dataSet.cpuTemperature);
  dataSet.cpuTemperatureMin = Math.min(...dataSet.cpuTemperature);
  dataSet.cpuPowerAvg = calculateMedian(dataSet.cpuPower);
  dataSet.cpuPowerMax = Math.max(...dataSet.cpuPower);
  dataSet.cpuPowerMin = Math.min(...dataSet.cpuPower);
  dataSet.cpuTDPMax = Math.max(...dataSet.cpuTDP);
  dataSet.cpuTDPMin = Math.min(...dataSet.cpuTDP);

  dataSet.batteryDrainRateAvg = calculateMedian(dataSet.batteryDrainRate);
  dataSet.batteryDrainRateMax = Math.max(...dataSet.batteryDrainRate);
  dataSet.batteryDrainRateMin = Math.min(...dataSet.batteryDrainRate);

  dataSet.statisticsAPI = dataSet.statisticsComparison(true);
  dataSet.statisticsDisplay = dataSet.statisticsComparison(false);

  return dataSet;
}

function calculateMedian(numbers: number[]): number {
  const sortedNumbers = numbers.sort((a, b) => a - b);

  const length = sortedNumbers.length;
  const middleIndex = Math.floor(length / 2);

  if (length % 2 === 0) {
    return Number((sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2);
  } else {
    return Number(sortedNumbers[middleIndex]);
  }
}

