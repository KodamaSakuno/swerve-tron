import { Pipe, PipeTransform } from '@angular/core';
import { formatUnits } from '@ethersproject/units';

@Pipe({
  name: 'bignumber'
})
export class BignumberPipe implements PipeTransform {

  transform(value: BigNumber, decimals = 18): unknown {
    return formatUnits(value.toString(), decimals);
  }

}
