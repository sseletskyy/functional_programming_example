import _ from 'ramda'
import test from 'ava'

const words = [
  'spacejump',
  'apples',
  'graphics',
  'javascript',
  'peaches'
]

// length: 6 = only use words with 6 chars
// length: [6,8] = only use words with between 6 and 8 chars

// upper_case = first means football -> Football
// upper_case = last means football -> footbalL

// strip = vowels means football -> ftbll
// strip = consonants means football -> ooa

/*
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
}]
*/

// length :: Number or Array -> (Array)
// returns a function which expects an array to be filtered by a functor
const lengthFunctor = numberOrAry => {
  const filterExact = item => item.length === numberOrAry
  const filterRange = item => {
    const len = item.length,
      [min, max] = numberOrAry
    return len >= min && len <= max
  }
  const functor = Array.isArray(numberOrAry)
    ? filterRange
    : (typeof numberOrAry === 'number')
      ? filterExact
      : null

  // skip filter if functor is null/undefined
  return functor && _.filter(functor) || _.identity

}

// upperCase :: string -> (Array)
// returns a function which expects an array to be mapped by a functor
const upperCaseFunctor = firstOrLast => {
  const last = item => item.slice(0, -1) + item.slice(-1).toUpperCase()
  const first = item => item.slice(0, 1).toUpperCase() + item.slice(1)
  const mapping = {first, last}
  const functor = mapping[firstOrLast]
  return functor && _.map(functor) || _.identity
}


// strip :: string -> (Array)
const stripFunctor = vowelsOrConsonants => {
  const vowelChars = 'euioaEUIOA'
  const consonantChars = 'qwrtypsdfghjklzxcvbnmQWRTYPSDFGHJKLZXCVBNM'

  const vowels = char => vowelChars.indexOf(char) === -1
  const consonants = char => consonantChars.indexOf(char) === -1

  const mapping = {vowels, consonants}
  const functor = mapping[vowelsOrConsonants]

  if (!functor) {
    return  _.identity
  }
  
  const mapper = item => item.split('').filter(functor).join('')
  return _.map(mapper)
}


// this function is missing in ramda, so I took it from lodash
const _isFunction = function (obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply)
}

// applyConfig :: Array A of Strings -> Array B of Objects -> Array B of Array `A of Strings
// attention: the sequence of keys in config objects is important
function applyConfig(words, configs) {

  // maps functors to config keys
  // expand it with new modifiers (functors) if needed
  const functorMapping = {
    'length': lengthFunctor,
    'upper_case': upperCaseFunctor,
    'strip': stripFunctor
  }

  // :: Object A -> String, key of Object A -> (Array), modificator function based on config's key
  const callFunctorWithConfigValue = config => key => {
    const functor = functorMapping[key]
    return _isFunction(functor) ? functor(config[key]) : _.identity
  }


  const applyWordsToChain = config => {
    // callFunctor :: key, String -> (Array)
    const callFunctor = callFunctorWithConfigValue(config)
    // chain :: (Array A) -> Array `A,
    // a function which expects an array,
    // it applies a sequense of functors and returns the final array based on Object config
    const chain = _.pipe.apply(undefined, Object.keys(config).map(callFunctor))
    return chain(words)
  }
  return configs.map(applyWordsToChain)

}

export {
  applyConfig
}

/********************
 * AVA Tests below
 */


test('applyConfig: length: 6, strip: vowels, upper_case: first', t => {
  const config = {
    length: 6,
    strip: 'vowels',
    upper_case: 'first'
  }
  const actual = applyConfig(words, [config])
  const expected = /* words -> ['apples'] -> ['ppls'] -> */ [['Ppls']]
  t.deepEqual(actual, expected)
})

