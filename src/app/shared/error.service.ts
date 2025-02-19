import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private _error = signal<string>('');

  error = this._error.asReadonly();

  showError(message: string) {
    console.error(message);
    this._error.set(message);
  }

  clearError() {
    this._error.set('');
  }
}
