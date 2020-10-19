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

}
