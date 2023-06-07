import { Component } from '@angular/core';
import { Project, DataSet } from './models';
import { ProcessData } from './csv';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import csvHeaders from '../../assets/json/csvHeaders.json';


@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
})

export class GraphsComponent {


  constructor(private ngxCsvParser: NgxCsvParser) {

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
