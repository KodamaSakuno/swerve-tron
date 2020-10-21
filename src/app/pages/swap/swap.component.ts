import { Component, OnInit } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { scan, map, mergeMap, tap } from 'rxjs/operators';

import { TokenInfo } from '../../types/TokenInfo';
import { StateService } from '../../services/state.service';
import { Token } from '../../constants/tokens';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.styl']
})
export class SwapComponent implements OnInit {

  pair$ = new BehaviorSubject([Token.USDT, Token.USDJ]);
  pairSwitch$ = new Subject<void>();

  from!: Token;
  from$: Observable<TokenInfo>;
  to$: Observable<TokenInfo>;

  private _input = new BigNumber(0);
  get input() {
    return this._input;
  }
  set input(value: BigNumber) {
    this._input = value;
    this.input$.next(value);
  }
  input$ = new Subject<BigNumber>();

  targetAmount$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  priceDirection$ = new BehaviorSubject(false);
  priceDirectionSwitch$ = new Subject<void>();
  price$: Observable<string>;

  isApproving = false;
  shouldApprove$: Observable<boolean>;

  // canSwap$: Observable<boolean>;
  isSwapping = false;

  constructor(private stateService: StateService) {
    this.pairSwitch$.pipe(
      scan(([a, b]) => [b, a], this.pair$.value),
      tap(() => this.input = new BigNumber(0)),
    ).subscribe(this.pair$);

    this.from$ = this.pair$.pipe(
      map(([token, ]) => token),
      mergeMap(token => stateService.getToken$(token)),
      tap(token => this.from = token.address),
    );
    this.to$ = this.pair$.pipe(
      map(([, token]) => token),
      mergeMap(token => stateService.getToken$(token))
    );

    combineLatest([this.from$, this.input$]).pipe(
      mergeMap(([token, input]) => stateService.getTargetAmount$(token.address, input)),
    ).subscribe(this.targetAmount$);

    const allowance$ = this.from$.pipe(
      map(token => token.allowance)
    );
    this.shouldApprove$ = combineLatest([this.input$, allowance$]).pipe(
      map(([amount, allowance]) => {
        if (amount.eq(0))
          return false;

        return amount.gt(allowance);
      })
    );

    this.priceDirectionSwitch$.pipe(
      scan(direction => !direction, false)
    ).subscribe(this.priceDirection$);
    this.price$ = combineLatest([this.from$, this.input$, this.to$, this.targetAmount$, this.priceDirection$]).pipe(
      map(([from, input, to, targetAmount, direction]) => {
        input = input.div(new BigNumber(10).pow(from.decimals));
        targetAmount = targetAmount.div(new BigNumber(10).pow(to.decimals));

        return !direction ? input.div(targetAmount) : targetAmount.div(input);
      }),
      map(price => price.toFixed(3)),
    );
  }

  ngOnInit(): void {
  }

  async approve() {
    this.isApproving = true;
    try {
      await this.stateService.approve(this.from, this.input);
    } finally {
      this.isApproving = false;
    }
  }
  async swap() {
    this.isSwapping = true;
    try {
      await this.stateService.swap(this.from, this.input);
    } finally {
      this.isSwapping = false;
    }
  }

}
