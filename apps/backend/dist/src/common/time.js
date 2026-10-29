"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zonedDayStart = zonedDayStart;
exports.addDaysToDate = addDaysToDate;
exports.zonedRange = zonedRange;
exports.localDate = localDate;
exports.localMinuteAndDay = localMinuteAndDay;
function offsetMs(utcMs, tz) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }).formatToParts(new Date(utcMs));
    const get = (t) => Number(parts.find((p) => p.type === t)?.value);
    const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return asUtc - Math.floor(utcMs / 1000) * 1000;
}
function zonedDayStart(date, tz) {
    const wall = Date.parse(`${date}T00:00:00Z`);
    const first = wall - offsetMs(wall, tz);
    return new Date(wall - offsetMs(first, tz));
}
function addDaysToDate(date, days) {
    return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000)
        .toISOString()
        .slice(0, 10);
}
function zonedRange(from, to, tz) {
    return {
        gte: zonedDayStart(from, tz),
        lt: zonedDayStart(addDaysToDate(to, 1), tz),
    };
}
function localDate(instant, tz) {
    const p = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(instant);
    return p;
}
function localMinuteAndDay(instant, tz) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
    }).formatToParts(instant);
    const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
        minute: Number(get('hour')) * 60 + Number(get('minute')),
        day: days.indexOf(get('weekday')),
    };
}
//# sourceMappingURL=time.js.map