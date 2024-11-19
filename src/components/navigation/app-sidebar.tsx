'use client';

import { NavMain } from '~/components/navigation/nav-main';
import { NavUser } from '~/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '~/components/ui/sidebar';
import { NavMainItem, User } from '~/types/dashboard/sidebar';
import { env } from '~/env';
import Dropzone from '../controls/Dropzone';
import FileTreeContextMenu from '~/components/controls/FileTreeContextMenu';
import { mapToNavItems } from '~/hooks/files/map';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    const [navMain, setNavMain] = useState<NavMainItem[]>([]);

    const fetchFiles = async () => {
        const response = await fetch('/api/routes/files');
        console.log('fetching sidebar data');
        if (!response.ok) {
            throw new Error('Could not fetch file structure');
        }
        return response.json();
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sidebar'],
        queryFn: fetchFiles,
        retry: false, // Optional: prevent automatic retries
    });

    useEffect(() => {
        if (data) {
            setNavMain(mapToNavItems(data));
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
                <NavMain items={navMain} isLoading={isLoading} />
                <Dropzone id={''} className='h-full max-h-96'>
                    <FileTreeContextMenu id={''}>
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
