import { useOutletContext } from "react-router-dom";

interface OutletContextType {
  headerSlot: boolean;
}

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const { headerSlot } = useOutletContext<OutletContextType>();

  return headerSlot ? (
    <span className="font-medium">{title}</span>
  ) : null;
}
