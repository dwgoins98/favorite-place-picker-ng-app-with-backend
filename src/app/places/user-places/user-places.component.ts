import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
/**
 * A list of places loaded for the user.
 * This property is populated by the `placesService` with the user's favorite places.
 */
  places = this.placesService.loadedUserPlaces;

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
   * @param destroyRef - The DestroyRef service for handling component destruction.
   * @param placesService - The PlacesService for fetching user places from the backend.
   */
  constructor(
    private destroyRef: DestroyRef,
    private placesService: PlacesService
  ) {}

  onRemovePlace(selectedPlace: Place) {
    const removedPlaceSubsc = this.placesService
      .removeUserPlace(
        selectedPlace,
      )
      .subscribe({
        next: (responseData) => console.log(responseData),
      });

    /**
     * Unsubscribes from the removedPlaceSubsc observable when the component is destroyed.
     */
    this.destroyRef.onDestroy(() => {
      removedPlaceSubsc.unsubscribe();
    });
  } 


  /**
   * Initializes the component by setting the fetching state to true and subscribing to the observable
   * that fetches user places from the backend. The fetched places are set to the places state,
   * and the fetching state is set to false upon completion. If an error occurs, the error state is set
   * with the error message. The subscription is cleaned up when the component is destroyed.
   *
   * @returns void
   *
   */
  ngOnInit() {
    /**
     * Sets the fetching state to true.
     */
    this.isFetching.set(true);

    /**
     * HTTP GET request to fetch available places from the backend.
     * @returns Observable<Place[]>
     */
    const placesSubsc = this.placesService.loadUserPlaces().subscribe({
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
