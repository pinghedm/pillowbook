import { UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

export const capitalizeWords = (s?: string) =>
    s
        ?.replace('_', ' ')
        ?.split(' ')
        ?.map(w => w[0].toUpperCase() + w.slice(1))
        ?.join(' ')

export const readCookie = (name?: string) => {
    if (!name) return null
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    return match ? decodeURIComponent(match[3]) : null
}

export const getOrderingString = (orderObj?: { key: string; order: 'ascend' | 'descend' }) => {
    if (!orderObj) {
        return undefined
    }
    const field = orderObj.key
    const prefix = orderObj.order === 'descend' ? '-' : ''
    return prefix + field
}

export const getDjangoShapedFilters = (filters: Record<string, string[]>) => {
    return Object.fromEntries(Object.entries(filters).map(([k, vs]) => [k, vs.join(',')]))
}

export interface PaginatedResult<T> {
    results: T[]
    count: number
    next?: string
    previous?: string
}

export function usePagedResultData<T>(res: PaginatedResult<T> | undefined) {
    const data = useMemo(() => res?.results ?? [], [res])
    const total = useMemo(() => res?.count ?? 0, [res])
    return { data, total }
}
