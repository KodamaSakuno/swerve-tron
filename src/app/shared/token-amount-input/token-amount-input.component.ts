import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, delay } from 'rxjs/operators';

import { TokenInfo } from '../../types/TokenInfo';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.styl']
})
export class TokenAmountInputComponent implements OnInit {

  @ViewChild('amountInput', { static: true })
  input!: ElementRef<HTMLInputElement>;

  @Input()
  token!: TokenInfo;

  @Input()
  amount = new BigNumber(0);
  input$ = new Subject<string>();
  @Output()
  amountChange = new Subject<BigNumber>();

  @Output()
  shouldApproveChange = new BehaviorSubject<boolean>(false);

  @Input()
  disabled = false;

  constructor(private stateService: StateService) {
    this.input$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(input => new BigNumber(input).times(new BigNumber(10).pow(this.token.decimals)))
    ).subscribe(this.amountChange);
  }

  ngOnInit(): void {
    this.stateService.getInitialized$().subscribe(() => {
      this.stateService.requestTRC20TokenBalance(this.token.address);
      this.stateService.requestTRC20TokenAllowance(this.token.address);
    });

    const allowance$ = this.stateService.getToken$(this.token.address).pipe(
      map(token => token.allowance)
    );
    combineLatest([this.amountChange, allowance$]).pipe(
      delay(0),
      map(([amount, allowance]) => {
        if (amount.eq(0))
          return false;

        return amount.gt(allowance);
      }),
    ).subscribe(this.shouldApproveChange);
  }

  setMaxAmount() {
    this.amount = this.token.balance;
    this.amountChange.next(this.amount);
  }

}
