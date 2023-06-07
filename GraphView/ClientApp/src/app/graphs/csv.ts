import { DataSet } from './models';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { first } from 'rxjs';

function ReadCSVFile(file: any) {
  //тут перевірка на версію

  let dataSet = new DataSet();
  let csvParser = new NgxCsvParser();
  let data: any;
  let isParsed = true;
  csvParser.parse(file, { header: true, delimiter: ',', encoding: 'utf8' })
    .pipe().subscribe({
    next: (result): void => {
      data = result;
    },
    error: (error: NgxCSVParserError): void => {
      isParsed = false;
    }
    });
  if (!isParsed) return null;

  let currentDate: string = new Date().toLocaleTimeString();
  dataSet.name = file.name + currentDate;
  dataSet.displayName = file.name;
  dataSet.isDisplayed = true;

  let firstLine = data[1];
  dataSet.applicationName = firstLine[0];
  dataSet.runtime = firstLine[4];
  dataSet.resolution = firstLine[3];

  dataSet.gpuName = firstLine[1];
  dataSet.cpuName = firstLine[2];

  let zeroTime = firstLine[12] * 1000;
  for (let i = 1; i < data.length; i++) {
    dataSet.time.push(data[12] * 1000 - zeroTime);
    dataSet.frameTimePresent.push(data[13]);
    dataSet.frameTimeDisplayChange.push(data[14]);

    dataSet.gpuClock.push(data[20]);

  }

  return dataSet;
}
