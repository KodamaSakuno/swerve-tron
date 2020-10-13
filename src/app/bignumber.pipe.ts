import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'bignumber.js';

@Pipe({
  name: 'bignumber'
})
export class BigNumberPipe implements PipeTransform {

  transform(value: BigNumber.Value | null, decimals = 18): string {
    if (!value)
      return '';

    if (typeof value === 'string' || typeof value === 'number')
      value = new BigNumber(value);

    return value.div(new BigNumber(10).pow(decimals)).toString();
  }

}
