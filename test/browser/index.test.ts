import { describe, it, expect } from "vitest";
import { runSignUpTest } from "./signUp/signUpTest";

describe("User registration tests", () => {
  it(
    "should run a series of checks to ensure user registration works correctly",
    async () => {
      const errors = await runSignUpTest();

      expect(errors.length).toBe(0);
    },
    // this is so hacky. I wrote these tests in my own little test lib
    // then decided to run them in a more conventional test lib (vitest)
    // so this is basically running a whole suite of tests and returning the errors
    // if any. if there are errors, the test will fail.
    // This is not the practice we want to keep moving forward
    // https://bsky.app/profile/matthewbub.bsky.social/post/3l62ocw7ufa2i
    100000 * 5
  );
});
