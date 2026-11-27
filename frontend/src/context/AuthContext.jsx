
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check whether a user is already authenticated.
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            setLoading(false);
            return;
        }

        api.get("auth/profile/")
            .then((response) => {
                setUser(response.data);
            })
            .catch(() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Login using Django JWT authentication.
    const login = async (username, password) => {
        const response = await api.post("token/", {
            username,
            password,
        });

        const { access, refresh } = response.data;

        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);

        const profileResponse = await api.get("auth/profile/");

        setUser(profileResponse.data);

        return profileResponse.data;
    };

    // Logout the current user.
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to access authentication information.
export function useAuth() {
    return useContext(AuthContext);
}
