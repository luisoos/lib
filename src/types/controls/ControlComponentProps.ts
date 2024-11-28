import { NavMainItem } from '../dashboard/sidebar';

export default interface ControlComponentProps {
    item?: NavMainItem | null;
    className?: string;
    children?: React.ReactNode;
}
