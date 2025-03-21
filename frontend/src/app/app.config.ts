import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http'; // provideHttpClient ve withFetch'i ekleyin

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), // HttpClient'yi fetch API'si ile yapılandırın
  ]
};