import type { KotStatusDto } from "./orders";
export declare const KOT_TRANSITIONS: Record<KotStatusDto, readonly KotStatusDto[]>;
/** Tickets the kitchen no longer works on. */
export declare const KOT_TERMINAL_STATUSES: readonly KotStatusDto[];
/** Tickets withdrawn without being served. */
export declare const KOT_VOID_STATUSES: readonly KotStatusDto[];
/** Statuses meaning the kitchen has begun (or finished) cooking. */
export declare const KOT_STARTED_STATUSES: readonly KotStatusDto[];
export declare function canTransitionKot(from: KotStatusDto, to: KotStatusDto): boolean;
/** The next normal step on the board, if there is one. */
export declare const KOT_NEXT_STATUS: Partial<Record<KotStatusDto, KotStatusDto>>;
/**
 * One kitchen status for a whole order: the least advanced live ticket, since
 * the order is only as far along as its slowest round. Withdrawn tickets are
 * ignored; null when no ticket is left (nothing sent, or all withdrawn).
 */
export declare function kitchenProgress(statuses: readonly KotStatusDto[]): KotStatusDto | null;
