import { NavMainItem } from '../dashboard/sidebar';

export default interface ControlComponentProps {
    item?: NavMainItem;
    className?: string;
    children?: React.ReactNode;
}
