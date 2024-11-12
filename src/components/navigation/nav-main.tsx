'use client';

import * as Lucide from 'lucide-react';
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
import { DynamicIcon, LucideIconName } from '~/hooks/icons';
import FileUpload from '~/components/FileUpload';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: string;
        isActive?: boolean;
        items?: NavMainItem[];
    }[];
}) {
    return (
        <SidebarGroup>
            <div className='flex'>
                <SidebarGroupLabel>Notebooks</SidebarGroupLabel>
                <FileUpload />
            </div>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className='group/collapsible'>
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && (
                                        <DynamicIcon
                                            name={item.icon as LucideIconName}
                                        />
                                    )}
                                    <span className='truncate'>
                                        {item.title}
                                    </span>
                                    {item.items && (
                                        <Lucide.ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                    )}
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map((subItem) => (
                                        <RecursiveMenuItem
                                            key={subItem.title}
                                            item={subItem}
                                        />
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
