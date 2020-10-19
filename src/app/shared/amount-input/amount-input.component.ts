import { ChangeDetectionStrategy, Component, Input, OnInit, Output } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, tap, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountInputComponent implements OnInit {

  private _decimals = 0;
  get decimals() {
    return this._decimals;
  }
  @Input()
  set decimals(value: number) {
    this._decimals = value;
    this.input$.next(this.text);
  }

  @Input()
  set maxAmount(value: string | number | BigNumber) {
    if (typeof value === 'string' || typeof value === 'number')
      value = new BigNumber(value);

    this.maxAmount$.next(value);
  }

  @Input()
  disabled = false;

  @Output()
  badInput = new Subject<boolean>();
  @Output()
  amountChange = new Subject<BigNumber>();

  text = '';
  maxAmount$ = new BehaviorSubject(new BigNumber(0));
  input$ = new Subject<string>();

  maxButtonVisible$: Observable<boolean>;

  constructor() {
    const preAmount$ = this.input$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      map(input => [new BigNumber(input), input] as const),
    );

    const amount$ = preAmount$.pipe(
      filter(([amount, ]) => !amount.isNaN()),
      map(([amount, ]) => amount.times(new BigNumber(10).pow(this._decimals)))
    );

    merge(
      preAmount$.pipe(
        filter(([amount, input]) => amount.isNaN()),
        map(() => true),
      ),
      amount$.pipe(
        withLatestFrom(this.maxAmount$),
        map(([amount, maxAmount]) => amount.gt(maxAmount)),
      ),
    ).subscribe(this.badInput);

    this.badInput.pipe(map(() => new BigNumber(NaN))).subscribe(this.amountChange);

    this.maxButtonVisible$ = merge(
      this.maxAmount$.pipe(
        map(maxAmount => maxAmount.gt(0)),
      ),
      combineLatest([amount$, this.maxAmount$]).pipe(
        map(([amount, maxAmount]) => !amount.eq(maxAmount)),
      ),
    );

    amount$.pipe(
      withLatestFrom(this.maxAmount$),
      filter(([amount, maxAmount]) => amount.lte(maxAmount)),
      map(([amount, ]) => amount),
    ).subscribe(this.amountChange);
  }

  ngOnInit(): void {
  }

  setMaxAmount() {
    const maxAmount = this.maxAmount$.value;

    this.text = maxAmount.div(new BigNumber(10).pow(this._decimals)).toString();
    this.input$.next(this.text);
  }

}
