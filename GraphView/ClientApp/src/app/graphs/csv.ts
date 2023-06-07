import { DataSet } from './models';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { first } from 'rxjs';

export function ProcessData(data: any, fileName: string) {
  //тут перевірка на версію

  let dataSet = new DataSet();

  let currentDate: string = new Date().toLocaleTimeString();
  dataSet.name = fileName + currentDate;
  dataSet.displayName = fileName;
  dataSet.isDisplayed = true;

  let firstLine = data[1];
  dataSet.applicationName = firstLine[0];
  dataSet.runtime = firstLine[4];
  dataSet.resolution = firstLine[3];

  dataSet.gpuName = firstLine[1];
  dataSet.cpuName = firstLine[2];

  let zeroTime = firstLine[12] * 1000;
  let numbersOfCores = 0;
  for (let c = 0; c <= 63; c++) {
    if (data[42 + c] == "NA") {
      break;
    }
    numbersOfCores++;
  }

  for (let i = 1; i < data.length; i++) {
    dataSet.time.push(data[12] * 1000 - zeroTime);
    dataSet.frameTimePresent.push(data[13]);
    dataSet.frameTimeDisplayChange.push(data[14]);

    dataSet.gpuClock.push(data[20]);
    dataSet.gpuMemoryClock.push(data[21]);
    dataSet.gpuUtilization.push(data[22]);
    dataSet.gpuTemperature.push(data[23]);
    //dataSet.gpuPower.push(data[24]); //треба брати із потрібного джерела

    dataSet.cpuClock.push(data[37]);
    dataSet.cpuUtilization.push(data[38]);
    dataSet.cpuTemperature.push(data[39]);
    dataSet.cpuPower.push(data[40]);
    dataSet.cpuTDP.push(data[41]);
    let cpuUtilizationPerCorePerFrame: number[] = [];
    for (let c = 0; c < numbersOfCores; c++) {
      cpuUtilizationPerCorePerFrame.push(data[42 + c]);
    }
    dataSet.cpuUtilizationPerCore.push(cpuUtilizationPerCorePerFrame);

    dataSet.batteryCapacityWattHours.push(data[106]);
    dataSet.batteryPercentRemaining.push(data[108]);
    dataSet.batteryDrainRate.push(data[109]);
  }



  return dataSet;
}
