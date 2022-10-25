import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChathamService } from '../chatham.service';
import { SdrService, DailyTotals, HistoryEntry } from '../sdr.service';
import { Curve } from '../curve';


interface Stat {
  current: number,
  all:number,
  rfr: number,
  eqvt: number,
  avg: number,
  max : number,
  dayavg:number,
  daymax: number
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _setIntervalHandler: any;
  terms = [1,2,3,5,7,10,30];
  bands = ["0.5-1.5y","1.5-2.5y","2.5-3.5y","3.5-5.5y","5.5-7.5y","7.5-15y","15y+"];
  rates: Curve = {};
  eqvts: Curve = {1: 0.116, 2: 0.227, 3: 0.335, 5: 0.541, 7: 0.734, 10:1.0, 30: 2.30};
  daily_totals: String[][] = [[]];
  volume_history: { [label: string] : number[] } = {};
  currency: String = 'USD';
  rfrOnly: boolean = false;

  stats:  Stat[] = [
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0},
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0},
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0},
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0},
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0},
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0},
    { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0}
  ];

  totals : Stat =  { current : 0, all: 0, rfr: 0, eqvt: 0, avg : 0, max : 0, dayavg: 0, daymax: 0}

  daily_hist: HistoryEntry = {};
  att_hist: HistoryEntry = {};


  private getEqvts ( rates: Curve) {
    var dvs: Curve = {};
    this.terms.forEach ( term => {
        let df = 1.0 / ( 1 + (rates[term] - 0.01) / 100.0 );
        let dfn = Math.pow( df, term);
        dvs[term] = rates[term] * df * (1-dfn) / (1 - df) + 100 * dfn - 100;
      }
    )
    this.terms.forEach ( term => {
      this.eqvts[term] = dvs[term] / dvs[10];
    })
  }

  private getChathamRates(){
    this.chathamService.getCurve()
      .subscribe ( curve => {
        this.rates = curve;
        this.getEqvts(this.rates);
      });
  }

  private getDailyTotals() {
    this.sdrService.getTotals( this.currency)
      .subscribe ( data => {
        this.daily_totals = data;
        this.updateSparkCharts();
      });

  }

  private getATTHistory() {
    this.sdrService.getHistory( "ATT", this.currency)
      .subscribe ( data => {
          this.att_hist = data;
          this.updateATTStats();
        }
    );
  }

  private getDailyHistory() {
    this.sdrService.getHistory( "DAILY", this.currency)
      .subscribe ( data => {
          this.daily_hist = data;
          this.updateDailyStats();

        }
    );
  }

  refreshDisplay(){
    this.getATTHistory();
    this.updateDailyStats();
    this.updateSparkCharts();
  }

  refresh(){
    this.getATTHistory();
    this.getDailyHistory();
    this.getDailyTotals();
  }

  updateSparkCharts(){
    let sparkData = this.daily_totals.filter( el => (el[1] =='ALL' && el[2] == ( this.rfrOnly ? '1' : '0')))
      .map(el => Number(el[3]) / 1000 );
    sparkData.push(this.totals.current);
    this.volume_history["total"] = sparkData;
  for (var i=0;i<this.terms.length;i++){
      let label = this.terms[i] + 'Y';
      let series = this.daily_totals.filter ( el => (el[1] == label && el[2] == ( this.rfrOnly ? '1' : '0')))
        .map(el => Number(el[3]) / 1000 );
      series.push(this.stats[i].current);
      this.volume_history[label] = series;
    };
  }

  updateATTStats(){
    let rfr = this.rfrOnly ? "_rfr" : "";
    for (var i=0;i<this.terms.length;i++){
      var term_label = `${this.terms[i]}y`;
      var att0 = `${term_label}_att`;
      var att1 = `${term_label}_att_rfr`;
      var att = `${att0}${rfr}`;
      this.stats[i].current = Number(this.att_hist[att][0]);
      this.stats[i].eqvt =this.stats[i].current * this.eqvts[this.terms[i]]  ;
      this.stats[i].avg = Number(this.att_hist[att][1]);
      this.stats[i].max = Number(this.att_hist[att][2]);
      this.stats[i].all = Number(this.att_hist[att0][0]);
      this.stats[i].rfr = Number(this.att_hist[att1][0])
    };
    this.updateTotals();
  }

  updateDailyStats(){
    let rfr = this.rfrOnly ? "_rfr" : "";
    for (var i=0;i<this.terms.length;i++){
      var term_label = `${this.terms[i]}y`;
      var daily = `${term_label}_daily${rfr}`;
      this.stats[i].dayavg = Number(this.daily_hist[daily][1]);
      this.stats[i].daymax = Number(this.daily_hist[daily][2]);
    };
    this.updateTotals();
  }

  updateTotals(){
      this.totals.current = this.stats.reduce( (sum,el) => sum += el.current, 0);
      this.totals.eqvt = this.stats.reduce( (sum,el) => sum += el.eqvt, 0);
      this.totals.all = this.stats.reduce( (sum,el) => sum += el.all, 0);
      this.totals.rfr = this.stats.reduce( (sum,el) => sum += el.rfr, 0);
      this.totals.avg = this.stats.reduce( (sum,el) => sum += el.avg, 0);
      this.totals.max = this.stats.reduce( (sum,el) => sum += el.max, 0);
      this.totals.dayavg = this.stats.reduce( (sum,el) => sum += el.dayavg, 0);
      this.totals.daymax = this.stats.reduce( (sum,el) => sum += el.daymax, 0);
  }

  pg1Width (x:number): string {
    let val = 100 * x / ( 1 + x);
    return val + '%';
  }

  pg2Width (x:number): string {
    let val = 100 * x / ( 1 + x);
    return (100 - val) + '%';
  }

  constructor( private chathamService: ChathamService, private sdrService: SdrService) { }

  ngOnInit(): void {
    this.getChathamRates();
    this.getDailyTotals();
    this.getDailyHistory();
    this.getATTHistory();
    this._setIntervalHandler = setInterval(() => {
          this.refresh()
     }, 60000);
  }

  ngOnDestroy() {
      clearInterval(this._setIntervalHandler);
   }

}
