import React from 'react';

const DocumentView: React.FC<{ content: string }> = ({ content }) => {
    return <img src={content} className='rounded border shadow max-h-[90vh] max-w-[90vw]' />;
};

export default DocumentView;
