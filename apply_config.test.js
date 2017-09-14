import _ from 'ramda'
import test from 'ava'
import {filterLen, strip, applyConfig} from './apply_config'

const words = [
  'spacejump',
  'apples',
  'graphics',
  'javascript',
  'peaches'
];

test('length: number', t => {
  const words = ['apples', '1', '12', '12345', '1234567']
  const actual = filterLen({length: 6}, words)
  const expected = ['apples']
  t.deepEqual(actual, expected, 'expected `apples`');
});
test('length: range 5,6', t => {
  const actual = filterLen({length: [5,6]}, words)
  const expected = ['apples']
  t.deepEqual(actual, expected, 'expected `apples`');
});
test('length: range 6,7', t => {
  const actual = filterLen({length: [6,7]}, words)
  const expected = ['apples', 'peaches']
  t.deepEqual(actual, expected, 'expected apples and peaches');
});

test('strip vowels', t => {
  const actual = strip({strip: 'vowels'}, ['apples', 'peaches'])
  const expected = ['ppls', 'pchs']
  t.deepEqual(actual, expected, 'expected vowels removed');
})

test('strip consonants', t => {
  const actual = strip({strip: 'consonants'}, ['apples', 'peaches'])
  const expected = ['ae', 'eae']
  t.deepEqual(actual, expected, 'expected vowels removed');
})


test.skip('applyConfig: length: 6,7; upper first, strip vowels', t => {
  const config = {
    length: [6,7],
    'upper_case': 'first',
    strip: 'vowels'
  }
  const actual = applyConfig(config, words)
  const expected = ['ppls', 'Pchs']
  t.deepEqual(actual, expected, 'expected apples and peaches');

})

test('object order', t => {
  const obj = {
    upper: 1,
    length: 2,
    strip: 3
  }
  t.deepEqual(Object.keys(obj), ['upper', 'length', 'strip'])
  const obj2 = {
    length: 2,
    upper: 1,
    strip: 3
  }
  t.deepEqual(Object.keys(obj2), ['length', 'upper', 'strip'])
})