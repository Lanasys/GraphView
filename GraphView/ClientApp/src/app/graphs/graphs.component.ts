import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {ChartViewComponent} from '../chart-view/chart-view.component'
import {Project, DataSet} from './models';
import {ProcessData} from './processData';
import {NgxCsvParser, NgxCSVParserError} from 'ngx-csv-parser';

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
  project: Project = new Project();
  errorMessage: string;
  dataSource: string;
  chartType: string;
  additionalOptions: number[] = [];
  currentDataset: number = -1;
  selectedDatasets: number[] = [];
  datasetDetails: { displayName: string, resolution: string } = {
    displayName: '',
    resolution: ''
  };
  dataSources: { [key: string]: string } = {
    'API': 'Time between calls',
    'Display': 'Time between showing frames on the display'
  }
  chartTypes: { [key: string]: { name: string, subtypes: string[] } } = {
    'frameTime': {
      name: 'Frametime',
      subtypes: []
    },
    'FPS': {
      name: 'FPS',
      subtypes: []
    },
    'probabilityDensity': {
      name: 'Probability density',
      subtypes: []
    },
    'statisticsComparison': {
      name: 'Statistics comparation',
      subtypes: ['CPU tempearture', 'CPU power', 'GPU temprature', 'GPU power']
    },
    'battery': {
      name: 'Battery info',
      subtypes: [],
    },
    'powerAndTemperature': {
      name: 'Power & Temperature',
      subtypes: []
    },
    'loadCpuAndGpu': {
      name: 'Load of CPU & GPU',
      subtypes: []
    },
    'clock': {
      name: 'CPU & GPU Clocks',
      subtypes: []
    }
  };
  chartTypesArray = Object.keys(this.chartTypes);

  constructor(private ngxCsvParser: NgxCsvParser, private changeDetectorRef: ChangeDetectorRef) {

  }

  csvRecords: any;
  header: boolean = false;

  fileChangeListener($event: any): void {

    const files = $event.srcElement.files;
    this.header = (this.header as unknown as string) === 'true' || this.header === true;
    this.ngxCsvParser.parse(files[0], {header: this.header, delimiter: ',', encoding: 'utf8'})
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

  selectDataset(index: number) {
    this.currentDataset = index;
    this.datasetDetails.displayName = this.project.datasets[index].displayName;
    this.datasetDetails.resolution = this.project.datasets[index].resolution;
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

  saveDataSetDetails() {
    if (this.datasetDetails.displayName.trim().length > 0) {
      this.project.datasets[this.currentDataset].displayName = this.datasetDetails.displayName;
    } else {
      this.datasetDetails.displayName = this.project.datasets[this.currentDataset].displayName;
    }
    if (this.datasetDetails.resolution.trim().length > 0) {
      this.project.datasets[this.currentDataset].resolution = this.datasetDetails.resolution;
    } else {
      this.datasetDetails.resolution = this.project.datasets[this.currentDataset].resolution;
    }
  }

  updateAdditionalOptions(event: any, option: string) {
    const checked = event.target.checked;
    const optionIndex = this.chartTypes[this.chartType].subtypes.length !== 0 ? this.chartTypes[this.chartType].subtypes.indexOf(option) : -1;
    if (checked && this.chartTypes[this.chartType].subtypes != null) {
      this.additionalOptions.push(optionIndex);
    } else {
      const index = this.additionalOptions.indexOf(optionIndex);
      if (index !== -1) {
        this.additionalOptions.splice(index, 1);
      }
    }
    this.additionalOptions.sort((a, b) => a - b);
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
    const data: DataSet[] = this.project.datasets.filter((_, index) => this.selectedDatasets.includes(index));

    if (data.length === 0) {
      return;
    }

    let theLongestSetIndex: number = 0;

    if (this.chartType === 'statisticsComparison') {

      let dataSet: { name: string, data: number[] }[] = [];
      for (let set of data) {
        dataSet.push({name: set.displayName, data: set.statisticsComparison(isApi, this.additionalOptions)})
      }

      let categories = ['Average', 'Mode', '50% (Median)', '10%', '1%', '0.1%'];
      if (this.additionalOptions.length > 0) {
        for (let i of this.additionalOptions) {
          if (this.chartTypes['statisticsComparison'].subtypes) {
            categories.push(this.chartTypes['statisticsComparison'].subtypes[i]);
          }
        }
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
          categories: categories,
          title: {
            text: this.project.name
          }
        },
        yaxis: {
          title: {
            text: 'FPS'
          }
        },
        title: {
          text: this.project.name
        }
      }
    } else if (this.chartType === 'probabilityDensity') {
      let dataSet: { name: string, data: number[] }[] = [];
      let setToGraph: number[];
      for (let set of data) {
        setToGraph = Object.values(set.probabilityDensity(isApi));
        dataSet.push({name: set.displayName, data: setToGraph})
        if (setToGraph.length >= dataSet[theLongestSetIndex].data.length) {
          theLongestSetIndex = data.indexOf(set);
        }
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
          decimalsInFloat: 4,
          title: {
            text: 'Probability, %'
          }
        },
        xaxis: {
          type: 'numeric',
          tickAmount: 4,
          title: {
            text: 'FPS'
          },
          categories: Object.keys(data[theLongestSetIndex].probabilityDensity(isApi, 2)).map(Number)
        },
        title: {
          text: this.project.name
        }
      }
    } else if (this.chartType === 'FPS') {
      let dataSet: { name: string, data: number[][] }[] = [];

      for (let set of data) {
        dataSet.push({name: set.displayName, data: set.FPS(isApi)});
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
            text: 'Time, s'
          }
        },
        title: {
          text: this.project.name
        },
      };
    } else if (this.chartType === 'frameTime') {
      let dataSet: { name: string, data: number[][] }[] = [];

      for (let set of data) {
        dataSet.push({name: set.displayName, data: set.frameTime(isApi)});
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
            text: 'Time, s'
          }
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
