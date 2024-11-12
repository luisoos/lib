import { NavMainItem } from '~/types/dashboard/sidebar';
import {
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuSub,
} from './sidebar';
import * as Lucide from 'lucide-react';
import { DynamicIcon } from '~/hooks/icons';

const RecursiveMenuItem: React.FC<{ item: NavMainItem }> = ({ item }) => {
    return (
        <SidebarMenuSubItem key={item.title}>
            <SidebarMenuSubButton asChild id={item.url ?? item.title}>
                <a href={item.url}>
                    <DynamicIcon name={item.icon ?? 'File'} />
                    <span>{item.title}</span>
                </a>
            </SidebarMenuSubButton>
            {item.items && item.items.length > 0 && (
                <SidebarMenuSub>
                    {item.items.map((subItem) => (
                        <RecursiveMenuItem key={subItem.title} item={subItem} />
                    ))}
                </SidebarMenuSub>
            )}
        </SidebarMenuSubItem>
    );
};

export { RecursiveMenuItem };
