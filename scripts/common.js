// Вспомогательные функции

/**
 * Возвращает рандомное целое число в интервале min-max.
 * @param {Number} min - Минимальное число интервала
 * @param {Number} max - Максимальное число интервала
 * @returns {Number}
 */
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};