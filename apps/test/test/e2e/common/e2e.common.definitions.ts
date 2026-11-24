export interface TestCourse {
  categoryId: number | null;
  courseTypeId: number;
  createdAt?: string;
  deletedAt?: string | null;
  id: number;
  name: string;
  updatedAt?: string;
}

// the decoded payload of a token issued by the IAM module
export interface TestTokenPayload {
  data: { userId: number | string };
  exp: number;
  iat: number;
  iss: string;
}

export interface TestUser {
  email: string;
  firstName: string;
  id: number;
  lastName: string;
}

// userId is a 64-bit integer in ClickHouse, so it may be returned as a string
export interface TestUserLoginLog {
  datetime: string;
  userId: number | string;
}
