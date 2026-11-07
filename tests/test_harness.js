/**
 * tests/test_harness.js
 * 
 * Zero-dependency BDD/TDD test harness and assertion library.
 * Built strictly with Node.js standard library (util, path).
 */

const util = require('util');

// Registry of test suites
const suites = [];
let currentSuite = null;

// Global and per-test assertion counters
let totalAssertions = 0;
let testAssertionsCount = 0;

function resetTestAssertionCount() {
  testAssertionsCount = 0;
}

function getTestAssertionCount() {
  return testAssertionsCount;
}

/**
 * Deep equality helper
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * AssertionError with structured diagnostics
 */
class AssertionError extends Error {
  constructor(message, actual, expected, selector = null) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
    this.selector = selector;
  }
}

/**
 * Expect Assertion Object
 */
class Expectation {
  constructor(actual, isNot = false, customMessage = null) {
    this.actual = actual;
    this.isNot = isNot;
    this.customMessage = customMessage;
  }

  get not() {
    return new Expectation(this.actual, !this.isNot, this.customMessage);
  }

  _assert(condition, messageGenerator, expected) {
    totalAssertions++;
    testAssertionsCount++;
    const passed = this.isNot ? !condition : condition;
    if (!passed) {
      const defaultMsg = messageGenerator(this.isNot);
      const msg = this.customMessage ? `${this.customMessage} -> ${defaultMsg}` : defaultMsg;
      throw new AssertionError(msg, this.actual, expected);
    }
  }

  toBe(expected) {
    this._assert(
      this.actual === expected,
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to be ${util.inspect(expected)}`,
      expected
    );
  }

  toEqual(expected) {
    this._assert(
      deepEqual(this.actual, expected),
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to deeply equal ${util.inspect(expected)}`,
      expected
    );
  }

  toBeTruthy() {
    this._assert(
      Boolean(this.actual) === true,
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to be truthy`,
      true
    );
  }

  toBeFalsy() {
    this._assert(
      Boolean(this.actual) === false,
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to be falsy`,
      false
    );
  }

  toBeNull() {
    this._assert(
      this.actual === null,
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to be null`,
      null
    );
  }

  toBeDefined() {
    this._assert(
      this.actual !== undefined,
      (not) => `Expected value ${not ? 'NOT ' : ''}to be defined (got undefined)`,
      'defined'
    );
  }

  toBeUndefined() {
    this._assert(
      this.actual === undefined,
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to be undefined`,
      undefined
    );
  }

  toContain(itemOrSubstr) {
    let has = false;
    if (this.actual && typeof this.actual.includes === 'function') {
      has = this.actual.includes(itemOrSubstr);
    } else if (Array.isArray(this.actual)) {
      has = this.actual.some(x => deepEqual(x, itemOrSubstr));
    }
    this._assert(
      has,
      (not) => `Expected ${util.inspect(this.actual)} ${not ? 'NOT ' : ''}to contain ${util.inspect(itemOrSubstr)}`,
      itemOrSubstr
    );
  }

  toBeGreaterThan(n) {
    this._assert(
      typeof this.actual === 'number' && this.actual > n,
      (not) => `Expected ${this.actual} ${not ? 'NOT ' : ''}to be greater than ${n}`,
      `> ${n}`
    );
  }

  toBeGreaterThanOrEqual(n) {
    this._assert(
      typeof this.actual === 'number' && this.actual >= n,
      (not) => `Expected ${this.actual} ${not ? 'NOT ' : ''}to be greater than or equal to ${n}`,
      `>= ${n}`
    );
  }

  toBeLessThan(n) {
    this._assert(
      typeof this.actual === 'number' && this.actual < n,
      (not) => `Expected ${this.actual} ${not ? 'NOT ' : ''}to be less than ${n}`,
      `< ${n}`
    );
  }

  toBeLessThanOrEqual(n) {
    this._assert(
      typeof this.actual === 'number' && this.actual <= n,
      (not) => `Expected ${this.actual} ${not ? 'NOT ' : ''}to be less than or equal to ${n}`,
      `<= ${n}`
    );
  }

  toMatch(regexOrPattern) {
    const re = typeof regexOrPattern === 'string' ? new RegExp(regexOrPattern) : regexOrPattern;
    this._assert(
      typeof this.actual === 'string' && re.test(this.actual),
      (not) => `Expected "${this.actual}" ${not ? 'NOT ' : ''}to match ${re}`,
      re
    );
  }

  toThrow(expectedErrorPattern = null) {
    if (typeof this.actual !== 'function') {
      throw new Error(`expect(actual).toThrow() requires actual to be a function, got ${typeof this.actual}`);
    }
    let threw = false;
    let thrownError = null;
    try {
      this.actual();
    } catch (err) {
      threw = true;
      thrownError = err;
    }

    if (expectedErrorPattern && threw) {
      if (typeof expectedErrorPattern === 'string') {
        threw = thrownError.message.includes(expectedErrorPattern);
      } else if (expectedErrorPattern instanceof RegExp) {
        threw = expectedErrorPattern.test(thrownError.message);
      }
    }

    this._assert(
      threw,
      (not) => `Expected function ${not ? 'NOT ' : ''}to throw ${expectedErrorPattern ? util.inspect(expectedErrorPattern) : 'an error'}, but ${threw ? `threw: ${thrownError.message}` : 'did not throw'}`,
      expectedErrorPattern || 'any error'
    );
  }
}

function expect(actual, customMessage = null) {
  return new Expectation(actual, false, customMessage);
}

function describe(title, fn) {
  const suite = {
    title,
    parent: currentSuite,
    tests: [],
    beforeAllHooks: [],
    beforeEachHooks: [],
    afterEachHooks: [],
    afterAllHooks: [],
    subSuites: []
  };

  if (currentSuite) {
    currentSuite.subSuites.push(suite);
  } else {
    suites.push(suite);
  }

  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

function test(title, fn) {
  if (!currentSuite) {
    describe('Default Suite', () => {
      test(title, fn);
    });
    return;
  }
  currentSuite.tests.push({ title, fn, suite: currentSuite });
}

const it = test;

function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAllHooks.push(fn);
}

function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

function afterEach(fn) {
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

function afterAll(fn) {
  if (currentSuite) currentSuite.afterAllHooks.push(fn);
}

function resetRegistry() {
  suites.length = 0;
  currentSuite = null;
  totalAssertions = 0;
}

function getSuites() {
  return suites;
}

function getAssertionCount() {
  return totalAssertions;
}

module.exports = {
  expect,
  describe,
  test,
  it,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  resetRegistry,
  getSuites,
  getAssertionCount,
  resetTestAssertionCount,
  getTestAssertionCount,
  AssertionError
};
