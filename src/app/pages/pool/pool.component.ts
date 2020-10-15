import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { StateService } from '../../services/state.service';
import { Token } from '../../constants/tokens';
import { PositionInfo } from '../../types/PositionInfo';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.styl']
})
export class PoolComponent implements OnInit {

  position$: Observable<PositionInfo | null>;

  constructor(private stateService: StateService) {
    this.position$ = stateService.getPositionInfo$();
  }

  ngOnInit(): void {
    this.stateService.getInitialized$().subscribe(() => {
      this.stateService.requestTRC20TokenBalance(Token.swUSD);
      this.stateService.requestPoolInfo();
    });
  }

}
