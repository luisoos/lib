import { useEffect, useState } from 'react';

export default function useDebounce(values: any[], delay: number) {
    const [debouncedValues, setDebouncedValues] = useState(values);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValues(values);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [values, delay]);

    return debouncedValues;
}
