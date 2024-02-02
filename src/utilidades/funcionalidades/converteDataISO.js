import moment from "moment";

moment().format();

/**
 * Converte a data para o padrão ISO/UTC
 * @param {Date} dataString
 * @returns
 */
export function converteDataISO(dataString) {
    return moment.utc(dataString).toDate();
   }