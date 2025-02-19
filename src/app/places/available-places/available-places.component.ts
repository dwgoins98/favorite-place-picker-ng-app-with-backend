import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { catchError, map, throwError } from 'rxjs';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';

/**
 * Component for displaying available places.
 * 
 * @selector 'app-available-places'
 * @templateUrl './available-places.component.html'
 * @styleUrl './available-places.component.css'
 * @imports [PlacesComponent, PlacesContainerComponent]
 */
@Component({
  selector: 'app-available-places',
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  /**
   * Signal to hold the list of places.
   */
  places = signal<Place[] | undefined>(undefined);

  /**
   * Signal to indicate if data is being fetched.
   */
  isFetching = signal<boolean>(false);

  /**
   * Signal to hold any error messages.
   */
  error = signal<string>('');

  /**
   * Constructor to inject HttpClient and DestroyRef services.
   * 
   * @param httpClient - The HttpClient service for making HTTP requests.
   * @param destroyRef - The DestroyRef service for handling component destruction.
   */
  constructor(private httpClient: HttpClient, private destroyRef: DestroyRef) {}

  /**
   * Initializes the component by fetching available places from the backend.
   * Sets the fetching state to true while the data is being retrieved.
   * Subscribes to the HTTP GET request to fetch places and handles the response.
   * Unsubscribes from the observable when the component is destroyed.
   *
   * @returns void
   */
  ngOnInit() {
    /**
     * Sets the fetching state to true.
     */
    this.isFetching.set(true);

    /**
     * HTTP GET request to fetch available places from the backend.
     * @returns Observable<{ places: Place[] }>
     */
    const placesSubsc = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .pipe(
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
          return throwError(
            () =>
              new Error(
                'Something went wrong getting the available places. Please try again later.'
              )
          );
        })
      )
      .subscribe({
        /**
         * Handles the next value emitted by the observable.
         * Sets the places state with the fetched places.
         * @param places - The array of places fetched from the backend.
         */
        next: (places) => {
          this.places.set(places);
        },

        /**
         * Handles the completion of the observable.
         * Sets the fetching state to false.
         */
        complete: () => {
          this.isFetching.set(false);
        },

        /**
         * Handles any errors emitted by the observable.
         * Sets the error state with the error message.
         * @param err - The error emitted by the observable.
         */
        error: (err: Error) => {
          this.error.set(err.message);
        },
      });

    /**
     * Unsubscribes from the placesSubsc observable when the component is destroyed.
     */
    this.destroyRef.onDestroy(() => {
      placesSubsc.unsubscribe();
    });
  }
}
