import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnDestroy,
  OnChanges
} from "@angular/core";
import { ProfileService } from "../services/profile.service";
import { IProfile, IProfileForm } from "../models/profile";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { from, Observable, Subject, defer, throwError } from "rxjs";
import {
  catchError,
  map,
  retry,
  retryWhen,
  delay,
  switchMap,
  takeUntil,
  concatMap,
  flatMap
} from "rxjs/operators";

const SAVE_PROFILE_MESSAGE = "SAVE_PROFILE_MESSAGE";
const LOAD_PROFILE_MESSAGE = "LOAD_PROFILE_MESSAGE";
const ELLIPSIS = "...";
const EMPTY_STRING = "";

@Component({
  selector: "app-profile-settings",
  templateUrl: "./profile-settings.component.html",
  styleUrls: ["./profile-settings.component.css"]
})
export class ProfileSettingsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() useObservable: boolean;
  @Output() isFormLoading: EventEmitter<boolean> = new EventEmitter<boolean>();

  profileForm: FormGroup;
  isLoading: boolean;
  hasUserNameUpdated: boolean;
  initialFormValues: IProfileForm;
  hasError: boolean;
  formStatus: string;
  profileError: string;
  userProfile: IProfile = {
    userName: ELLIPSIS,
    email: ELLIPSIS,
    lastName: EMPTY_STRING,
    firstName: EMPTY_STRING,
    age: null
  };

  useObservables: boolean;

  unsubscribe: Subject<void> = new Subject();

  constructor(
    private profileService: ProfileService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.setLoadingStatus(LOAD_PROFILE_MESSAGE);

    this.useObservables ? this.fetchProfileObservable() : this.fetchProfile();
  }

  ngOnChanges(): void {
    this.useObservables = this.useObservable;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const formData: IProfileForm = this.profileForm.value;
    const profileRequestParams: IProfile = this.profileService.createProfileRequest(
      formData
    );

    this.setLoadingStatus(SAVE_PROFILE_MESSAGE);

    this.useObservables
      ? this.submitUserProfileObservable(profileRequestParams, formData)
      : this.submitUserProfile(profileRequestParams, formData);
  }

  //common private methods
  private buildForm(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required]
    } as { [key in keyof IProfileForm]: any });
  }

  private setLoadingStatus(status: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.formStatus = status;

    this.profileForm.disable();

    this.isFormLoading.emit(this.isLoading);
  }

  private enableForm(): void {
    this.isLoading = false;

    this.profileForm.enable();

    this.isFormLoading.emit(this.isLoading);
  }

  private storeFormValue(profileData: IProfile): void {
    this.initialFormValues = {
      ...profileData
    };
  }

  private handleSubmitProfileError(formData: IProfileForm, err): void {
    const resetFormData: IProfileForm = this.hasUserNameUpdated
      ? this.initialFormValues
      : formData;

    this.hasError = true;
    this.profileError = err.error;

    this.profileForm.reset(resetFormData);

    this.hasUserNameUpdated = false;

    this.enableForm();
  }

  // private methods specific only to promises
  private fetchProfile(): void {
    this.getUserProfile()
      .then(userProfileData => {
        this.userProfile = userProfileData;

        this.storeFormValue(userProfileData);

        this.profileForm.patchValue(this.initialFormValues);
      })
      .finally(() => {
        this.enableForm();
      });
  }

  //create the promise again when error occurs, this mimicks the retry Observable onfailure
  private getUserProfile(): Promise<IProfile> {
    return this.profileService.getProfileUser().catch(() => {
      return this.getUserProfile();
    });
  }

  private submitUserProfile(
    profileRequestParams: IProfile,
    formData: IProfileForm
  ): void {
    const setUserName = this.updateUserName(profileRequestParams);

    //nest the setName and SetEmail promises and handle their resolve and reject
    setUserName
      .then(updateProfile => {
        this.hasUserNameUpdated = true;

        return this.updateUserEmail(updateProfile);
      })
      .then(updateProfile => {
        this.storeFormValue(updateProfile);

        this.hasUserNameUpdated = false;

        this.userProfile = updateProfile;
      })
      .catch(err => {
        this.handleSubmitProfileError(formData, err);
      })
      .finally(() => {
        this.enableForm();
      });
  }

  private updateUserName(userData: IProfile): Promise<IProfile> {
    return this.profileService.setName(userData);
  }

  private updateUserEmail(userData: IProfile): Promise<IProfile> {
    return this.profileService.setEmail(userData);
  }

  //<------------------------------------------------------------------>
  // same application implemented with observables instead of promises
  //<------------------------------------------------------------------>
  private getProfileUserAsObservable(): Observable<IProfile> {
    return defer(() => from(this.profileService.getProfileUser()));
  }

  private fetchProfileObservable(): void {
    const getProfileUser$ = this.getProfileUserAsObservable();

    getProfileUser$.pipe(retry()).subscribe(userProfileData => {
      this.userProfile = userProfileData;

      this.storeFormValue(userProfileData);

      this.profileForm.patchValue(this.initialFormValues);

      this.enableForm();
    });
  }

  private submitUserProfileObservable(
    profileRequestParams: IProfile,
    formData: IProfileForm
  ): void {
    this.updateUserNameObservable(profileRequestParams)
      .pipe(
        takeUntil(this.unsubscribe),
        concatMap(updatedProfile => {
          this.hasUserNameUpdated = true;
          return this.updateUserEmailObservable(updatedProfile);
        }),
        catchError(err => {
          this.handleSubmitProfileError(formData, err);

          return throwError(err);
        })
      )
      .subscribe(updatedProfile => {
        this.storeFormValue(updatedProfile);

        this.hasUserNameUpdated = false;
        this.userProfile = updatedProfile;

        this.enableForm();
      });
  }

  private updateUserNameObservable(userData: IProfile): Observable<IProfile> {
    return from(this.profileService.setName(userData));
  }

  private updateUserEmailObservable(userData: IProfile): Observable<IProfile> {
    return from(this.profileService.setEmail(userData));
  }
}
