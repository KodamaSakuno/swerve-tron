import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, map, mergeMap, tap } from 'rxjs/operators';
import { Token } from 'src/app/constants/tokens';

import { StateService } from '../../../services/state.service';
import { PositionInfo } from '../../../types/PositionInfo';
import { TokenInfo } from '../../../types/TokenInfo';

@Component({
  selector: 'app-add-liquidity-content',
  templateUrl: './add-liquidity-content.component.html',
  styleUrls: ['./add-liquidity-content.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLiquidityContentComponent implements OnInit {

  @Input()
  usdt!: TokenInfo;
  @Input()
  usdj!: TokenInfo;

  @Input()
  position: PositionInfo | null = null;

  inputUSDT$ = new BehaviorSubject<BigNumber>(new BigNumber(0));
  inputUSDJ$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  shouldApproveUSDT$: Observable<boolean>;
  shouldApproveUSDJ$: Observable<boolean>;

  isApprovingUSDT = false;
  isApprovingUSDJ = false;

  canSupply$: Observable<boolean>;
  isSupplying = false;

  constructor(private stateService: StateService) {
    const usdtAllowance$ = this.inputUSDT$.pipe(
      debounceTime(300),
      mergeMap(() => stateService.getTRC20TokenAllowance$(Token.USDT)),
    );
    const usdtBalance$ = stateService.getToken$(Token.USDT).pipe(
      map(token => token.balance),
    );
    const usdjBalance$ = stateService.getToken$(Token.USDJ).pipe(
      map(token => token.balance),
    );
    const usdjAllowance$ = this.inputUSDJ$.pipe(
      debounceTime(300),
      mergeMap(() => stateService.getTRC20TokenAllowance$(Token.USDJ)),
    );

    const shouldApproveMapper = map<[BigNumber, BigNumber], boolean>(([amount, allowance]) => {
      if (amount.eq(0))
        return false;

      return amount.gt(allowance);
    })
    this.shouldApproveUSDT$ = combineLatest([this.inputUSDT$, usdtAllowance$]).pipe(shouldApproveMapper);
    this.shouldApproveUSDJ$ = combineLatest([this.inputUSDJ$, usdjAllowance$]).pipe(shouldApproveMapper);

    const canSupplyMapper = map<[BigNumber, BigNumber, BigNumber], boolean>(([inputAmount, allowance, balance]) => {
      return inputAmount.gt(0) && inputAmount.lte(allowance) && inputAmount.lte(balance);
    });
    const canSupplyUSDT$ = combineLatest([this.inputUSDT$, usdtAllowance$, usdtBalance$]).pipe(canSupplyMapper);
    const canSupplyUSDJ$ = combineLatest([this.inputUSDJ$, usdjAllowance$, usdjBalance$]).pipe(canSupplyMapper);

    this.canSupply$ = combineLatest([canSupplyUSDT$, canSupplyUSDJ$]).pipe(
      map(([canSupplyUSDT, canSupplyUSDJ]) => canSupplyUSDT && canSupplyUSDJ),
    );
  }

  ngOnInit(): void {
  }

  async approveUSDT() {
    this.isApprovingUSDT = true;
    try {
      await this.stateService.approve(Token.USDT, this.inputUSDT$.value);
    } finally {
      this.isApprovingUSDT = false;
    }
  }
  async approveUSDJ() {
    this.isApprovingUSDJ = true;
    try {
      await this.stateService.approve(Token.USDJ, this.inputUSDJ$.value);
    } finally {
      this.isApprovingUSDJ = false;
    }
  }

  async supply() {
    this.isSupplying = true;
    try {
      await this.stateService.addLiquidity(this.inputUSDT$.value, this.inputUSDJ$.value);
    } finally {
      this.isSupplying = false;
    }
  }

}
