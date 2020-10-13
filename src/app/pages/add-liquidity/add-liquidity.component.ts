import { Component, OnInit } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { StateService } from '../../services/state.service';
import { Token } from '../../constants/tokens';
import { TokenInfo } from '../../types/TokenInfo';

@Component({
  selector: 'app-add-liquidity',
  templateUrl: './add-liquidity.component.html',
  styleUrls: ['./add-liquidity.component.styl']
})
export class AddLiquidityComponent implements OnInit {

  Token = Token;

  usdt$: Observable<TokenInfo>;
  usdj$: Observable<TokenInfo>;

  inputUSDT = new BigNumber(0);
  inputUSDJ = new BigNumber(0);

  inputUSDT$ = new Subject<BigNumber>();
  inputUSDJ$ = new Subject<BigNumber>();

  shouldApproveUSDT = false;
  shouldApproveUSDJ = false;

  isApprovingUSDT = false;
  isApprovingUSDJ = false;

  canSupply$: Observable<boolean>;

  constructor(private stateService: StateService) {
    this.usdt$ = stateService.getToken$(Token.USDT);
    this.usdj$ = stateService.getToken$(Token.USDJ);

    this.canSupply$ = combineLatest([this.usdt$, this.usdj$, this.inputUSDT$, this.inputUSDJ$]).pipe(
      map(([usdt, usdj, inputUSDT, inputUSDJ]) => {
        if (inputUSDT.eq(0) && inputUSDJ.eq(0))
          return false;

        if (usdt.balance.lt(inputUSDT) || usdj.balance.lt(inputUSDJ))
          return false;

        return usdt.allowance.gte(inputUSDT) && usdj.allowance.gte(inputUSDJ);
      }),
    );
 }

  ngOnInit(): void {
  }

  async approveUSDT() {
    this.isApprovingUSDT = true;
    try {
      await this.stateService.approve(Token.USDT, this.inputUSDT);
    } finally {
      this.isApprovingUSDT = false;
    }
  }
  async approveUSDJ() {
    this.isApprovingUSDJ = true;
    try {
      await this.stateService.approve(Token.USDJ, this.inputUSDJ);
    } finally {
      this.isApprovingUSDJ = false;
    }
  }

  async supply() {
    await this.stateService.addLiquidity(this.inputUSDT, this.inputUSDJ);
  }

}
