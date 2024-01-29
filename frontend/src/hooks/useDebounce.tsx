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
