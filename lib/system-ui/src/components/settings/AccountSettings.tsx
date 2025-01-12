import React from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../stores/authStore";
import { useUserSettingsStore } from "../../stores/userSettingsStore";
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
      <h2 className="card-title text-xl mb-6">Account Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
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
            className={`input input-bordered w-full ${
              errors.email ? "input-error" : ""
            }`}
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.email.message}
              </span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
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
            className={`input input-bordered w-full ${
              errors.username ? "input-error" : ""
            }`}
          />
          {errors.username && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.username.message}
              </span>
            </label>
          )}
        </div>

        {error && <div className="text-error text-center text-sm">{error}</div>}

        <div className="card-actions justify-end">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="btn btn-primary"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="divider mt-6">Danger Zone</div>
      <div className="bg-base-300 rounded-box p-4">
        <p className="text-sm opacity-70 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-error">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="btn btn-error"
              >
                {isLoading ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDeleteAccount}
            className="btn btn-outline btn-error border-error"
          >
            Delete Account
          </button>
        )}
      </div>
    </>
  );
}
