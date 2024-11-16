import React from 'react';
import type { ViewportHighlight } from 'react-pdf-highlighter-extended';

import { CommentedHighlight } from '~/types/files/pdf';

interface HighlightPopupProps {
    highlight: ViewportHighlight<CommentedHighlight>;
}

const HighlightPopup = ({ highlight }: HighlightPopupProps) => {
    return (
        <div className='rounded border bg-white px-2 py-1'>
            {highlight.comment ? highlight.comment : 'Comment has no Text'}
        </div>
    );
};

export default HighlightPopup;
