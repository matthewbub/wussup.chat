import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <form className="bg-gray-800 p-6 rounded-lg shadow-md">
      <label htmlFor="email" className="block text-white mb-2">
        Email:
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="w-full p-2 mb-4 border border-gray-700 rounded bg-gray-900 text-white"
      />
      <label htmlFor="password" className="block text-white mb-2">
        Password:
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="w-full p-2 mb-4 border border-gray-700 rounded bg-gray-900 text-white"
      />
      <button
        formAction={login}
        className="w-full p-2 mb-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Log in
      </button>
      <button
        formAction={signup}
        className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Sign up
      </button>
    </form>
  );
}
