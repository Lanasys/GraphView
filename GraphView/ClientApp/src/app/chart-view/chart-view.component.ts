import { Component, ViewChild, Input, ChangeDetectorRef } from "@angular/core";

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
  @Input() options: any;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
      
  }

  ngOnInit(): void {
    console.log(this.options);
    this.chartOptions = this.options;  
  }

  updateChart(): void {
    this.chartOptions = this.options;
    this.changeDetectorRef.detectChanges(); 
  }
}
