import axios from 'axios'
import { Item } from './item_service'
import { useMutation } from '@tanstack/react-query'

export interface Activity {
    token: string
    user: string // token
    item: string // token
    item_type: string // slug

    start_time: string // isoformat
    end_time: string // isoformat
    finished: boolean

    rating: number
    notes: string
    info: Record<string, any>
}

export interface CreateActivityType {
    itemDetails: { info: Item['info']; item_type: Item['item_type'] }
    activityDetails: Omit<Activity, 'token' | 'user' | 'item' | 'item_type'>
}

export const useCreateActivity = () => {
    const _post = async (newActivity: CreateActivityType) => {
        const res = await axios.post('/api/activity', newActivity)
        return res.data
    }

    const mutation = useMutation({
        mutationFn: (newActivity: CreateActivityType) => _post(newActivity),
    })
    return mutation
}
