import { Input, Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements OnInit {

  @Input() seriesData : number[] = [];
  @Input() avg: number = 0;
  @Input() title: string = '';

  chartOptions: EChartsOption = {};
  mergeOptions: EChartsOption = {};

  lowColor = "#888";  //grey
  highColor = "#428bca";  // Bootstrap button blue

  setChartOptions(){
    /* var xData = [ { value: 5, itemStyle: { color: 'red'}},
                  { value: 7, itemStyle: { color: 'green'}},
                  { value: 2, itemStyle: { color: 'blue'}}
                ]; */
    this.chartOptions = {
      tooltip: {
        formatter: '{c0}',
      },
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
        data: [10,9,8,7,6,5,4,3,2,1,0],
        show: false
      },
      yAxis: {
        show: false
       },
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  }

  constructor() { }

  updateChartOptions(){
    if (this.seriesData == null) return;
    var xData = this.seriesData.map( el => ({ value: Math.round( 10 * el ) /10 , itemStyle: { color: (el >this.avg) ? this.highColor : this.lowColor }}));
    this.mergeOptions = {
      series: [
        {
          name: 'bar1',
          type: 'bar',
          data: xData,
          animationDelay: (idx) => idx * 10,
        }
      ],
    }
  }

  ngOnChanges() {
    this.updateChartOptions();
  }

  ngOnInit(): void {
    this.setChartOptions();
  }

}
