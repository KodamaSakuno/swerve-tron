import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';

import { StateService } from '../../services/state.service';
import { Token } from '../../constants/tokens';
import { PositionInfo } from 'src/app/types/PositionInfo';

@Component({
  selector: 'app-remove-liquidity',
  templateUrl: './remove-liquidity.component.html',
  styleUrls: ['./remove-liquidity.component.styl']
})
export class RemoveLiquidityComponent implements OnInit {

  @ViewChild('shareInput', { static: true })
  shareInput!: ElementRef<HTMLInputElement>;

  private _share = 0;
  get share() {
    return this._share;
  }
  set share(value: number) {
    this._share = value;
    this.share$.next(value);
  }
  share$ = new Subject<number>();

  balance$: Observable<BigNumber>;

  amount = new Subject<BigNumber>();
  inputAmount$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  buttonDisabled = true;

  position$: Observable<PositionInfo | null>;

  constructor(private stateService: StateService) {
    this.balance$ = stateService.getToken$(Token.swUSD).pipe(
      map(token => token.balance)
    );

    const share$ = this.share$.pipe(
      distinctUntilChanged(),
      tap(share => this.buttonDisabled = share === 0),
    );
    combineLatest([share$, this.balance$]).pipe(
      map(([share, balance]) => balance.times(share).div(100))
    ).subscribe(this.inputAmount$);

    this.position$ = stateService.getPositionInfo$();
  }

  ngOnInit(): void {
    this.stateService.getInitialized$().subscribe(() => {
      this.stateService.requestTRC20TokenBalance(Token.swUSD);
      this.stateService.requestPoolInfo();
    });
  }

  async remove() {
    const input = this.inputAmount$.value;

    this.stateService.removeLiquidity(input);
  }

}
