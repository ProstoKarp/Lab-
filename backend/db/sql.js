"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlText = sqlText;
exports.sqlNumber = sqlNumber;
exports.sqlLimit = sqlLimit;
exports.sqlOrder = sqlOrder;
exports.pickSort = pickSort;
function sqlText(value) {
    if (value === null || value === undefined)
        return 'NULL';
    return `'${String(value).replace(/'/g, "''")}'`;
}
function sqlNumber(value, field = 'id') {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0)
        throw new Error(`${field} must be a positive integer`);
    return n;
}
function sqlLimit(value, fallback = 50) {
    if (value === undefined || value === null || value === '')
        return fallback;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 100)
        throw new Error('limit must be an integer from 1 to 100');
    return n;
}
function sqlOrder(value) {
    const v = String(value || 'DESC').toUpperCase();
    if (v !== 'ASC' && v !== 'DESC')
        throw new Error('order must be ASC or DESC');
    return v;
}
function pickSort(value, allowed, fallback = 'id') {
    const v = String(value || fallback);
    if (!allowed.includes(v))
        throw new Error(`sort must be one of: ${allowed.join(', ')}`);
    return v;
}
//# sourceMappingURL=sql.js.map