import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { environment } from '../environments/environment';
import { Configuration } from './core/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    {
      provide: Configuration,
      useFactory: () => new Configuration({
        basePath: environment.apiUrl,
      })
    },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
  ],
  bootstrap: [App],
})
export class AppModule {}
