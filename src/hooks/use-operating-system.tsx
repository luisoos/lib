import { useState, useEffect } from 'react';

export function useOperatingSystem() {
    const [isWindows, setIsWindows] = useState(false);

    useEffect(() => {
        setIsWindows(navigator.platform.toUpperCase().indexOf('WIN') >= 0);
    }, []);

    return { isWindows };
}
