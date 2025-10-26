import * as Lucide from 'lucide-react';
import * as SimpleIcons from 'simple-icons';
import { LucideIcon } from 'lucide-react';
import type { SimpleIcon } from 'simple-icons';
import { ucfirst } from '~/lib/utils';

export type LucideIconName = keyof typeof Lucide;

interface DynamicIconProps {
    name: string;
    [key: string]: any;
}

const getIcon = (iconName: LucideIconName): LucideIcon | undefined => {
    return Lucide[iconName] as LucideIcon | undefined;
};

const getBackupIcon = (iconName: string): SimpleIcon | undefined => {
    return SimpleIcons[
        `si${ucfirst(iconName)}` as keyof typeof SimpleIcons
    ] as SimpleIcon;
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
    const LucideIconComponent = getIcon(name as LucideIconName);
    if (LucideIconComponent) {
        return <LucideIconComponent {...props} />;
    }

    const simpleIcon = getBackupIcon(name);
    if (simpleIcon) {
        return (
            <svg {...props} viewBox='0 0 24 24' fill='currentColor'>
                <path d={simpleIcon.path} />
            </svg>
        );
    }

    return null;
};
