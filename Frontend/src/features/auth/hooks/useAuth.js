import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth.context';
import {login, logout, register, currentUser} from '../services/auth.api.js';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({email, password}) => {
        setLoading(true);
        try {
            const response = await login({email, password});
            setUser(response.data);
        } catch (error) {
            
        }finally{
            setLoading(false);
        }
    }

    const handleRegister = async ({username, email, password}) => {
        setLoading(true);
        try {
            const response = await register({username, email, password});
            setUser(response.data);
        } catch (error) {
            
        }finally{
            setLoading(false);
        }
    }    

    const handleLogout = async () => {
        setLoading(true);
        try {
            const response = await logout();
            setUser(null);
        } catch (error) {
            
        }finally{
            setLoading(false);
        }
    }   
    
    useEffect(() => {

        const getAndSetUser = async () => {
            const response = await currentUser();
            setUser(response.data);
            setLoading(false);
        }

        getAndSetUser();

    },[])

    return {user, loading, handleLogin, handleLogout, handleRegister};

}
