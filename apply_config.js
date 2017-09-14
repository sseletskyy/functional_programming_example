import _ from 'ramda'
import test from 'ava'

const words = [
  'spacejump',
  'apples',
  'graphics',
  'javascript',
  'peaches'
];

// length: 6 = only use words with 6 chars
// length: [6,8] = only use words with between 6 and 8 chars

// upper_case = first means football -> Football
// upper_case = last means football -> footbalL

// strip = vowels means football -> ftbll
// strip = consonants means football -> ooa

const configs = [{
  upper_case: 'first',
  length: [6, 8]
}, {
  upper_case: 'last',
  length: [7, 9],
  strip: 'vowels'
}, {
  length: 10,
  strip: 'consonants'
}];



Array.prototype.log = function (msg) {
  console.log(msg, this)
  return this
}



const filterLen = _.curry((rule, xs) => {
  const filterRange = item => {
    const len = item.length,
      [min, max] = rule.length
    return len >= min && len <= max
  }
  const filterExact = item => item.length === rule.length
  const functor = Array.isArray(rule.length) ? filterRange : filterExact
  return xs.filter(functor)
});

// length :: Number or Array -> Functor f (Filter)
const length = numberOrAry => {
  const filterExact = item => item.length === numberOrAry
  const filterRange = item => {
    const len = item.length,
      [min, max] = numberOrAry
    return len >= min && len <= max
  }
  return Array.isArray(numberOrAry) ? filterRange : filterExact

}

test('length: number', t => {
  const functor = length(6)
  const actual = words.filter(functor)
  const expected = ['apples']
  t.deepEqual(actual, expected)
})

test('length: array', t => {
  const functor = length([6,7])
  const actual = words.filter(functor)
  const expected = ['apples', 'peaches']
  t.deepEqual(actual, expected)
})


/*
testEqual(filterLen({length: 6}, words), ['apples'], 'length number: should return apples');
testEqual(filterLen({length: [5,6]}, words), ['apples'], 'length range: should return apples');
testEqual(filterLen({length: [6,7]}, words), ['apples', 'peaches'], 'length range: should return apples and peaches');
// */
const upperCase = _.curry((rule, xs) => {
  const last = item => item.slice(0, -1) + item.slice(-1).toUpperCase()
  const first = item => item.slice(0, 1).toUpperCase() + item.slice(1)
  const functor = (rule['upper_case'] === 'first')
    ? first
    : rule['upper_case'] === 'last'
      ? last
      : id
  return xs.map(functor)
})

/*
testEqual(upperCase({'upper_case': 'last'}, ['aa','bb']), ['aA', 'bB'], 'upper_case: last')
testEqual(upperCase({'upper_case': 'first'}, ['aa','bb']), ['Aa', 'Bb'], 'upper_case: first')
testEqual(upperCase({'upper_case': 'unknown'}, ['aa','bb']), ['aa', 'bb'], 'upper_case: unknown - no changes')
testEqual(upperCase({}, ['aa','bb']), ['aa', 'bb'], 'upper_case: missing - no changes')
// */

// strip :: Object -> Array -> Array
const strip = _.curry((rule, xs) => {
  const vowelChars = 'euioaEUIOA'
  const vowels = char => vowelChars.indexOf(char) === -1
  const consonants = _.complement(vowels)
  const functor = rule.strip === 'vowels' ? vowels : consonants

  const mapper = item => item.split('').filter(functor).join('')
  return xs.map(mapper)
})

/*
testEqual(strip({'strip': 'vowels'}, ['aa', 'bab']), ['', 'bb'], 'strip: vowels')

// */


function applyConfig(words, configs) {
  let result = [];
  return result
}

export {
  filterLen,
  applyConfig,
  strip
}
// console.log(new Date(), applyConfig(words, configs))
