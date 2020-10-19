import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';

import { TokenInfo } from '../../types/TokenInfo';
import { StateService } from '../../services/state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenInputComponent implements OnInit {

  private _token: TokenInfo | null = null;
  get token() {
    return this._token;
  }
  @Input()
  set token(value: TokenInfo | null) {
    this._token = value;

    if (!value)
      return;

    this.balance$ = this.stateService.getToken$(value.address).pipe(
      map(token => token.balance),
    );
    this.stateService.requestTRC20TokenBalance(value.address);
  }

  balance$: Observable<BigNumber> | null = null;

  isBadInput = false;

  constructor(private stateService: StateService) {
  }

  ngOnInit(): void {
  }

}
