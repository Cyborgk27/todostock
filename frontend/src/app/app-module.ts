import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { environment } from '../environments/environment';
import { Configuration } from './core/api';
import { provideHttpClient } from '@angular/common/http';

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
    provideHttpClient(),
  ],
  bootstrap: [App],
})
export class AppModule {}
