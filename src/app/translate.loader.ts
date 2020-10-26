import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { safeLoad } from 'js-yaml';

export class YamlTranslateLoader implements TranslateLoader {

  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const path = `./assets/locales/${lang}.yaml`;

    return this.http.get(path, { responseType: 'text' }).pipe(
      catchError(() => {
        console.error('Translation file not found:', path);

        return of('');
      }),
      map(response => safeLoad(response)),
    );
  }

}
