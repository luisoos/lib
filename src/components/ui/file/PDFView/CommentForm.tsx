import React, { useState } from 'react';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';

interface CommentFormProps {
    onSubmit: (input: string) => void;
    placeHolder?: string;
}

const CommentForm = ({ onSubmit, placeHolder }: CommentFormProps) => {
    const [input, setInput] = useState<string>('');

    return (
        <form
            className='py-1'
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(input);
            }}>
            <div>
                <Textarea
                    placeholder={placeHolder}
                    autoFocus
                    onChange={(event) => {
                        setInput(event.target.value);
                    }}
                />
            </div>
            <div>
                <Button variant='default' type='submit' className='mt-1'>
                    Save
                </Button>
            </div>
        </form>
    );
};

export default CommentForm;
