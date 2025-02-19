import { Component } from '@angular/core';

import { AvailablePlacesComponent } from './places/available-places/available-places.component';
import { UserPlacesComponent } from './places/user-places/user-places.component';
import { ErrorService } from './shared/error.service';
import { ErrorModalComponent } from "./shared/modal/modal/error-modal/error-modal.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [AvailablePlacesComponent, UserPlacesComponent, ErrorModalComponent]
})
export class AppComponent {
    constructor(private errorService: ErrorService) {}

    error = this.errorService.error;

}
