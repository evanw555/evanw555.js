import { expect } from 'chai';
import { LanguageGenerator } from '../src/language-generator';

describe('Language Generator Tests', () => {
    it('can generate language', () => {
        const generator = new LanguageGenerator({ 'words': ['cat'], 'phrases': ['a lovely {words?}']});
        const variables: Record<string, any> = { entries: [{ x: 1, y: 2 }, { x: 10, y: 20 }], valid: true, list: ['a', 'b', 'c'] };
        generator.setLogger((m) => console.log(m));

        expect(generator.generate('constant')).equals('constant');
        expect(generator.generate('{phrases?}')).equals('a lovely cat');
        expect(generator.generate('The number is {$entries.0.y}!', variables)).equals('The number is 2!');
        expect(generator.generate('{$valid} or false', variables)).equals('true or false');
        expect(generator.generate('my list {$list}, middle is {$list.1}', variables)).equals('my list ["a","b","c"], middle is b');
    });
});
