import { useEffect, useState } from 'react'

export default function useDebounce<T>(value: T, timeout: number = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedValue(value)
        }, timeout)
        return () => clearTimeout(timeoutId)
    }, [value, timeout])

    return debouncedValue
}

export function useDebounceMany<T>(valsByName: Record<string, T>, timeout: number = 300) {
    const [debouncedValsByName, setDebouncedValsByName] = useState(valsByName)
    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedValsByName(valsByName)
        }, timeout)
        return () => clearTimeout(id)
    }, [valsByName, timeout])
    return debouncedValsByName
}
