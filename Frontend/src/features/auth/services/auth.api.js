import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true
})

export const register = async ({username, email, password}) => {
    try {
        const response = await api.post('/auth/register', {
            username, email, password
        })

        return response.data;

    } catch (error) {
        console.log(error)
    }
}

export const login = async ({email, password}) => {
    try {
        const response = await api.post('/auth/login', {
            email, password
        })

        return response.data;

    } catch (error) {
        console.log(error)
    }
}

export const logout = async () => {
    try {
        const response = await api.get('/auth/logout')

        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const currentUser = async () => {
    try {
        const response = await api.get('/auth/current-user');

        return response.data;
    } catch (error) {
        console.log(error)
    }
}