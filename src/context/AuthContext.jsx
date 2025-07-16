import { createContext, useState, useContext, useEffect } from "react";
import { loginRequest } from "../api/Auth";
import Cookies from 'js-cookie';
export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("Debe estar dentro del Provider");
    }
    return context;
}

export const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/Login';
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const login = async (user) => {
        try {
            const res = await loginRequest(user);
            setUser(res.data.usuario);
            setIsAuthenticated(true);
            Cookies.set('token', res.data.token);
            Cookies.set('user', JSON.stringify(res.data.usuario));
        } catch (error) {
            console.log(error)
            return error.response.data.message;
        }
    };

    useEffect(() => {
        const cookies = Cookies.get();
        if (cookies.token && cookies.user) {
            setIsAuthenticated(true);
            setUser(JSON.parse(cookies.user)); // Parsea el JSON
        }
        setLoading(false);
    }, []);
    

    return (
        <AuthContext.Provider 
            value={{
                login,
                user,
                logout,
                isAuthenticated,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
