import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  NavigationData,
  NgxNavigationalListService,
} from 'ngx-navigational-list';
import { MOCK_DATA } from './mock-data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <h1>Welcome to {{ title() }}!</h1>

    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('ngx-navigational-list-demo');
  private ngxNavigationalListService = inject(NgxNavigationalListService);

  constructor() {
    console.log('App component initialized');
    this.ngxNavigationalListService.setNavigationData(
      MOCK_DATA as NavigationData
    );
    this.ngxNavigationalListService
      .getFilteredNavigationBySubtypeAndState('HEADER', 'FULL')
      .subscribe((data) => {
        console.log('Filtered navigation by subtype and state loaded');
        console.log(data);
      });
  }
}
