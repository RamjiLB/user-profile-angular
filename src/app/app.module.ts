import { NgModule } from "@angular/core";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { BrowserModule } from "@angular/platform-browser";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { AppComponent } from "./app.component";


const routes: Routes = [{ path: "", component: ProfileSettingsComponent }];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AppComponent, ProfileSettingsComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
