import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { StateService } from '../../services/state.service';
import { TronInfo } from '../../types/TronInfo';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.styl']
})
export class HeaderComponent implements OnInit {

  tron$: Observable<TronInfo>;

  constructor(stateService: StateService) {
    this.tron$ = stateService.tron$;
  }

  ngOnInit(): void {
  }

}
