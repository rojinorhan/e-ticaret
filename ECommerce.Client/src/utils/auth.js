import { jwtDecode } from "jwt-decode";

export const getToken = () => {
    return localStorage.getItem("token");
};

export const getUserFromToken = () => {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Token okunamadı:", error);
        return null;
    }
};

export const getUserRole = () => {
    const user = getUserFromToken();

    if (!user) {
        return null;
    }

    return (
        user[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] ||
        user.role ||
        null
    );
};

export const isAdmin = () => {
    return getUserRole() === "Admin";
};

export const logout = () => {
    localStorage.removeItem("token");
};