import { Component, input, output } from '@angular/core';

import { Place } from './place.model';

/**
 * Component responsible for displaying and selecting places.
 */
@Component({
    selector: 'app-places',
    imports: [],
    templateUrl: './places.component.html',
    styleUrl: './places.component.css'
})
export class PlacesComponent {
  places = input.required<Place[]>();
  selectPlace = output<Place>();

  onSelectPlace(place: Place) {
    this.selectPlace.emit(place);
  }
}
