import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Curve } from './curve';

export interface ChathamDataPoint {
  LengthInMonths: number,
  Rate: number,
  PreviousDay: number,
  PreviousMonth: number,
  PreviousYear: number
}

export interface ChathamRateSnapshot {
  Rates: ChathamDataPoint[],
  CurrentDate: string,
  PreviousDayDate: string,
  PreviousMonthDate: string,
  PreviousYearDate: string,
  Updated: string
}

@Injectable({
  providedIn: 'root'
})
export class ChathamService {

  private chathamUrl = environment.chathamUrl;

  private transform (snapshot: ChathamRateSnapshot) : Curve {
    var rates: Curve = {};
    snapshot.Rates.forEach(element => {
      rates[element.LengthInMonths / 12 ] = element.Rate;
    });
    return rates;
  }

  getRates() {
    return this.http.get<ChathamRateSnapshot>(this.chathamUrl)
    .pipe(
      catchError(this.handleError<ChathamRateSnapshot>())
    );
  }

  getCurve(){
    return this.http.get<ChathamRateSnapshot>(this.chathamUrl)
    .pipe(
      map( snapshot => this.transform(snapshot))
    );
  }

  private handleError<T>( result?: T){
      return (error: any): Observable<T> => {

        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // Let the app keep running by returning an empty result.
        return of(result as T);
      }
    }

  constructor( private http: HttpClient) { }
}
