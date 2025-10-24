'use client';

import React, { useState } from 'react';

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
import { ChevronRight, Sparkle } from 'lucide-react';
import Link from 'next/link';
import FileTreeContextMenu from '../controls/FileTreeContextMenu';
import { Skeleton2 } from '../ui/skeleton';
import removeExtension from '~/hooks/files/removeExtension';

export function NavMain({
    items,
    isLoading,
}: {
    items: NavMainItem[];
    isLoading?: boolean;
}) {
    const pathname = usePathname();
    const isDashboard = pathname === '/dashboard';

    const [openStates, setOpenStates] = useState<Record<string, boolean>>(() =>
        items.reduce(
            (acc, item) => {
                acc[item.id ?? item.title] = pathname === getFileUrl(item.url);
                return acc;
            },
            {} as Record<string, boolean>,
        ),
    );

    return (
        <SidebarGroup>
            <div className='flex'>
                <SidebarGroupLabel>Notes</SidebarGroupLabel>
                <FileUpload />
            </div>
            {!isLoading ? (
                <SidebarMenu>
                    {items.map((item) => {
                        const itemId = item.id ?? item.title;
                        item.isActive = pathname === getFileUrl(item.url);
                        const open = openStates[itemId] ?? item.isActive;
                        return !item.url ? (
                            <Collapsible
                                key={item.title + item.items?.length}
                                asChild
                                open={open}
                                onClick={() =>
                                    setOpenStates((prev) => ({
                                        ...prev,
                                        [itemId]: !prev[itemId],
                                    }))
                                }
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
                                                    {removeExtension(
                                                        item.title,
                                                    )}
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
                            <div key={item.url}>
                                <FileTreeContextMenu item={item}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        asChild>
                                        <Link
                                            href={getFileUrl(
                                                item.url,
                                                isDashboard,
                                            )}
                                            className='text-black'>
                                            {item.icon && (
                                                <DynamicIcon
                                                    name={
                                                        item.icon as LucideIconName
                                                    }
                                                />
                                            )}
                                            <span className='truncate'>
                                                {removeExtension(item.title)}
                                            </span>
                                            {item.items && (
                                                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </FileTreeContextMenu>
                            </div>
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
