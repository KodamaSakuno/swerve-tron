import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { Subject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

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

  @Input()
  disabled = false;

  constructor(private stateService: StateService) {
    this.input$.pipe(
      filter(input => input.length > 0),
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
  }

  setMaxAmount() {
    this.amount = this.token.balance;
    this.amountChange.next(this.amount);
  }

}
