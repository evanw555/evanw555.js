import fs from 'fs';
import { expect } from 'chai';
import { getTextBox } from '../../src/canvas/text';
import { fillBackground } from '../../src/canvas/util';
import { fail } from 'assert';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt et ante eget dictum. Pellentesque auctor magna purus, et tincidunt risus lobortis eu. Phasellus ut mi odio. Fusce tempor, justo in facilisis cursus, arcu augue tristique turpis, vel mollis libero nisl vel risus. Quisque lectus est, tincidunt non tempus nec, tristique at augue. Donec ut ex rhoncus, fermentum urna nec, consectetur turpis. Donec quis sagittis sem, vel ornare purus. Nulla sed nulla nisl. Sed vehicula sapien suscipit maximus hendrerit. Mauris ut erat quis leo ornare condimentum. Vivamus odio tellus, rutrum nec cursus quis, aliquet nec ligula. Nulla tincidunt cursus tellus, sed porttitor arcu malesuada sit amet. Integer non justo dapibus, suscipit quam eget, vulputate leo. In accumsan rhoncus eros, a euismod odio condimentum eget. Phasellus erat eros, eleifend sit amet quam ac, facilisis faucibus odio.';

describe('Canvas Text Util tests', () => {
    it('generates text boxes', () => {
        const textBox = fillBackground(getTextBox(lorem, 100, 32), { background: 'black' });
        fs.writeFile('/tmp/evanw555js_getTextBox.png', textBox.toBuffer(), (err) => {
            if (err) {
                return fail('Failed to write PNG data');
            }
            expect(fs.existsSync('/tmp/evanw555js_getTextBox.png')).is.true;
        });
    })
})
