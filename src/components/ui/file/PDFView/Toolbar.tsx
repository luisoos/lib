import React, { useState } from 'react';

import { Highlighter, Minus, Plus } from 'lucide-react';
import { cn } from '~/lib/utils';

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
        <div className='flex justify-between align-middle px-4 py-2 border-b'>
            <div className='flex align-middle my-auto'>
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
                <Highlighter
                    className='rounded border p-0.5'
                    style={{
                        backgroundColor: isHighlightPen
                            ? 'rgba(255, 226, 143, 1)'
                            : 'transparent',
                    }}
                />
            </button>
        </div>
    );
};

export default Toolbar;
