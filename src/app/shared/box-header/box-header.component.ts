import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'box-header',
  templateUrl: './box-header.component.html',
  styleUrls: ['./box-header.component.styl']
})
export class BoxHeaderComponent implements OnInit {

  @Input()
  link = '';

  constructor() { }

  ngOnInit(): void {
  }

}
