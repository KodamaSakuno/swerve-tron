import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  isAvailable$: Observable<boolean>;

  constructor(stateService: StateService) {
    this.isAvailable$ = stateService.state$.pipe(
      map(state => !!state.tronWeb && !!state.node && !!state.account),
      distinctUntilChanged(),
    )
  }
}
