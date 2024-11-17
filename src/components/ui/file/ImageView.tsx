import React from 'react';

const DocumentView: React.FC<{ content: string }> = ({ content }) => {
    return <img src={content} className='rounded border shadow' />;
};

export default DocumentView;
