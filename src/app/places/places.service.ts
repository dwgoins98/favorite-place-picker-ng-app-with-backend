import { Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, pipe, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  constructor(
    private httpClient: HttpClient,
    private errorService: ErrorService
  ) {}

  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Could not get available places. Please try again later.'
    );
  }

  /**
   * Loads the user's favorite places from the backend.
   *
   * This method fetches the user's favorite places from the specified endpoint
   * and updates the internal state with the fetched places.
   *
   * @returns An observable that emits the array of user places.
   *
   * @remarks
   * If the fetch operation fails, an error message is provided.
   *
   * @example
   * ```typescript
   * this.placesService.loadUserPlaces().subscribe({
   *   next: (places) => {
   *     console.log('User places loaded:', places);
   *   },
   *   error: (err) => {
   *     console.error('Failed to load user places:', err);
   *   }
   * });
   * ```
   */
  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Could not get your favorite places. Please try again later.'
    ).pipe(
      tap({
        /**
         * Handles the next value emitted by the observable.
         * Sets the places state with the fetched places.
         * Updates the userPlaces signal with the fetched places.
         * @param userPlaces - The array of places fetched from the backend.
         */
        next: (userPlaces) => {
          this.userPlaces.set(userPlaces);
        },
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const oldPlaces = this.userPlaces();

    if (!oldPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...oldPlaces, place]);
    } else {
      return throwError(
        () => new Error('This place is already in your favorite places.')
      );
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(oldPlaces);
          this.errorService.showError(
            'Failed to push this place to the user places.'
          );
          return throwError(
            () => new Error('Failed to push this place to the user places.')
          );
        })
      );
  }

  removeUserPlace(place: Place) {
    const oldPlaces = this.userPlaces();

    if (oldPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(oldPlaces.filter((p) => p.id !== place.id));
    } else {
      return throwError(
        () =>
          new Error('This place is already removed from your favorite places.')
      );
    }

    return this.httpClient
      .delete('http://localhost:3000/user-places/' + place.id)
      .pipe(
        catchError((error) => {
          this.userPlaces.set(oldPlaces);
          this.errorService.showError(
            'Failed to remove this place from the user places.'
          );
          return throwError(
            () =>
              new Error('Failed to remove this place remove the user places.')
          );
        })
      );
  }

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
