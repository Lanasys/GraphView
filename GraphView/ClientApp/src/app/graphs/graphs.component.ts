import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChartViewComponent } from '../chart-view/chart-view.component'
import { Project, DataSet } from './models';
import { ProcessData } from './processData';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexStroke,
  ApexYAxis
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
};

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})

export class GraphsComponent {
  @ViewChild(ChartViewComponent) chartComponent!: ChartViewComponent;
  dataOptions: Partial<ChartOptions>;

  errorMessage: string;
  dataSource: string;
  chartType: string;
  currentDataset: number = -1;
  selectedDatasets: number[] = [];


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

  constructor(private ngxCsvParser: NgxCsvParser, private changeDetectorRef: ChangeDetectorRef) {
    
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

  toggleSelected(event: any, set: DataSet) {
    const checked = event.target.checked;
    if (checked) {
      this.selectedDatasets.push(this.project.datasets.indexOf(set));
    } else {
      const index = this.selectedDatasets.indexOf(this.project.datasets.indexOf(set));
      if (index !== -1) {
        this.selectedDatasets.splice(index, 1);
      }
    }

    console.log(this.selectedDatasets);
  }

  selectAll() {
    this.selectedDatasets = Array.from(this.project.datasets.keys());
  }

  deselectAll() {
    this.selectedDatasets = [];
  }

  invertSelect() {
    this.selectedDatasets = Array.from(this.project.datasets.keys()).filter(index => !this.selectedDatasets.includes(index));
  }

  delete() {
    if (!this.selectedDatasets.length) return;
    this.project.datasets = this.project.datasets.filter((_, index) => !this.selectedDatasets.includes(index));
    this.selectedDatasets = [];
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

    let isApi = this.dataSource === 'API';

    if (this.chartType === 'statisticsComparison') {
      
      let dataSet: {name: string, data: number[] }[] = [];
      for (let set of this.project.datasets) {
        dataSet.push({ name: set.displayName, data: isApi ? set.statisticsAPI : set.statisticsDisplay })
      }

      this.dataOptions = {
        series: dataSet,
        chart: {
          width: '100%',
          type: "bar",
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
          type: 'category',
          categories: ['50%', '10%', '1%', '0.1%'],
          title: {
            text: this.project.name
          }
        },
        title: {
          text: this.project.name
        }
      }
    }
    else if (this.chartType === 'probabilityDensity') {
      let dataSet: { data: number[] }[] = [];

      for (let set of this.project.datasets) {
        dataSet.push({ data: Object.values(set.probabilityDensity(isApi)) })
      }

      this.dataOptions = {
        series: dataSet,
        chart: {
          type: 'line',
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
        stroke: {
          curve: 'smooth'
        },
        yaxis: {
          show: true,
          forceNiceScale: true,
          decimalsInFloat: 0
        },
        xaxis: {
          type: 'numeric',
          tickAmount: 4,
          categories: Object.keys(this.project.datasets[0].probabilityDensity(isApi, 2)).map(Number)
        },
        title: {
          text: this.project.name
        }
      }
    }
    else if (this.chartType === 'FPS') {
      let dataSet: {name: string, data: number[] }[] = [];

      for (let set of this.project.datasets) {
        dataSet.push({name: set.displayName, data: Object.values(set.FPS(isApi)) })
      }

      this.dataOptions = {
        series: dataSet,
        chart: {
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
        stroke: {
          curve: 'smooth'
        },
        yaxis: {
          show: true,
          forceNiceScale: true,
          decimalsInFloat: 2,
          title: {
            text: 'FPS'
          },
        },
        xaxis: {
          type: 'numeric',
          tickAmount: 4,
          decimalsInFloat: 2,
          title: {
            text: 'Time, ms'
          },
        },
        title: {
          text: this.project.name
        },
      };
    }
    else if (this.chartType === 'frameTime') {
      let dataSet: {name: string, data: number[] }[] = [];

      for (let set of this.project.datasets) {
        dataSet.push({name: set.displayName, data: Object.values(set.frameTime(isApi)) })
      }

      this.dataOptions = {
        series: dataSet,
        chart: {
          type: 'line',
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
        stroke: {
          curve: 'smooth'
        },
        yaxis: {
          show: true,
          forceNiceScale: true,
          decimalsInFloat: 2,
          title: {
            text: 'FrameTime, ms'
          },
        },
        xaxis: {
          type: 'numeric',
          tickAmount: 4,
          decimalsInFloat: 2,
          title: {
            text: 'Time, ms'
          },
          categories: Object.keys(this.project.datasets[0].frameTime(isApi)).map(Number).sort((a, b) => a - b)
        },
        title: {
          text: this.project.name
        }
      }
    }
    setTimeout(() => {
      this.chartComponent.updateChart();
    }, 0);
  }
}
