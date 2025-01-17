"use client";

import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/authStore";
import { useUserSettingsStore } from "@/stores/userSettingsStore";
import { useState } from "react";

type AccountSettingsFormData = {
  email: string;
  username: string;
};

export function AccountSettings() {
  const user = useAuthStore((state) => state.user);
  const { isLoading, error, updateUser, deleteUser } = useUserSettingsStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AccountSettingsFormData>({
    defaultValues: {
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  const onSubmit = async (data: AccountSettingsFormData) => {
    try {
      await updateUser(data);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await deleteUser();
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6 dark:text-white">
        Account Settings
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium dark:text-gray-200">
            Email
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
          />
          {errors.email && (
            <span className="text-sm text-red-500 dark:text-red-400">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium dark:text-gray-200">
            Username
          </label>
          <input
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
              maxLength: {
                value: 255,
                message: "Username must be less than 255 characters",
              },
            })}
            type="text"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.username
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
          />
          {errors.username && (
            <span className="text-sm text-red-500 dark:text-red-400">
              {errors.username.message}
            </span>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Danger Zone
          </span>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isLoading ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete Account
          </button>
        )}
      </div>
    </>
  );
}
