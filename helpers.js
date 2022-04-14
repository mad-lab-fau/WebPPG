/**
 * Get the "start" coordinates of an area of interest (AOI)
 * The AOI will be positioned in the middle of the image
 * 
 * @param {*} fullSize Full width/height of the image in pixels (e.g. 100)
 * @param {*} windowSize Size of the window to be extracted (e.g. 10)
 * @returns Start coordinate of the AOI (e.g. 45)
 */
export function getCenterAreaStartCoordinate(fullSize, windowSize) {
    return Math.round(fullSize/2 - windowSize/2)
}

/**
 * Average all values of an array
 */

 export const averageArray = arr => arr.reduce((a,b) => a + b, 0) / arr.length

/**
 * Normalize a given array between 0 and maxValue
 * Note that this is not a classical normalization, but instead, we pick the min as 0
 * 
 * @param {*} array Array with numbers to be normalized
 * @param {*} maxValue The maximum value that the output array should have (e.g. 1 or 255)
 */
 export function bandNormalizeArray(array, maxValue) {

    // Subtract the minimum values first to bring to 0
    // Not rest parameter
    let min = Math.min(...array);

    array = array.map(function(el){
        return el-min;
    });

    // Divide through the largest value to normalize to 1, then multiply by maxValue
    let max = Math.max(...array);

    array = array.map(function(el){
        return (el/max)*maxValue;
    });

    return array;
}

/**
 * Inverse values of provided array
 * i.e. in an array with values ranging from 0 to 255, 
 * calling this method with parameters (array, 255) will result in 
 * the value "20" being inversed to "235"
 * 
 * @param {*} array 
 * @param {*} maxValue 
 * @returns 
 */
 export function inverseArray(array, maxValue) {
    array = array.map(function(el){
        return (maxValue-el);
    });

    return array;
}