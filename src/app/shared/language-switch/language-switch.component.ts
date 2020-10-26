import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-language-switch',
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.styl']
})
export class LanguageSwitchComponent implements OnInit {

  currentLanguage$: Observable<string>;

  constructor(private translateService: TranslateService) {
    this.currentLanguage$ = translateService.onLangChange.pipe(
      map(event => event.lang),
    );
  }

  ngOnInit(): void {
  }

  toggle() {
    const currentLanguage = this.translateService.currentLang;

    this.translateService.use(currentLanguage === 'en' ? 'zhhans' : 'en');
  }

}
