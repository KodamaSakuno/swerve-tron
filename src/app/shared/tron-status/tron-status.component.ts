import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { TronInfo } from '../../types/TronInfo';

@Component({
  selector: 'app-tron-status',
  templateUrl: './tron-status.component.html',
  styleUrls: ['./tron-status.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TronStatusComponent implements OnInit {

  @Input()
  tron!: TronInfo;

  constructor() { }

  ngOnInit(): void {
  }

  // 需要抽离到功能方法里面
  shorten(str: string = ''): string {
    if (!str) return ''
    return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`
  }

}
