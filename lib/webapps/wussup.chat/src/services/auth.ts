import Cookies from "js-cookie";
import { API_CONSTANTS } from "@/constants/api";
import { supabase } from "./supabase";
import { User } from "@/types/user";

// auth service to handle authentication state and API calls
export const authService = {
  // check if user is authenticated
  async isAuthenticated() {
    try {
      const token = Cookies.get("access_token");
      if (!token) return false;

      const response = await fetch(
        API_CONSTANTS.BASE_URL + API_CONSTANTS.ENDPOINTS.AUTH_ME,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-App-Id": API_CONSTANTS.APP_ID,
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data?.data?.id) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // get current user data
  async getCurrentUser() {
    try {
      const token = Cookies.get("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(
        API_CONSTANTS.BASE_URL + API_CONSTANTS.ENDPOINTS.AUTH_ME,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-App-Id": API_CONSTANTS.APP_ID,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get user data");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  // set auth tokens
  setTokens(access_token: string, expires_in: number) {
    Cookies.set("access_token", access_token, {
      expires: expires_in,
      secure: true,
      sameSite: "strict",
    });
  },

  // clear auth tokens
  clearTokens() {
    Cookies.remove("access_token");
  },

  // logout user
  async logout() {
    try {
      const token = Cookies.get("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(
        API_CONSTANTS.BASE_URL + API_CONSTANTS.ENDPOINTS.LOGOUT,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-App-Id": API_CONSTANTS.APP_ID,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      this.clearTokens();
      return data;
    } catch (error) {
      this.clearTokens(); // Clear tokens even if API call fails
      throw error;
    }
  },

  // update user
  async updateUser(data: { email?: string; username?: string }) {
    const token = Cookies.get("access_token");
    if (!token) throw new Error("No access token found");

    const response = await fetch(
      API_CONSTANTS.BASE_URL + API_CONSTANTS.ENDPOINTS.AUTH_ME,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-App-Id": API_CONSTANTS.APP_ID,
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update user");
    }

    return responseData;
  },

  // delete user
  async deleteUser() {
    const token = Cookies.get("access_token");
    if (!token) throw new Error("No access token found");

    const response = await fetch(
      API_CONSTANTS.BASE_URL + API_CONSTANTS.ENDPOINTS.AUTH_ME,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-App-Id": API_CONSTANTS.APP_ID,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete user");
    }

    this.clearTokens();
    return data;
  },

  // ensure user exists in database, create with defaults if not
  async ensureUserExists(user: User) {
    const { data, error: fetchError } = await supabase
      .from("ChatBot_Users")
      .select()
      .eq("user_id", user.id)
      .single();

    if (fetchError || !data) {
      // User doesn't exist, create with default values
      const { error: insertError } = await supabase
        .from("ChatBot_Users")
        .insert({
          user_id: user.id,
          email: user.email,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionStatus: "inactive",
          checkoutSessionId: null,
          subscriptionPeriodEnd: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating user:", insertError);
        throw insertError;
      }
    }
  },
};
