import { Badge, type BadgeProps } from "@/components/ui";
import type { OrderStatus } from "@/lib/types";

const STATUS_VARIANT: Record<OrderStatus, BadgeProps["variant"]> = {
  pending: "warning",
  paid: "success",
  fulfilled: "info",
  canceled: "muted",
  refunded: "rose",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}
