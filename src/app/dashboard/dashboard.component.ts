import { Component, OnInit } from '@angular/core';
import { ChathamService } from '../chatham.service';
import { Curve } from '../curve';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  terms = [1,2,3,5,7,10,30];
  rates: Curve = {};
  eqvts: Curve = {};

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
    console.log(this.rates);
    console.log(this.eqvts);
  }

  private getChathamRates(){
    this.chathamService.getCurve()
      .subscribe ( curve => {
        this.rates = curve;
        this.getEqvts(this.rates);
      });
  }

  constructor( private chathamService: ChathamService) { }

  ngOnInit(): void {
    this.getChathamRates();

  }

}
