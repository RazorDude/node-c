export class UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  userId: number;
}

export class UpdateUserData {
  firstName?: string;
  hasTakenIntro?: boolean;
  lastName?: string;
  profileImageKey?: string;
  phoneNumber?: string;
}
