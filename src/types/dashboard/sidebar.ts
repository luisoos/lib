export type User = {
    name: string;
    email: string;
    avatar: string;
};

export type NavMainItem = {
    title: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    items?: NavMainItem[];
};

export type Project = {
    name: string;
    url: string;
    icon: string;
};

export type NavData = {
    user: User;
    navMain: NavMainItem;
    projects: Project;
};
