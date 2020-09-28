import { Component, VERSION, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

const LANGUAGES_SUPPORTED: string[] = ["en", "pl"];
const SYSTEM_DEFAULT_LANGUAGE = "en";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  connectionTypes: string[];
  currentConnection: string;
  useObservable: boolean;
  isLoading: boolean;

  constructor(public translateService: TranslateService) {
    translateService.addLangs(LANGUAGES_SUPPORTED);
    translateService.setDefaultLang(SYSTEM_DEFAULT_LANGUAGE);
    this.connectionTypes = ["Promises", "Observables"];
    //ReadMe
    // please change this below value to `this.connectionTypes[1]` to test functionality via with Observables
    // `this.connectionTypes[0]===Promises` and `this.connectionTypes[1]===Observables`
    
    this.currentConnection = this.connectionTypes[0];
    this.useObservable = this.currentConnection === this.connectionTypes[1];
  }

  changeLanguage(selectedLanguage: string): void {
    this.translateService.use(selectedLanguage);
  }

  changeConnection(selectedConnection: string): void {
    this.currentConnection = selectedConnection;
    this.useObservable = this.currentConnection === this.connectionTypes[1];
  }

  disableForm(isSubmissionInprogress: boolean): void {
    this.isLoading = isSubmissionInprogress;
  }
}
