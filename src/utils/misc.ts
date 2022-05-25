export function sleep(milliseconds: number): Promise<void> {
    return new Promise(r => setTimeout(r, milliseconds));
}

/**
 * @param input List of strings
 * @returns The given list of strings joined in a way that is grammatically correct in English
 */
 export function naturalJoin(input: string[], conjunction: string = 'and'): string {
    if (!input || input.length === 0) {
        return '';
    }
    if (input.length === 1) {
        return input[0];
    }
    if (input.length === 2) {
        return `${input[0]} ${conjunction} ${input[1]}`;
    }
    let result = '';
    for (let i = 0; i < input.length; i++) {
        if (i !== 0) {
            result += ', ';
        }
        if (i === input.length - 1) {
            result += `${conjunction} `;
        }
        result += input[i];
    }
    return result;
}
