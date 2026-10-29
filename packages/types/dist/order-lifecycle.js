"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KOT_NEXT_STATUS = exports.KOT_STARTED_STATUSES = exports.KOT_VOID_STATUSES = exports.KOT_TERMINAL_STATUSES = exports.KOT_TRANSITIONS = void 0;
exports.canTransitionKot = canTransitionKot;
exports.kitchenProgress = kitchenProgress;
exports.KOT_TRANSITIONS = {
    NEW: ["ACCEPTED", "REJECTED", "CANCELLED"],
    ACCEPTED: ["PREPARING", "REJECTED", "CANCELLED"],
    // Declining food that is already on the stove is allowed but gated: see
    // KOT_STARTED_STATUSES and the confirmStarted flag.
    PREPARING: ["READY", "REJECTED", "CANCELLED"],
    READY: ["SERVED", "CANCELLED"],
    SERVED: [],
    CANCELLED: [],
    REJECTED: [],
};
/** Tickets the kitchen no longer works on. */
exports.KOT_TERMINAL_STATUSES = ["SERVED", "CANCELLED", "REJECTED"];
/** Tickets withdrawn without being served. */
exports.KOT_VOID_STATUSES = ["CANCELLED", "REJECTED"];
/** Statuses meaning the kitchen has begun (or finished) cooking. */
exports.KOT_STARTED_STATUSES = ["PREPARING", "READY", "SERVED"];
function canTransitionKot(from, to) {
    return exports.KOT_TRANSITIONS[from].includes(to);
}
/** The next normal step on the board, if there is one. */
exports.KOT_NEXT_STATUS = {
    NEW: "ACCEPTED",
    ACCEPTED: "PREPARING",
    PREPARING: "READY",
    READY: "SERVED",
};
const PROGRESS_RANK = {
    NEW: 0,
    ACCEPTED: 1,
    PREPARING: 2,
    READY: 3,
    SERVED: 4,
};
/**
 * One kitchen status for a whole order: the least advanced live ticket, since
 * the order is only as far along as its slowest round. Withdrawn tickets are
 * ignored; null when no ticket is left (nothing sent, or all withdrawn).
 */
function kitchenProgress(statuses) {
    const live = statuses.filter((s) => PROGRESS_RANK[s] !== undefined);
    if (live.length === 0)
        return null;
    return live.reduce((slowest, s) => (PROGRESS_RANK[s] < PROGRESS_RANK[slowest] ? s : slowest));
}
