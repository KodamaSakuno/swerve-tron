import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { Subject, BehaviorSubject, fromEvent, combineLatest } from 'rxjs';
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
  @Output()
  amountChange = new Subject<BigNumber>();

  @Output()
  shouldApproveChange = new BehaviorSubject<boolean>(false);

  @Input()
  disabled = false;

  constructor(private stateService: StateService) {
  }

  ngOnInit(): void {
    this.stateService.getInitialized$().subscribe(() => {
      this.stateService.requestTRC20TokenBalance(this.token.address);
      this.stateService.requestTRC20TokenAllowance(this.token.address);
    });

    fromEvent<InputEvent>(this.input.nativeElement, 'input').pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(event => {
        const inputText = (event.target as HTMLInputElement).value || '0';

        return new BigNumber(inputText).times(new BigNumber(10).pow(this.token.decimals));
      }),
    ).subscribe(this.amountChange);

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
