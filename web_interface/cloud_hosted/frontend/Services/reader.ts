"use server";

import { cookies } from "next/headers";

export const getMyReader = async () => {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return {
      error: "No token found",
    };
  }

  const response = await fetch(`${process.env.SERVER_URL}/get-my-reader`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      message: data.error || "Failed to fetch reader data",
    };
  }
  return { data, success: true };
};

export const readerLogin = async (email: string, readerPassword: string) => {
  const response = await fetch(`${process.env.SERVER_URL}/login-reader`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, readerPassword }),
  });
  const data = await response.json();
  if (!data.token) {
    return { success: false, message: data.error || "Login failed" };
  }
  (await cookies()).set("token", data.token, { path: "/" });
  return { success: true, message: "Login successful" };
};
