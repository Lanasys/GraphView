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
  ApexStroke,
  ApexTitleSubtitle,
  ApexYAxis
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  storke: ApexStroke;
};

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})

export class GraphsComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;

  errorMessage: string;
  dataSource: string;
  chartType: string;

  dataSources: { [key: string]: string } = {
    'API': 'Time between calls',
    'Display': 'Time between showing frames on the display'
  }

  chartTypes: { [key: string]: { name: string, subtypes: string[] | null } } = {
    'frameTime': {
      name: 'Frametime',
      subtypes: null
    },
    'FPS': {
      name: 'FPS',
      subtypes: null
    },
    'probabilityDensity': {
      name: 'Probability density',
      subtypes: null
    },
    'statisticsComparison': {
      name: 'Statistics comparation',
      subtypes: ['1', '2']
    },
    'battery': {
      name: 'Battery info',
      subtypes: ['1', '2', '3'],
    },
    'powerAndTemperature': {
      name: 'Power & Temperature',
      subtypes: null
    },
    'loadCpuAndGpu': {
      name: 'Load of CPU & GPU',
      subtypes: null
    },
    'clock': {
      name: 'CPU & GPU Clocks',
      subtypes: null
    }
  };

chartTypesArray = Object.keys(this.chartTypes);


  constructor(private ngxCsvParser: NgxCsvParser) {
    this.chartOptions = {
      series: [
        {
          name: "My-series",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 'auto',
        width: '100%',
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

  csvRecords: any;
  header: boolean = false;


  fileChangeListener($event: any): void {

    const files = $event.srcElement.files;
    this.header = (this.header as unknown as string) === 'true' || this.header === true;
    this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',', encoding: 'utf8' })
      .pipe().subscribe({
        next: (result): void => {
          let dataset: DataSet | null = ProcessData(result, files[0].name);
          if (dataset != null) {
            this.project.datasets.push(dataset);
            console.log(this.project);
          }

        },
        error: (error: NgxCSVParserError): void => {
          console.log('Error', error);
        }
      });
  }

  buildChart() {
    if (this.project.datasets.length === 0) {
      this.errorMessage = 'No file to read!';
      return;
    }
    if (!this.chartType || !this.dataSource) {
      this.errorMessage = 'Check if everything is selected!';
      return;
    }

    if (this.chartType === 'statisticsComparison') {
      this.chart.updateOptions({
        chart: {
          type: "bar"
        },
        xaxis: {
          type: "categories",
          categories: ["50%", "10%", "1%", "0.1%"]
        }
      });
      let dataSet: {data: number[]}[] = [];
      for (let set of this.project.datasets) {
        dataSet.push({data: set.statisticsComparison(this.dataSource === 'API')})
      }

      this.chart.updateSeries(dataSet);
    }
    else if (this.chartType === 'probabilityDensity') {
      console.log(this.project.datasets[0].probabilityDensity(this.dataSource === 'API',2));
      this.chart.updateSeries([{
        data: Object.values(this.project.datasets[0].probabilityDensity(this.dataSource === 'API',2))
      }]);
      this.chart.updateOptions ({
        chart:{
          type: 'line'
        },
        stroke:{
          curve: 'smooth'
        },
        yaxis: {
          show: true,
          forceNiceScale: true,
          decimalsInFloat: true
        }
      })
      this.chart.updateOptions({
        xaxis: {
          type: 'category',
          tickAmount: 4,
          categories: Object.keys(this.project.datasets[0].probabilityDensity(this.dataSource === 'API',2))
        }
      })
    }
  }
}
