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

  /**
   * Loads the available places from the backend server.
   *
   * @returns An observable containing the list of available places.
   * @throws Will throw an error if the places could not be fetched.
   */
  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Could not get available places. Please try again later.'
    );
  }

  /**
   * Loads the user's favorite places from the backend.
   * 
   * This method fetches the user's favorite places from the specified URL and updates
   * the application state with the fetched places. If the fetch operation fails, an
   * error message is provided.
   * 
   * @returns An observable that emits the user's favorite places.
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

  /**
   * Adds a place to the user's favorite places if it is not already present.
   * 
   * @param {Place} place - The place to be added to the user's favorite places.
   * @returns {Observable<any>} - An observable that completes when the place is successfully added or errors out if the operation fails.
   * 
   * @throws {Error} - Throws an error if the place is already in the user's favorite places.
   * 
   * @remarks
   * This method first checks if the place is already in the user's favorite places. If it is not, it adds the place to the user's favorite places and makes an HTTP PUT request to update the backend. If the HTTP request fails, it reverts the user's favorite places to the previous state and shows an error message.
   */
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

  /**
   * Removes a place from the user's favorite places.
   *
   * This method first checks if the place exists in the user's favorite places.
   * If it does, it removes the place from the local state and then sends a DELETE request
   * to the backend to remove the place from the server.
   * If the place does not exist in the user's favorite places, it throws an error.
   * If the backend request fails, it restores the local state and shows an error message.
   *
   * @param {Place} place - The place to be removed from the user's favorite places.
   * @returns {Observable<void>} - An observable that completes when the place is successfully removed.
   * @throws {Error} - Throws an error if the place is already removed from the user's favorite places.
   */
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

  /**
   * Fetches places from the given URL.
   * 
   * @param url - The URL to fetch places from.
   * @param errorMessage - The custom error message to throw in case of an error.
   * @returns An Observable that emits an array of Place objects.
   */
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
