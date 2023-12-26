import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const useUserIsAuthenticated = () => {
    const _get = async () => {
        const res = await axios.get<{
            authenticated: boolean
        }>('/auth/user_is_logged_in')
        return res.data
    }

    const query = useQuery({ queryKey: ['authenticated'], queryFn: _get })
    return query
}

export const useLogout = () => {
    const _get = async () => {
        const res = await axios.get('/auth/logout')
        return res.data
    }

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: _get,
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['authenticated'] })
        },
    })
    return mutation
}

export const useLogin = () => {
    const _post = async (email: string, password: string) => {
        const res = await axios.post('/auth/login', { email, password })
        return res.data
    }
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            _post(email, password),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['authenticated'] })
        },
    })
    return mutation
}
