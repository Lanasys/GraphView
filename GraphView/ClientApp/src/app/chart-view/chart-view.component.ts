import { Component, ViewChild } from "@angular/core";
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;

  constructor(private ngxCsvParser: NgxCsvParser) {
    this.chartOptions = {
      series: [
        {
          name: "My-series",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 800,
        width: 1200,
        type: "line",
        animations: {
          enabled: false
        },        
        toolbar: {
          tools: {
              selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        }        
      },
      xaxis: {
        type: 'numeric'
      },
      title: {
        text: "My First Angular Chart"
      }
    };


    
  }

  csvRecords: any;
  header: boolean = false;

  @ViewChild('fileImportInput') fileImportInput: any;

  fileChangeListener($event: any): void {

    const files = $event.srcElement.files;
    this.header = (this.header as unknown as string) === 'true' || this.header === true;
    this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',', encoding: 'utf8' })
      .pipe().subscribe({
        next: (result): void => {
          console.log('Result', result);
          this.csvRecords = result;
          console.log(this.csvRecords.slice(1).flatMap((row: number[]) => row[13]));
          let FPS: number[] = this.csvRecords.slice(1).flatMap((row: number[]) => row[13]);
          FPS = FPS.map((element: number) => Math.round(1000 / element));
          console.log(FPS);
          this.specsFPS(FPS);
          //this.changeChartData(FPS);
        },
        error: (error: NgxCSVParserError): void => {
          console.log('Error', error);
        }
      });
  }

  changeChartType(type: string) {
    console.log(this)
    this.chart.updateOptions(
      {
        chart: {
          type: type
        }
      }
    )
  }

  changeChartData(data: number[]) {
    this.chart.updateSeries(
      [
        {
          data: data
        }
    ])
  }

  specsFPS(FPS: number[]) {

    let avgFPS: number = FPS.reduce((a, b) => a + b, 0) / FPS.length;
    FPS.sort((a: number, b: number) => a - b);
    console.log(FPS);
    let Count: { [key: number]: number } = {};

    for (let i = 0; i < FPS.length;) {
      let j: number;
      for (j = i; j < FPS.length; j++) {
        if (FPS[i] != FPS[j]) {
          if (FPS[i] > 0) Count[FPS[i]] = j - i;
          i = j;
          break;
        }
      }
      if (j == FPS.length) {
        if (FPS[i] > 0) Count[FPS[i]] = j - i;
        break;
      }
    }

    console.log("count");
    console.log(Count);
    let pc50 = 0, pc10 = 0, pc1 = 0, pc01 = 0;
    let pc50b = false, pc10b = false, pc1b = false, pc01b = false;
    let FPScount = 0;
    let modeFPS = 0;
    let countModeFPS = 0;
    let counter = FPS.length;
    for (let fps in Count)
    {
      FPScount += Count[fps];
      if (FPScount / counter >= 0.5 && !pc50b) {
        pc50b = !pc50b;
        pc50 = Number(fps);
      }
      else if (FPScount / counter >= 0.1 && !pc10b) {
        pc10b = !pc10b;
        pc10 = Number(fps);
      }
      else if (FPScount / counter >= 0.01 && !pc1b) {
        pc1b = !pc1b;
        pc1 = Number(fps);
      }
      else if (FPScount / counter >= 0.001 && !pc01b) {
        pc01b = !pc01b;
        pc01 = Number(fps);
      }
    }

    let res: number[] = [];
    res.push(pc50, pc10, pc1, pc01);

    this.chart.updateOptions({
      chart: {
        type: "bar"
      },
      xaxis: {
        type:"categories",
        categories:["50%","10%","1%","0.1%"]
      }
    })
    this.changeChartData(res);
  }
}
