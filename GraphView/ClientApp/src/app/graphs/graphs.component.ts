import { Component, ViewChild } from '@angular/core';
import { Project, DataSet } from './models';
import { ProcessData } from './processData';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import csvHeaders from '../../assets/json/csvHeaders.json';

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
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
})

export class GraphsComponent {
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

  project: Project = new Project();
  dataset: DataSet;

  csvRecords: any;
  header: boolean = false;
  errorMessage: string = '';

  fileChangeListener($event: any): void {

    const files = $event.srcElement.files;
    this.header = (this.header as unknown as string) === 'true' || this.header === true;
    this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',', encoding: 'utf8' })
      .pipe().subscribe({
        next: (result): void => {
          this.dataset = ProcessData(result, files[0].name);
          this.project.datasets.push(this.dataset);
          console.log(this.project.datasets[0]);
        },
        error: (error: NgxCSVParserError): void => {
          console.log('Error', error);
        }
      });
  }
}
