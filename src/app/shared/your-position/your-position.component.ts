import { Component, Input, OnInit } from '@angular/core';

import { PositionInfo } from '../../types/PositionInfo';

@Component({
  selector: 'your-position',
  templateUrl: './your-position.component.html',
  styleUrls: ['./your-position.component.styl']
})
export class YourPositionComponent implements OnInit {

  @Input()
  position!: PositionInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
