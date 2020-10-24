import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { StateService } from './services/state.service';
import { TronInfo } from './types/TronInfo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  tron$: Observable<TronInfo>;

  constructor(stateService: StateService) {
    this.tron$ = stateService.tron$;
  }
}
