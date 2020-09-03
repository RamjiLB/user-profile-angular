import { Injectable } from "@angular/core";
import { IProfile, IProfileForm } from "../models/profile";

@Injectable({ providedIn: "root" })
export class ProfileService {
  userProfile: IProfile;

  private removeWhiteSpaces(formValue: string): string {
    return formValue.replace(/\s+/g, "");
  }

  getProfileUser(): Promise<IProfile> {
    console.log("get user profile");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.round(Math.random())) {
          this.userProfile = {
            firstName: "Michael",
            lastName: "Collins",
            userName: "michael.collins",
            age: 30
          };
          console.log("Received profile");
          resolve(this.userProfile);
        } else {
          console.log("Error fetching profile");
          reject({ error: "MISSING_PROFILE_ERROR" });
        }
      }, Math.random() * 500);
    });
  }

  setName(userData: IProfile): Promise<IProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.round(Math.random())) {
          this.userProfile = userData;

          resolve(this.userProfile);
        } else {
          console.log("Set Username error");
          reject({ error: "NAME_GENERATION_ERROR" });
        }
      }, Math.random() * 500);
    });
  }

  setEmail(userData: IProfile): Promise<IProfile> {
    const emailSuffix: string = "@blueface.com";

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.round(Math.random())) {
          this.userProfile.email = `${userData.userName}${emailSuffix}`;

          resolve(this.userProfile);
        } else {
          console.log("Set Useremail error");
          reject({ error: "EMAIL_GENERATION_ERROR" });
        }
      }, Math.random() * 500);
    });
  }

  createProfileRequest(userProfileFormData: IProfileForm): IProfile {
    const firstName: string = this.removeWhiteSpaces(
      userProfileFormData.firstName
    );
    const lastName: string = this.removeWhiteSpaces(
      userProfileFormData.lastName
    );
 
    return {
      userName: `${firstName}.${lastName}`,
      firstName,
      lastName
    };
  }
}
