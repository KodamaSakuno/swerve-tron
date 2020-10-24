import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Token } from 'src/app/constants/tokens';

@Component({
  selector: 'app-token-icon',
  templateUrl: './token-icon.component.html',
  styleUrls: ['./token-icon.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenIconComponent implements OnInit {

  Token = Token;

  private _token: Token | null = null;
  get token() {
    return this._token;
  }
  @Input()
  set token(value: string | Token | null) {
    console.warn(value, typeof value)
    if (typeof value !== 'string')
      this._token = value;
    else {
      const symbol = value.toUpperCase();

      if (symbol === 'USDT' || value === Token.USDT)
        this._token = Token.USDT;
      else if (symbol === 'USDJ' || value === Token.USDJ)
        this._token = Token.USDJ;
      else if (symbol === 'SWUSD' || value === Token.swUSD)
        this._token = Token.swUSD;
      else
        this._token = null;
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
