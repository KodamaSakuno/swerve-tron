import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TronService } from '../../services/tron.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.styl']
})
export class HeaderComponent implements OnInit {

  account$: Observable<string>;

  constructor(private tronService: TronService) {
    this.account$ = tronService.getState$().pipe(
      map(state => state.account)
    );
  }

  ngOnInit(): void {
  }

}
