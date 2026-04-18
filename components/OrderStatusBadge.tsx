import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  fulfilled: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  canceled: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/30",
  refunded: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
