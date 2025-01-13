import { faker } from "@faker-js/faker";

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  email_verified: boolean;
  role: "user" | "admin";
  status: "active" | "suspended" | "pending" | "deleted" | "temporarily_locked";
  failed_login_attempts: number;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  locked_until: Date | null;
  status_before_lockout:
    | "active"
    | "suspended"
    | "pending"
    | "deleted"
    | "temporarily_locked"
    | null;
};

export type CommonResponse = {
  success: boolean;
  code: string;
  message: string;
  data: any;
};

// creates a fake user with randomized but valid data matching the schema
export function createFakeUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email({
      provider: "ninembs-tests.studio",
    }),
    password: faker.internet.password({ length: 12 }), // reasonable default length
    email_verified: faker.datatype.boolean(),
    role: faker.helpers.arrayElement(["user", "admin"]),
    status: faker.helpers.arrayElement([
      "active",
      "suspended",
      "pending",
      "deleted",
      "temporarily_locked",
    ]),
    failed_login_attempts: faker.number.int({ min: 0, max: 10 }),
    last_login_at: faker.date.past(),
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    locked_until: faker.helpers.arrayElement([null, faker.date.future()]),
    status_before_lockout: faker.helpers.arrayElement([
      null,
      "active",
      "suspended",
      "pending",
      "deleted",
      "temporarily_locked",
    ]),
    ...overrides,
  };
}
