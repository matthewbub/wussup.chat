"use client";

import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/authStore";
import { useUserSettingsStore } from "@/stores/userSettingsStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold">Account Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-4 py-6 sm:p-8 space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
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
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              <div className="px-4 py-4 sm:px-8 flex justify-end">
                <Button type="submit" disabled={isLoading || !isDirty}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold">Danger Zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Delete your account and all associated data.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Delete Account Section */}
          <Card className="border-destructive/50">
            <div className="px-4 py-6 sm:p-8">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>

                {showDeleteConfirm && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      Are you absolutely sure? This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  {showDeleteConfirm ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={deleteUser}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, delete my account"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
