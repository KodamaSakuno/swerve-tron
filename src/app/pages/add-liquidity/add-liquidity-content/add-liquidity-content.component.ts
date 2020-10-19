import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TokenInfo } from 'src/app/types/TokenInfo';

@Component({
  selector: 'app-add-liquidity-content',
  templateUrl: './add-liquidity-content.component.html',
  styleUrls: ['./add-liquidity-content.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLiquidityContentComponent implements OnInit {

  @Input()
  usdt!: TokenInfo;
  @Input()
  usdj!: TokenInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
