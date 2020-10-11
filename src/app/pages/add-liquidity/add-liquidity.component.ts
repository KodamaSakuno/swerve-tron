import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { StateService } from '../../services/state.service';
import { Token } from '../../constants/tokens';
import { TokenInfo } from '../../types/TokenInfo';

@Component({
  selector: 'app-add-liquidity',
  templateUrl: './add-liquidity.component.html',
  styleUrls: ['./add-liquidity.component.styl']
})
export class AddLiquidityComponent implements OnInit {

  usdt$: Observable<TokenInfo>;
  usdj$: Observable<TokenInfo>;

  constructor(private stateService: StateService) {
    this.usdt$ = stateService.getToken$(Token.USDT);
    this.usdj$ = stateService.getToken$(Token.USDJ);

    this.stateService.getInitialized$().subscribe(() => {
      this.stateService.requestTRC20TokenBalance(Token.USDT);
      this.stateService.requestTRC20TokenBalance(Token.USDJ);
    });
 }

  ngOnInit(): void {
  }

}
