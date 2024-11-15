import React, { useState } from 'react';

import { Minus, Plus } from 'lucide-react';
import { cn } from '~/hooks/utils';

interface ToolbarProps {
    setPdfScaleValue: (value: number) => void;
    toggleHighlightPen: () => void;
}

const Toolbar = ({ setPdfScaleValue, toggleHighlightPen }: ToolbarProps) => {
    const [zoom, setZoom] = useState<number | null>(null);
    const [isHighlightPen, setIsHighlightPen] = useState<boolean>(false);

    const zoomIn = () => {
        if (zoom) {
            if (zoom < 4) {
                setPdfScaleValue(zoom + 0.1);
                setZoom(zoom + 0.1);
            }
        } else {
            setPdfScaleValue(1);
            setZoom(1);
        }
    };

    const zoomOut = () => {
        if (zoom) {
            if (zoom > 0.2) {
                setPdfScaleValue(zoom - 0.1);
                setZoom(zoom - 0.1);
            }
        } else {
            setPdfScaleValue(1);
            setZoom(1);
        }
    };

    return (
        <div className='border flex justify-between align-center px-4 py-2'>
            <div className='flex align-center my-auto'>
                <button
                    title='Zoom in'
                    onClick={zoomIn}
                    className='mr-2 cursor-zoom-in'>
                    <Plus size={16} />
                </button>
                <button
                    title='Zoom out'
                    onClick={zoomOut}
                    className='mr-2 cursor-zoom-out'>
                    <Minus size={16} />
                </button>
                {zoom ? `${(zoom * 100).toFixed(0)}%` : 'Auto'}
            </div>
            <button
                title='Highlight'
                className={cn(
                    'hover:opacity-80',
                    isHighlightPen ? 'active' : '',
                )}
                onClick={() => {
                    toggleHighlightPen();
                    setIsHighlightPen(!isHighlightPen);
                }}>
                Toggle Highlights
            </button>
        </div>
    );
};

export default Toolbar;
