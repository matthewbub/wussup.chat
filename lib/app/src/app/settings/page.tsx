"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthWrapper } from "@/components/system/AuthWrapper";
import { AuthHeader } from "@/components/system/AuthHeader";
import { useAuthStore } from "@/stores/authStore";
import { useUserSettingsStore } from "@/stores/userSettingsStore";

type SettingsFormData = {
  email: string;
  username: string;
};

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const { isLoading, error, updateUser, deleteUser } = useUserSettingsStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    defaultValues: {
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateUser(data);
      // Optionally show success message or redirect
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
      // User will be automatically redirected due to auth state change
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <AuthWrapper>
      <div className="container mx-auto p-4">
        <AuthHeader />

        <div className="max-w-xl mx-auto mt-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl">Account Settings</h2>

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

                {error && (
                  <div className="text-error text-center text-sm">{error}</div>
                )}

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
                  Once you delete your account, there is no going back. Please
                  be certain.
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
                    className="btn btn-outline btn-error"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
