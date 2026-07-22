import { expect } from 'chai';
import { LanguageGeneratorV2 } from '../src/language-generator-v2';

describe('Language Generator V2 Tests', () => {
    const generator = new LanguageGeneratorV2({ nouns: ['dog', 'cat', 'wolf', 'duck', 'spider'], battle: '{nouns?} vs {nouns?}', a: { b: { c: ['good', 'bad'] } } });

    it('can generate text', () => {
        const s1 = generator.generate2('Hello, {nouns?2-4} ALSO {nouns?}');
        console.log(s1);

        console.log(generator.generate2('Battle one: {battle} - Battle two: {battle}'));

        console.log(generator.generate2('Hello, {$invited?{$names} were invited|{$names} have {!waltzed in|joined us|come through}}', { invited: 'true', names: 'Mario and Luigi' }));
        console.log(generator.generate2('Hello, {$invited?{$names} were invited|{$names} have {!waltzed in|joined us|come through}}', { invited: '', names: 'Mario and Luigi' }));
        console.log(generator.generate2('Hello, {$invited?{$names} were invited|{$names} have {!waltzed in|joined us|come through}}', { invited: '', names: 'Mario and Luigi' }));
        console.log(generator.generate2('Hello, {${!invited|invited}?{$names} were invited|{$names} have {!waltzed in|joined us|come through}}', { invited: '', names: 'Mario and Luigi' }));

        console.log(generator.generate2('Hello, {$invited?{$names} \\{were\\} invited|{$names} \\{have\\} {a.b.c?} {nouns?2} {!waltze\\|in|joined\\|us|come\\|through}}', { invited: '', names: 'Mario and Luigi' }));

        console.log(generator.generate2('Expect full, {$invited?full|}', { invited: 'true' }));
        console.log(generator.generate2('Expect empty, {$invited?full|}', { invited: '' }));
        console.log(generator.generate2('Expect nothing first, {$invited?|}', { invited: 'true' }));
        console.log(generator.generate2('Expect nothing second, {$invited?|}', { invited: '' }));

        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));
        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));
        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));
        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));
        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));
        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));
        console.log(generator.generate2('Ok {!a {!the apple|ahhhh}|b {!banana|barnacle}|c {!cat|car|caramel}|d {!dog|dolphin|domingo}} End', { invited: '' }));

        const generator2 = new LanguageGeneratorV2({ 'words': ['cat'], 'phrases': ['a lovely {words?}', 'a lovely {words?}']});
        // generator.setLogger((message: string) => console.log(message));
        const variables: Record<string, any> = {
            entries: [{ x: 1, y: 2 }, { x: 10, y: 20 }],
            valid: true,
            empty: '',
            list: ['a', 'b', 'c'],
            object: { 'one': { 'two': { 'three': 123 }}},
            date: '2012-12-1'
        };
        generator2.setLogger((m) => console.log(m));

        // Basic cases
        expect(generator2.generate2('constant')).equals('constant');

        // Test language references
        expect(generator2.generate2('{phrases?}')).equals('a lovely cat', 'Language reference with random selection');
        expect(generator2.generate2('{phrases?2}')).equals('a lovely cat and a lovely cat', 'Language reference with multiple random selections');
        // TODO: Figure out a way to test this
        // expect(generator2.generate2('{phrases?1-2}')).equals('a lovely cat and a lovely cat', 'Language reference with a range of random selections');

        // Test variable injections
        expect(generator2.generate2('{$valid} or false', variables)).equals('true or false', 'Basic variable injection');
        expect(generator2.generate2('easy as {$object.one.two.three}!', variables)).equals('easy as 123!', 'Complex variable injection');
        expect(generator2.generate2('The number is {$entries.0.y}!', variables)).equals('The number is 2!', 'Complex variable injection with list indices');
        expect(generator2.generate2('my list {$list}, middle is {$list.1}', variables)).equals('my list ["a","b","c"], middle is b', 'Variable injection with stringified lists');
        expect(generator2.generate2('the object is {$entries.1}...', variables)).equals('the object is {"x":10,"y":20}...', 'Variable injection with stringified objects');
        expect(generator2.generate2('{$nonexistent??entries.2??entries.1.y??nonexistent}', variables)).equals('20', 'Can use fallback variable selection');

        // Test ternary operators
        expect(generator2.generate2('{$valid?present|missing}', variables)).equals('present', 'Basic ternary operator using truthy variable');
        expect(generator2.generate2('{$empty?present|missing}', variables)).equals('missing', 'Basic ternary operator using falsy variable');
        expect(generator2.generate2('{$undefined?present|missing}', variables)).equals('missing', 'Basic ternary operator using undefined variable');
        expect(generator2.generate2('{$undefined??valid?present|missing}', variables)).equals('present', 'Ternary operator using truthy fallback variable');
        expect(generator2.generate2('{$undefined??nope??nah?present|missing}', variables)).equals('missing', 'Ternary operator using undefined fallback variables');
        expect(generator2.generate2('{${!valid|list}?present|missing}', variables)).equals('present', 'Ternary operator referencing two random truthy variables');
        expect(generator2.generate2('{${!empty|undefined}?present|missing}', variables)).equals('missing', 'Ternary operator referencing two random falsy variables');

        // Check random literal weighted distributions
        const counts: Record<string, number> = {};
        for (let i = 0; i < 1000; i++) {
            const result = generator2.generate2('{!!!one|two|three}');
            counts[result] = (counts[result] ?? 0) + 1;
        }
        console.log(JSON.stringify(counts));
        expect(counts['one'] ?? 0).greaterThan(counts['two'] ?? 0).greaterThan(counts['three'] ?? 0);

        // Test functions
        // YEAR
        expect(generator2.generate2('{#YEAR#2020-12-25}')).equals('2020', 'Use year function with hyphen-delimited date string');
        expect(generator2.generate2('{#YEAR#5/5/2021}')).equals('2021', 'Use year function with slash-delimited date string');
        expect(generator2.generate2('{#YEAR#2016}')).equals('2016', 'Use year function with as-is year');
        expect(generator2.generate2('{#YEAR#{$date}}', variables)).equals('2012', 'Use year function with injected year variable');
        expect(generator2.generate2('{#YEAR#100019160000{!0|5|9}}', variables)).equals('2001', 'Use year function with timestamp (with injected randomness)');
        // UPPER, LOWER, CAPITALIZE
        expect(generator2.generate2('{#UPPER#{$valid} or false}', variables)).equals('TRUE OR FALSE', 'Use upper function');
        expect(generator2.generate2('{#LOWER#{$valid} OR FALSE}', variables)).equals('true or false', 'Use lower function');
        expect(generator2.generate2('{#CAPITALIZE#{$valid} or {#CAPITALIZE#false}}', variables)).equals('True or False', 'Use capitalize function');
    });
});
