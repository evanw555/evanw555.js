import { expect } from 'chai';
import { R9KTextBank } from '../src/r9k';

describe('R9KTextBank Tests', () => {
    const r9k: R9KTextBank = new R9KTextBank();
    r9k.add('Hello, world!');
    
    it('can detect that the exact string is there', () => {
        expect(r9k.contains('Hello, world!')).true
    });

    it('can detect a lower-case form of the string', () => {
        expect(r9k.contains('hello, world!')).true
    });

    it('can detect a the text without whitespace or puncuation', () => {
        expect(r9k.contains('Helloworld')).true
    });

    it('can handle repeated characters', () => {
        expect(r9k.contains('heloworld')).true
    });

    it('doesn\'t give false positives', () => {
        expect(r9k.contains('Bye, world!')).false
        expect(r9k.contains('World, hello!')).false
    });

    it('can serialize and deserialize correctly', () => {
        const secondBank: R9KTextBank = new R9KTextBank();
        expect(secondBank.contains('helloworld')).false;
        expect(secondBank.contains('stupid world')).false;

        secondBank.addRawHashes(r9k.getAllEntries());
        expect(secondBank.contains('helloworld')).true;
        expect(secondBank.contains('stupid world')).false;
    });
});
