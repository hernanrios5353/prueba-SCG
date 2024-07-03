import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';  // Importa `provideHttpClient` y `withFetch`

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),  // Configura HttpClient para usar `fetch`
    importProvidersFrom(HttpClientModule)  // Asegúrate de mantener `HttpClientModule` si es necesario
  ]
};
