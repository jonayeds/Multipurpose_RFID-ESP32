"use server"

import { cookies } from "next/headers"

export const getMyCard = async () =>{
    const token = (await cookies()).get("token")?.value;
    if (!token) {
        return {
            error: "No token found",
        }
    }

    const response = await fetch(`${process.env.SERVER_URL}/get-my-card`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method: "GET",
    })
    const data = await response.json();
    if (!response.ok) {
        return {success: false, message: data.error || "Failed to fetch card data"}
    }
    return {data, success: true}
}

export const cardLogin = async (email: string, cardPassword: string) => {
    const response = await fetch(`${process.env.SERVER_URL}/login-card`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", 
        },
        body: JSON.stringify({ email, cardPassword })
    });
    const data = await response.json();
    if(!data.token) {
        return {success:false, message: data.error || "Login failed"}
    }
    (await  cookies()).set("token", data.token, { path: "/" })
    return {success:true, message: "Login successful"}
}


export const logout = async () => {
    (await cookies()).delete("token");  
    return {success: true, message: "Logout successful"}         
}
