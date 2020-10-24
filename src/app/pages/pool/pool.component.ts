import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { StateService } from '../../services/state.service';
import { PositionInfo } from '../../types/PositionInfo';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.styl']
})
export class PoolComponent implements OnInit {

  position$: Observable<PositionInfo | null>;

  constructor(stateService: StateService) {
    this.position$ = stateService.getPositionInfo$();
  }

  ngOnInit(): void {
  }

}
