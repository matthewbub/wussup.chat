import { STRINGS } from "../constants/strings";

export default function Login() {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            {STRINGS.LOGIN_TITLE}
          </h2>
        </div>

        <div className="ch-card p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-sm ">
          <form className="space-y-6">
            <div>
              <label htmlFor="email">{STRINGS.LOGIN_EMAIL_LABEL}</label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="ch-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-white"
                >
                  {STRINGS.LOGIN_PASSWORD_LABEL}
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    {STRINGS.LOGIN_FORGOT_PASSWORD}
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="ch-input"
                />
              </div>
            </div>

            <div>
              <button type="submit" className="ch-button">
                {STRINGS.LOGIN_SUBMIT}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            {STRINGS.LOGIN_NOT_MEMBER}{" "}
            <a
              href="#"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {STRINGS.LOGIN_FREE_TRIAL}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
