import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import type { CountUpOptions } from 'countup.js';
import { BigNumberPipe } from 'src/app/bignumber.pipe';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  styleUrls: ['./value.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueComponent implements OnInit {

  @Input()
  value = new BigNumber(0);

  @Input()
  decimals = 0;

  get countUp() {
    return this.value.div(new BigNumber(10).pow(this.decimals)).toNumber();
  }

  get options(): CountUpOptions {
    return {
      decimalPlaces: this.decimals,
      duration: 0.5,
      useGrouping: false,
    };
  }

  constructor() { }

  ngOnInit(): void {
  }

}
