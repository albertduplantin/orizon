import { Badge } from "@/components/ui/badge";
import {
  CLEARANCE_LABELS,
  CLEARANCE_NAMES,
  getClearanceBadgeClass,
  type ClearanceLevel
} from "@/lib/clearance";

interface ClearanceBadgeProps {
  level: ClearanceLevel;
  showName?: boolean;
}

export function ClearanceBadge({ level, showName = false }: ClearanceBadgeProps) {
  return (
    <Badge className={getClearanceBadgeClass(level)}>
      {showName ? CLEARANCE_NAMES[level] : CLEARANCE_LABELS[level]}
    </Badge>
  );
}
