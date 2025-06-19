import bcrypt from 'bcrypt';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
    return bcrypt.hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(password: string | undefined, hash: string | undefined | null): Promise<boolean> {
    if (!password || !hash) {
        return Promise.resolve(false);
    }

    return bcrypt.compare(password, hash);
}

/**
 * Extracts the variable or property name from a lambda function.
 *
 * @template TResult The return type of the lambda function.
 * @param getVar A lambda function that returns the variable or property whose name is to be extracted.
 * @returns The name of the variable or property as a string, or `undefined` if it cannot be determined.
 * @throws {Error} If the function does not contain a statement matching 'return variableName;'.
 *
 * @example
 * ```typescript
 * const myVar = 42;
 * const name = getVariableName(() => myVar); // "myVar"
 * ```
 */
export function getVariableName<TResult>(getVar: () => TResult): string | undefined {
    const m = /\(\)=>(.*)/.exec(getVar.toString().replaceAll(/(\r\n|\n|\r|\s)/gm, ''));

    if (!m) {
        throw new Error("The function does not contain a statement matching 'return variableName;'");
    }

    const fullMemberName = m[1]!;

    const memberParts = fullMemberName.split('.');

    return memberParts.at(-1);
}
