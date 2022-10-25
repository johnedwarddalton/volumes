import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Curve } from './curve';



export interface DailyTotals {
  values : String[][];
}

export type HistoryEntry = { [label : string] : string[] } ;

interface Histories {
  values : HistoryEntry;
}

type RawData = String[][];

@Injectable({
  providedIn: 'root'
})
export class SdrService {
  private baseUrl = environment.sdrBaseUrl;


  getTotals( curr: String )  {
    let url = this.baseUrl + `/totals/from/14/to/1/noopt/1/currency/${curr}`;
    return this.http.get<DailyTotals>(url)
    .pipe(
      map ( data => data.values )
    );
  }

  getHistory( type: String, curr: String )  {
    let url = this.baseUrl + `/history/hist_type/${type}/currency/${curr}`;
    return this.http.get<Histories>(url)
    .pipe(
      map ( data => data.values )
    );
  }

  getRawData( curr: String )  {
    let url = this.baseUrl + `/raw/currency/${curr}/subtype/FixedFloat%2COIS/today/1`
    return this.http.get<RawData>(url)
  }

  private handleError<T>( result?: T){
      return (error: any): Observable<T> => {

        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // Let the app keep running by returning an empty result.
        return of(result as T);
      }
    }

  constructor( private http: HttpClient ) { }
}
