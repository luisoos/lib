'use client';

import { NavMain } from '~/components/navigation/nav-main';
import { NavUser } from '~/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '~/components/ui/sidebar';
import { NavMainItem, User } from '~/types/dashboard/sidebar';
import { env } from '~/env';
import Dropzone from '../controls/Dropzone';
import FileTreeContextMenu from '~/components/controls/FileTreeContextMenu';
import { mapToNavItems } from '~/hooks/files/map';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkle } from 'lucide-react';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    const [navMain, setNavMain] = useState<NavMainItem[]>([]);

    const fetchFiles = async () => {
        const response = await fetch('/api/routes/files');
        if (!response.ok) {
            throw new Error('Could not fetch file structure');
        }
        return response.json();
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sidebar'],
        queryFn: fetchFiles,
        retry: false, // Optional: prevent automatic retries
        refetchInterval: 1000 * 30,
    });

    useEffect(() => {
        if (data) {
            setNavMain(mapToNavItems(data.data));
        }
    }, [data]);

    return (
        <Sidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <p className='font-extrabold text-2xl px-2 pt-2'>
                    {env.NEXT_PUBLIC_PROJECT_NAME}
                </p>
            </SidebarHeader>
            <SidebarContent className='h-full'>
                {/* {isError && <p>Error: {error.message}</p>} Show error message */}

                <SidebarMenuItem className='p-2'>
                    <SidebarMenuButton asChild>
                        <Link href='/dashboard/chat'>
                            {/* TODO: sparkle not visible*/}
                            <Sparkle className='w-4 h-4 text-purple-600' />
                            <span>Chat</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <NavMain items={navMain} isLoading={isLoading} />
                <Dropzone className='h-full max-h-96'>
                    <FileTreeContextMenu>
                        <div className='h-full w-full -translate-y-4'></div>
                    </FileTreeContextMenu>
                </Dropzone>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
