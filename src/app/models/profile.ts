export interface IProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email?: string;
  age?: number;
}

export interface IProfileForm {
  firstName: string;
  lastName: string;
}