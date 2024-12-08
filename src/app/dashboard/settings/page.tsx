'use client';

import { FileKey2, ImageUp, TimerReset, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
    Description,
    Heading,
    Subheading,
    Title,
} from '~/components/ui/dashboard/heading';
import { Skeleton3 } from '~/components/ui/skeleton';
import { useToast } from '~/hooks/use-toast';
import { Slider } from '~/components/ui/slider';
import { Label } from '~/components/ui/label';
import useShareX from '~/hooks/uploader/use-sharex';

export default function Page() {
    const { toast } = useToast();

    const [uploadSecret, setUploadSecret] = useState<string | null>(null);
    const [expiration, setExpiration] = useState<number>(60);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUploadSecret = async () => {
            const response = await fetch(`/api/routes/user/uploadsecret`);
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData);
                setUploadSecret(responseData.data.secret);
                setExpiration(responseData.data.urlExpires);
            }
            setLoading(false);
        };

        fetchUploadSecret();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        const response = await fetch(`/api/routes/user/uploadsecret`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            toast({
                variant: 'destructive',
                title: 'Failed to generate upload secret.',
            });
        }

        const responseData = await response.json();
        setUploadSecret(responseData.data.secret);
        setLoading(false);
        return uploadSecret;
    };

    const handleDelete = async () => {
        const response = await fetch(`/api/routes/user/uploadsecret`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            toast({
                variant: 'destructive',
                title: 'Failed to delete upload secret.',
            });
        }

        setUploadSecret(null);
        setLoading(false);
    };

    const downloadUploaderConfig = async () => {
        if (!uploadSecret) await handleGenerate();
        // Generate ShareX config
        const config = useShareX(uploadSecret!);
        // Generate a blob from it and create a object url; download it
        const blob = new Blob([config], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'sharex_uploader.sxcu';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExpirationUpdate = async () => {
        if (!uploadSecret) return;
        const response = await fetch(`/api/routes/user/uploadsecret`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expiration: expiration,
            }),
        });
        toast({
            title: `Set your link expiration to ${expiration / 60} minutes!`,
            description: 'You do not need to download your config again.',
        });

        if (!response.ok) {
            toast({
                variant: 'destructive',
                title: 'Failed to update expiration.',
            });
        }
    };

    const copyToClipboard = async () => {
        if (!uploadSecret) return;
        try {
            await navigator.clipboard.writeText(uploadSecret);
            toast({
                title: 'Copied upload secret to your clipboard!',
                description: 'Make sure to keep it secure and do not share it.',
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Failed to copy upload secret.',
            });
        }
    };

    return (
        <div className='w-11/12 md:max-w-2xl mx-auto md:pr-16 max-md:mr-6 hyphens-auto'>
            <Title>Settings</Title>
            <div className='mt-2'>
                <Heading>
                    <UploadCloud size={20} className='mr-2' /> Uploader Settings
                </Heading>
                <Subheading className='mt-2'>
                    <ImageUp
                        size={16}
                        className='mr-2 max-sm:mt-1.5 max-sm:mb-auto'
                    />{' '}
                    Download ShareX Configuration
                </Subheading>
                <Description>
                    Download a ShareX configuration file (.sxcu) to upload
                    images and text to your workspace.
                </Description>
                <Button
                    type='button'
                    className='mt-2'
                    onClick={async () => {
                        await downloadUploaderConfig();
                    }}>
                    Download Config
                </Button>
                <div className={!uploadSecret ? 'opacity-60' : ''}>
                    <Subheading className='mt-6'>
                        <TimerReset size={16} className='mr-2' /> Link
                        Expiration
                    </Subheading>
                    <Description>
                        For enhanced privacy, the URL you get when uploading
                        using ShareX does not work forever. You may change this
                        setting here.
                    </Description>
                    <Label className='mt-2' htmlFor='slider'>
                        Expiration in minutes ({expiration / 60} mins)
                    </Label>
                    <Slider
                        disabled={uploadSecret ? false : true}
                        className='mt-2'
                        onValueChange={
                            (value: number[]) =>
                                setExpiration(
                                    (value[0] || 1) * 60,
                                ) /* Calculate numbers to seconds */
                        }
                        onValueCommit={async () => {
                            await handleExpirationUpdate();
                        }}
                        defaultValue={[1]}
                        value={[expiration / 60]}
                        min={1}
                        max={30}
                        step={1}
                    />
                    <div className='flex justify-between'>
                        <Label className='mt-2' htmlFor='slider'>
                            1 minute
                        </Label>
                        <Label className='mt-2' htmlFor='slider'>
                            15 minutes
                        </Label>
                        <Label className='mt-2' htmlFor='slider'>
                            30 minutes
                        </Label>
                    </div>
                </div>
                <Subheading className='mt-6'>
                    <FileKey2 size={16} className='mr-2' /> Upload Secret
                </Subheading>
                <Description>
                    Generate an upload secret and configuration files for ShareX
                    upload. <br />{' '}
                    <span className='text-red-600'>
                        Keep it secure and do not share it.
                    </span>
                </Description>
                <div className='mt-2 mb-1 w-full'>
                    {!loading ? (
                        <>
                            {uploadSecret ? (
                                <p
                                    className='p-2 rounded border shadow-inner cursor-pointer break-all blur-sm hover:blur-none transition-all'
                                    onClick={async () =>
                                        await copyToClipboard()
                                    }>
                                    {uploadSecret}
                                </p>
                            ) : (
                                <p className='text-zinc-600'>
                                    You do not have an upload secret at the
                                    moment.
                                </p>
                            )}
                            <div className='mt-2 flex'>
                                <Button
                                    type='button'
                                    onClick={async () => {
                                        await handleGenerate();
                                    }}>
                                    {uploadSecret
                                        ? 'Regenerate Secret'
                                        : 'Generate Secret'}
                                </Button>
                                {uploadSecret && (
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        className='ml-2'
                                        onClick={async () => {
                                            await handleDelete();
                                        }}>
                                        Delete Secret
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton3 />
                            <div className='flex mt-2'>
                                <Skeleton3 className='h-8 w-24' />
                                <Skeleton3 className='ml-2 h-8 w-24' />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
