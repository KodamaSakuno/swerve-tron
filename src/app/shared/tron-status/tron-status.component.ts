import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BigNumber } from 'bignumber.js';

import { TronInfo } from '../../types/TronInfo';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-tron-status',
  templateUrl: './tron-status.component.html',
  styleUrls: ['./tron-status.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TronStatusComponent implements OnInit {

  @Input()
  tron!: TronInfo;

  balance$: Observable<BigNumber>;

  constructor(stateService: StateService) {
    this.balance$ = stateService.state$.pipe(
      map(state => state.balance),
    );
  }

  ngOnInit(): void {
  }

}