test('applyConfig: strip: vowels, length: [6,9], upper_case: last', t => {
  const config = {
    strip: 'vowels',
    length: [6, 9],
    upper_case: 'last'
  }
  const actual = applyConfig(words, [config])
  // const expected = /* words -> ['spacejump','apples','graphics','javascript','peaches'] */

  // transformation
  // words -> ['spcjmp','ppls','grphcs','jvscrpt','pchs'] -> ['spcjmp', 'grphcs', 'jvscrpt'] -> expected
  const expected = [['spcjmP', 'grphcS', 'jvscrpT']]
  t.deepEqual(actual, expected)
})

test('applyConfig, two configs', t => {
  const config = {
    strip: 'vowels',
    length: [6, 9],
    upper_case: 'last'
  }
  const config2 = {
    strip: 'consonants',
    length: [1, 2],
    upper_case: 'first'
  }
  const actual = applyConfig(words, [config, config2])
  const expected = [['spcjmP', 'grphcS', 'jvscrpT'], ['Ae', 'Ai']]
  t.deepEqual(actual, expected)

})

test('applyConfig, unknown config key `test`', t => {
  const config = {
    test: 'wrong key',
    length: 6,
    upper_case: 'last'
  }
  const actual = applyConfig(words, [config])
  const expected = [['appleS']]
  t.deepEqual(actual, expected)
})

test('applyConfig all wrong keys in config', t => {
  const config = {
    a: 'a',
    b: 'b',
    c: 'c'
  }
  const actual = applyConfig(words, [config])
  const expected = [[...words]]
  t.deepEqual(actual, expected)
})

test('length: number', t => {
  const functor = lengthFunctor(6)
  const actual = functor(words)
  const expected = ['apples']
  t.deepEqual(actual, expected)
})

test('length: negative number - should filter out all values', t => {
  const functor = lengthFunctor(-6)
  const actual = functor(words)
  const expected = []
  t.deepEqual(actual, expected)
})

test('length: array', t => {
  const functor = lengthFunctor([6, 7])
  const actual = functor(words)
  const expected = ['apples', 'peaches']
  t.deepEqual(actual, expected)
})

test('length: array with first number greater than second - should filter out all the values', t => {
  const functor = lengthFunctor([7, 6])
  const actual = functor(words)
  const expected = [] // ['apples', 'peaches']
  t.deepEqual(actual, expected)
})
test('length: array with not numbers - should filter out all the values', t => {
  const functor = lengthFunctor(['a', 'b'])
  const actual = functor(words)
  const expected = [] // ['apples', 'peaches']
  t.deepEqual(actual, expected)
})

test('length: string or other type, just return unmodified array', t => {
  const functor = lengthFunctor('x')
  const actual = functor(words)
  const expected = words
  t.deepEqual(actual, expected)
})

test('upperCase: first', t => {
  const functor = upperCaseFunctor('first')
  const actual = functor(['test', '123', 'Fix'])
  const expected = ['Test', '123', 'Fix']
  t.deepEqual(actual, expected)
})

test('upperCase: last', t => {
  const functor = upperCaseFunctor('last')
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['tesT', '123', 'FiX']
  t.deepEqual(actual, expected)
})

test('upperCase: other value - no changes', t => {
  const functor = upperCaseFunctor('other value')
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['tesT', '123', 'Fix']
  t.deepEqual(actual, expected)
})
test('upperCase: not a string - no changes', t => {
  const functor = upperCaseFunctor([])
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['tesT', '123', 'Fix']
  t.deepEqual(actual, expected)
})
test('upperCase: not a string - no changes', t => {
  const functor = upperCaseFunctor(Infinity)
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['tesT', '123', 'Fix']
  t.deepEqual(actual, expected)
})

test('strip: vowels', t => {
  const functor = stripFunctor('vowels')
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['tsT', '123', 'Fx']
  t.deepEqual(actual, expected)
})

test('strip: consonants', t => {
  const functor = stripFunctor('consonants')
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['e', '123', 'i']
  t.deepEqual(actual, expected)
})

test('strip: other string - no changes', t => {
  const functor = stripFunctor('other string')
  const actual = functor(['tesT', '123', 'Fix'])
  const expected = ['tesT', '123', 'Fix']
  t.deepEqual(actual, expected)
})

