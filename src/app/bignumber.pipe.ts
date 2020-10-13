import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'bignumber.js';

@Pipe({
  name: 'bignumber'
})
export class BignumberPipe implements PipeTransform {

  transform(value: string | BigNumber | null, decimals = 18): string {
    if (!value)
      return '';

    if (typeof value === 'string')
      value = new BigNumber(value);

    return value.div(new BigNumber(10).pow(decimals)).toString();
  }

}
