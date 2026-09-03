import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideQbcServices } from '@qbc/api';
import { routes } from './app.routes';
import { provideQbcWorkboard } from './qbc-workboard.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideQbcServices(),
    provideRouter(routes, withComponentInputBinding()),
    provideQbcWorkboard(),
  ],
};
