import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { PositionInfo } from '../../types/PositionInfo';

@Component({
  selector: 'app-liquidity-info',
  templateUrl: './liquidity-info.component.html',
  styleUrls: ['./liquidity-info.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidityInfoComponent implements OnInit {

  @Input()
  position!: PositionInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
