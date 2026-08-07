/**
 * Formats a timestamp into a standard date string
 * @param {string | Date} timestamp The time in epoch
 * @returns Standarized formated Date
 */
export function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
};