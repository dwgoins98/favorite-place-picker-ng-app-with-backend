import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { PlacesService } from '../places.service';

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
  constructor(
    private destroyRef: DestroyRef,
    private placesService: PlacesService
  ) {}

 /**
  * Initializes the component by setting the fetching state to true and subscribing to the observable
  * that fetches available places from the backend. The fetched places are set to the places state,
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
     * Uses the loadAvailablePlaces method from the places service to fetch the places.
     * @returns Observable<Place[]>
     */
    const placesSubsc = this.placesService.loadAvailablePlaces().subscribe({
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

  /**
   * Handles the selection of a place by the user.
   * 
   * This method adds the selected place to the user's places by making a request
   * to the backend service. It subscribes to the response and logs the response data.
   * Additionally, it ensures that the subscription is properly cleaned up when the
   * component is destroyed.
   * 
   * @param selectedPlace - The place selected by the user.
   */
  onSelectPlace(selectedPlace: Place) {
    const selectedPlaceSubsc = this.placesService
      .addPlaceToUserPlaces(
        selectedPlace.id,
        'http://localhost:3000/user-places'
      )
      .subscribe({
        next: (responseData) => console.log(responseData),
      });

    /**
     * Unsubscribes from the selectedPlaceSubsc observable when the component is destroyed.
     */
    this.destroyRef.onDestroy(() => {
      selectedPlaceSubsc.unsubscribe();
    });
  }
}
