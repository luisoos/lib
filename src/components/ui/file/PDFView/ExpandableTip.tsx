import React, { useLayoutEffect, useRef, useState } from 'react';
import CommentForm from './CommentForm';
import {
    GhostHighlight,
    PdfSelection,
    usePdfHighlighterContext,
} from 'react-pdf-highlighter-extended';
import { BookmarkPlus } from 'lucide-react';

interface ExpandableTipProps {
    addHighlight: (highlight: GhostHighlight, comment: string) => void;
}

const ExpandableTip = ({ addHighlight }: ExpandableTipProps) => {
    const [compact, setCompact] = useState(true);
    const selectionRef = useRef<PdfSelection | null>(null);

    const {
        getCurrentSelection,
        removeGhostHighlight,
        setTip,
        updateTipPosition,
    } = usePdfHighlighterContext();

    useLayoutEffect(() => {
        updateTipPosition!();
    }, [compact]);

    return (
        <div className='border rounded bg-white shadow-inner px-2 py-1'>
            {compact ? (
                <button
                    className='flex font-medium'
                    onClick={() => {
                        setCompact(false);
                        selectionRef.current = getCurrentSelection();
                        selectionRef.current!.makeGhostHighlight();
                    }}>
                    <BookmarkPlus size={16} className='my-auto mr-1' />
                    <span>Add highlight</span>
                </button>
            ) : (
                <CommentForm
                    placeHolder='Your comment...'
                    onSubmit={(input) => {
                        addHighlight(
                            {
                                content: selectionRef.current!.content,
                                type: selectionRef.current!.type,
                                position: selectionRef.current!.position,
                            },
                            input,
                        );

                        removeGhostHighlight();
                        setTip(null);
                    }}
                />
            )}
        </div>
    );
};

export default ExpandableTip;
