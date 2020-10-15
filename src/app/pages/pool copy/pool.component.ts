import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { StateService } from '../../services/state.service';
import { TokenInfo } from '../../types/TokenInfo';
import { Token } from '../../constants/tokens';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.styl']
})
export class PoolComponent implements OnInit {

  swUSD$: Observable<TokenInfo>;

  constructor(private stateService: StateService) {
    this.swUSD$ = stateService.getToken$(Token.swUSD);
  }

  ngOnInit(): void {
    this.stateService.getInitialized$().subscribe(() => {
      this.stateService.requestTRC20TokenBalance(Token.swUSD);
    });
  }

}
