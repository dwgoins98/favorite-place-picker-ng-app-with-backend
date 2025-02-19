import { Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  constructor(private httpClient: HttpClient) {}

  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Could not get available places. Please try again later.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Could not get your favorite places. Please try again later.'
    );
  }

  addPlaceToUserPlaces(placeId: string, url: string) {
    return this.httpClient.put(url, {
      placeId,
    });
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      /**
       * Maps the response data to extract the places array.
       * @param responseData - The response data from the HTTP GET request.
       * @returns Place[]
       */
      map((responseData) => responseData.places),

      /**
       * Catches any errors that occur during the HTTP GET request.
       * Logs the error to the console and throws a new error with a custom message.
       * @param error - The error that occurred during the HTTP GET request.
       * @returns Observable<never>
       */
      catchError((error) => {
        console.error(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
