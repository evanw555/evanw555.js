import { expect } from 'chai';
import { FileStorage } from '../src/file-storage';

describe('File Storage Tests', () => {

    // TODO: Write BLOB tests
    // TODO: Write JSON sync tests

    it('can read and write from a file', async () => {
        const storage = new FileStorage('/tmp/evanw555.js');

        await storage.write('a.txt', 'Hello');
        expect(await storage.read('a.txt')).equals('Hello');

        await storage.write('a.txt', 'World');
        expect(await storage.read('a.txt')).equals('World');

        await storage.write('b.txt', 'Third');
        expect(await storage.read('a.txt')).equals('World');
        expect(await storage.read('b.txt')).equals('Third');

        expect(storage.exists('a.txt')).true;
        expect(storage.exists('b.txt')).true;
        expect(storage.exists('c.txt')).false;
    });

    it('can read and write JSON from a file', async () => {
        const storage = new FileStorage('/tmp/evanw555.js');

        await storage.write('a.json', JSON.stringify({ prop: 123 }));
        expect(JSON.stringify(await storage.readJson('a.json'))).equals('{"prop":123}');

        await storage.write('a.json', JSON.stringify({ another: 456 }));
        expect(JSON.stringify(await storage.readJson('a.json'))).equals('{"another":456}');

        await storage.write('b.json', JSON.stringify({ last: 789 }));
        expect(JSON.stringify(await storage.readJson('a.json'))).equals('{"another":456}');
        expect(JSON.stringify(await storage.readJson('b.json'))).equals('{"last":789}');

        expect(storage.exists('a.json')).true;
        expect(storage.exists('b.json')).true;
        expect(storage.exists('c.json')).false;
    });

    it('can handle weird path scenarios', async () => {
        const s1 = new FileStorage('/tmp/evanw555.js/');
        await s1.write('a.txt', 'No slash');
        expect(await s1.read('a.txt')).equals('No slash');
        await s1.write('/a.txt', 'One slash');
        expect(await s1.read('a.txt')).equals('One slash');
        expect(await s1.read('/a.txt')).equals('One slash');
        await s1.write('//a.txt', 'Two slashes');
        expect(await s1.read('a.txt')).equals('Two slashes');
        expect(await s1.read('/a.txt')).equals('Two slashes');
        expect(await s1.read('//a.txt')).equals('Two slashes');

        expect(s1.exists('a.txt')).true;
        expect(s1.exists('/a.txt')).true;
        expect(s1.exists('//a.txt')).true;

        const s2 = new FileStorage('/tmp/evanw555.js//');
        await s2.write('a.txt', '0 s');
        expect(await s2.read('a.txt')).equals('0 s');
        await s2.write('/a.txt', '1 s');
        expect(await s2.read('a.txt')).equals('1 s');
        expect(await s2.read('/a.txt')).equals('1 s');
        await s2.write('//a.txt', '2 s');
        expect(await s2.read('a.txt')).equals('2 s');
        expect(await s2.read('/a.txt')).equals('2 s');
        expect(await s2.read('//a.txt')).equals('2 s');

        expect(s2.exists('a.txt')).true;
        expect(s2.exists('/a.txt')).true;
        expect(s2.exists('//a.txt')).true;
    });
});
