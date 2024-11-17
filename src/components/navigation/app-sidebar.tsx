'use client';

import * as React from 'react';

import { NavMain } from '~/components/navigation/nav-main';
import { NavUser } from '~/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '~/components/ui/sidebar';
import { NavMainItem, Project, User } from '~/types/dashboard/sidebar';
import { env } from '~/env';
import Dropzone from '../controls/Dropzone';
import FileTreeContextMenu from '~/components/controls/FileTreeContextMenu';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navMain?: NavMainItem[];
    projects: Project[];
    user: User;
}

export function AppSidebar({
    navMain,
    projects,
    user,
    ...props
}: AppSidebarProps) {
    return (
        <Sidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <p className='font-extrabold text-2xl px-2 pt-2'>
                    {env.NEXT_PUBLIC_PROJECT_NAME}
                </p>
            </SidebarHeader>
            <SidebarContent className='h-full'>
                {/* <FileTreeContextMenu id='' className='h-full'> */}
                {navMain ? (
                    <NavMain items={navMain} />
                ) : (
                    'Start by uploading a file or creating a file.'
                )}
                <Dropzone id={''} className='h-full max-h-96'>
                    <FileTreeContextMenu id={''}>
                        <div className='h-full w-full -translate-y-4'></div>
                    </FileTreeContextMenu>
                </Dropzone>
                {/* <NavProjects projects={projects} /> */}
                {/* </FileTreeContextMenu> */}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
