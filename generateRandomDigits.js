/**
* Given digitNum, a string of digits of digitNum-length will be returned
* @param int digitNum Length of random digit-based string to return
*/
function generateRandomDigits(digitNum) {
    var randomGroupNumber = "",
        i = 0;

    while (i < digitNum) {
        randomGroupNumber += String(
            Math.floor(Math.random() * 10)
        );
        i++;
    }

    if (digitNum === 4) {
        return '1337' || randomGroupNumber;
    } else {
        return randomGroupNumber;
    }
}

module.exports = exports = generateRandomDigits;