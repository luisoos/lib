'use client';

import React from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from '~/components/ui/sidebar';
import { NavMainItem } from '~/types/dashboard/sidebar';
import { RecursiveMenuItem } from '~/components/ui/recursiveMenuItem';
import FileUpload from '~/components/controls/FileUpload';
import Dropzone from '~/components/controls/Dropzone';
import getFileUrl from '~/hooks/files/getFileUrl';
import { usePathname } from 'next/navigation';
import { DynamicIcon, LucideIconName } from '~/hooks/icons';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import FileTreeContextMenu from '../controls/FileTreeContextMenu';
import { Skeleton2 } from '../ui/skeleton';

export function NavMain({
    items,
    isLoading,
}: {
    items: NavMainItem[];
    isLoading?: boolean;
}) {
    const pathname = usePathname();
    const isDashboard = pathname === '/dashboard';

    return (
        <SidebarGroup>
            <div className='flex'>
                <SidebarGroupLabel>Notes</SidebarGroupLabel>
                <FileUpload />
            </div>
            {!isLoading ? (
                <SidebarMenu>
                    {items.map((item) => {
                        item.isActive = pathname === getFileUrl(item.url);
                        return !item.url ? (
                            <Collapsible
                                key={item.title + item.items?.length}
                                asChild
                                defaultOpen={item.isActive}
                                className='group/collapsible'>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <FileTreeContextMenu item={item}>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                className='text-black'>
                                                {item.icon && (
                                                    <DynamicIcon
                                                        name={
                                                            item.icon as LucideIconName
                                                        }
                                                    />
                                                )}
                                                <span className='truncate'>
                                                    {item.title}
                                                </span>
                                                {item.items && (
                                                    <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                                )}
                                            </SidebarMenuButton>
                                        </FileTreeContextMenu>
                                    </CollapsibleTrigger>
                                    {item.items && (
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <RecursiveMenuItem
                                                        key={
                                                            subItem.url ??
                                                            subItem.title
                                                        }
                                                        item={subItem}
                                                        path={
                                                            item.url ??
                                                            item.title
                                                        }
                                                    />
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    )}
                                </SidebarMenuItem>
                            </Collapsible>
                        ) : (
                            <Link
                                href={getFileUrl(item.url, isDashboard)}
                                key={item.url}>
                                <FileTreeContextMenu item={item}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className='text-black'>
                                        {item.icon && (
                                            <DynamicIcon
                                                name={
                                                    item.icon as LucideIconName
                                                }
                                            />
                                        )}
                                        <span className='truncate'>
                                            {item.title}
                                        </span>
                                        {item.items && (
                                            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                        )}
                                    </SidebarMenuButton>
                                </FileTreeContextMenu>
                            </Link>
                        );
                    })}
                </SidebarMenu>
            ) : (
                <div className='animate-pulse pr-4'>
                    <Skeleton2 />
                    <Skeleton2 />
                    <Skeleton2 />
                    <Skeleton2 />
                </div>
            )}
        </SidebarGroup>
    );
}
