/**
 * tests/dom_parser.js
 * 
 * Production-grade, zero-dependency HTML micro-parser, DOM abstraction layer,
 * and VM sandbox for headless E2E testing of index.html in pure Node.js.
 * 
 * Built strictly with Node.js standard library (fs, path, vm, util).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const util = require('util');

// HTML void elements (elements that cannot have children)
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// SVG self-closing elements
const SVG_SELF_CLOSING = new Set([
  'path', 'circle', 'ellipse', 'line', 'polygon', 'polyline',
  'rect', 'stop', 'use'
]);

/**
 * ClassList implementation
 */
class ClassList {
  constructor(element) {
    this._element = element;
  }

  _getClasses() {
    const classAttr = this._element.getAttribute('class') || '';
    return classAttr.trim().split(/\s+/).filter(Boolean);
  }

  _setClasses(classes) {
    if (classes.length === 0) {
      this._element.removeAttribute('class');
    } else {
      this._element.setAttribute('class', classes.join(' '));
    }
  }

  contains(className) {
    return this._getClasses().includes(className);
  }

  add(...classNames) {
    const current = new Set(this._getClasses());
    for (const c of classNames) {
      if (c && typeof c === 'string') current.add(c.trim());
    }
    this._setClasses(Array.from(current));
  }

  remove(...classNames) {
    const current = this._getClasses().filter(c => !classNames.includes(c));
    this._setClasses(current);
  }

  toggle(className, force) {
    const has = this.contains(className);
    const shouldAdd = force !== undefined ? Boolean(force) : !has;
    if (shouldAdd) {
      this.add(className);
    } else {
      this.remove(className);
    }
    return shouldAdd;
  }

  get length() {
    return this._getClasses().length;
  }

  item(index) {
    return this._getClasses()[index] || null;
  }

  toString() {
    return this._getClasses().join(' ');
  }
}

/**
 * DOMNode base class
 */
class DOMNode {
  constructor(nodeType, nodeName) {
    this.nodeType = nodeType; // 1 = Element, 3 = Text, 8 = Comment, 9 = Document
    this.nodeName = nodeName;
    this.parentNode = null;
    this.parentElement = null;
    this.childNodes = [];
    this._eventListeners = {};
  }

  appendChild(child) {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    child.parentElement = this.nodeType === 1 ? this : null;
    this.childNodes.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index !== -1) {
      this.childNodes.splice(index, 1);
      child.parentNode = null;
      child.parentElement = null;
    }
    return child;
  }

  insertBefore(newChild, refChild) {
    if (!refChild) {
      return this.appendChild(newChild);
    }
    const index = this.childNodes.indexOf(refChild);
    if (index === -1) {
      return this.appendChild(newChild);
    }
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    newChild.parentNode = this;
    newChild.parentElement = this.nodeType === 1 ? this : null;
    this.childNodes.splice(index, 0, newChild);
    return newChild;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  addEventListener(type, callback, options = {}) {
    if (!this._eventListeners[type]) {
      this._eventListeners[type] = [];
    }
    this._eventListeners[type].push({ callback, once: Boolean(options.once) });
  }

  removeEventListener(type, callback) {
    if (!this._eventListeners[type]) return;
    this._eventListeners[type] = this._eventListeners[type].filter(item => item.callback !== callback);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.currentTarget = this;

    const listeners = this._eventListeners[event.type] ? [...this._eventListeners[event.type]] : [];
    for (const item of listeners) {
      try {
        item.callback.call(this, event);
      } catch (err) {
        console.error(`[Event Error in ${event.type}]:`, err);
      }
      if (item.once) {
        this.removeEventListener(event.type, item.callback);
      }
    }

    // Bubbling
    if (event.bubbles !== false && this.parentElement) {
      this.parentElement.dispatchEvent(event);
    }

    return !event.defaultPrevented;
  }
}

/**
 * Text node
 */
class DOMTextNode extends DOMNode {
  constructor(text) {
    super(3, '#text');
    this.nodeValue = String(text);
  }

  get textContent() {
    return this.nodeValue;
  }

  set textContent(val) {
    this.nodeValue = String(val);
  }
}

/**
 * Comment node
 */
class DOMCommentNode extends DOMNode {
  constructor(data) {
    super(8, '#comment');
    this.nodeValue = String(data);
  }
}

/**
 * Element node
 */
class DOMElement extends DOMNode {
  constructor(tagName) {
    super(1, tagName.toUpperCase());
    this.tagName = tagName.toUpperCase();
    this.attributes = {};
    this.classList = new ClassList(this);
    this._styleObject = {};
    this._initStyleProxy();
    this._initDatasetProxy();
  }

  _initStyleProxy() {
    const self = this;
    this.style = new Proxy(this._styleObject, {
      get(target, prop) {
        if (prop === 'setProperty') {
          return (name, val) => {
            target[name] = String(val);
            self._syncStyleAttr();
          };
        }
        if (prop === 'getPropertyValue') {
          return (name) => target[name] || '';
        }
        if (prop === 'removeProperty') {
          return (name) => {
            delete target[name];
            self._syncStyleAttr();
          };
        }
        return target[prop] || '';
      },
      set(target, prop, value) {
        target[prop] = String(value);
        self._syncStyleAttr();
        return true;
      }
    });
  }

  _syncStyleAttr() {
    const parts = [];
    for (const [k, v] of Object.entries(this._styleObject)) {
      if (v) {
        // Convert camelCase to kebab-case if not already
        const kebab = k.startsWith('--') ? k : k.replace(/([A-Z])/g, '-$1').toLowerCase();
        parts.push(`${kebab}: ${v}`);
      }
    }
    if (parts.length > 0) {
      this.setAttribute('style', parts.join('; '));
    } else {
      this.removeAttribute('style');
    }
  }

  _initDatasetProxy() {
    const self = this;
    this.dataset = new Proxy({}, {
      get(target, prop) {
        // e.g. featureTab -> data-feature-tab
        const kebab = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return self.getAttribute(kebab);
      },
      set(target, prop, value) {
        const kebab = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        self.setAttribute(kebab, String(value));
        return true;
      },
      has(target, prop) {
        const kebab = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return self.hasAttribute(kebab);
      }
    });
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(val) {
    if (val) this.setAttribute('id', val);
    else this.removeAttribute('id');
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(val) {
    if (val) this.setAttribute('class', val);
    else this.removeAttribute('class');
  }

  get children() {
    return this.childNodes.filter(node => node.nodeType === 1);
  }

  get firstElementChild() {
    const c = this.children;
    return c.length > 0 ? c[0] : null;
  }

  get lastElementChild() {
    const c = this.children;
    return c.length > 0 ? c[c.length - 1] : null;
  }

  get previousElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    const idx = siblings.indexOf(this);
    return idx > 0 ? siblings[idx - 1] : null;
  }

  get nextElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    const idx = siblings.indexOf(this);
    return idx !== -1 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  }

  getAttribute(name) {
    const lower = name.toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.attributes, lower) ? this.attributes[lower] : null;
  }

  setAttribute(name, value) {
    const lower = name.toLowerCase();
    this.attributes[lower] = String(value);

    if (lower === 'style') {
      // Parse style string into _styleObject
      this._styleObject = {};
      const pairs = String(value).split(';');
      for (const pair of pairs) {
        const idx = pair.indexOf(':');
        if (idx !== -1) {
          const key = pair.slice(0, idx).trim();
          const val = pair.slice(idx + 1).trim();
          if (key) this._styleObject[key] = val;
        }
      }
    }
  }

  removeAttribute(name) {
    const lower = name.toLowerCase();
    delete this.attributes[lower];
    if (lower === 'style') {
      this._styleObject = {};
    }
  }

  hasAttribute(name) {
    const lower = name.toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.attributes, lower);
  }

  get value() {
    if (this._value !== undefined) return this._value;
    return this.getAttribute('value') || '';
  }

  set value(val) {
    this._value = String(val);
    this.setAttribute('value', String(val));
  }

  get checked() {
    if (this._checked !== undefined) return this._checked;
    return this.hasAttribute('checked');
  }

  set checked(val) {
    this._checked = Boolean(val);
    if (this._checked) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  get textContent() {
    let text = '';
    for (const child of this.childNodes) {
      if (child.nodeType === 3) {
        text += child.nodeValue;
      } else if (child.nodeType === 1) {
        text += child.textContent;
      }
    }
    return text;
  }

  set textContent(text) {
    this.childNodes = [];
    this.appendChild(new DOMTextNode(text));
  }

  get innerHTML() {
    let out = '';
    for (const child of this.childNodes) {
      if (child.nodeType === 3) {
        out += escapeHTML(child.nodeValue);
      } else if (child.nodeType === 8) {
        out += `<!--${child.nodeValue}-->`;
      } else if (child.nodeType === 1) {
        out += child.outerHTML;
      }
    }
    return out;
  }

  set innerHTML(htmlSnippet) {
    this.childNodes = [];
    if (!htmlSnippet) return;
    const fragment = parseHTMLSnippet(htmlSnippet);
    for (const node of fragment) {
      this.appendChild(node);
    }
  }

  get outerHTML() {
    const tag = this.tagName.toLowerCase();
    let attrs = '';
    for (const [k, v] of Object.entries(this.attributes)) {
      attrs += ` ${k}="${escapeAttr(v)}"`;
    }

    if (VOID_ELEMENTS.has(tag) || (this.isSvgElement && SVG_SELF_CLOSING.has(tag) && this.childNodes.length === 0)) {
      return `<${tag}${attrs}>`;
    }

    return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
  }

  get isSvgElement() {
    let cur = this;
    while (cur) {
      if (cur.tagName === 'SVG') return true;
      cur = cur.parentElement;
    }
    return false;
  }

  click() {
    const event = new DOMEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  }

  focus() {
    if (this.parentNode) {
      let root = this;
      while (root.parentNode) root = root.parentNode;
      if (root.nodeType === 9) root.activeElement = this;
    }
    const event = new DOMEvent('focus', { bubbles: false, cancelable: false });
    this.dispatchEvent(event);
  }

  blur() {
    if (this.parentNode) {
      let root = this;
      while (root.parentNode) root = root.parentNode;
      if (root.nodeType === 9 && root.activeElement === this) root.activeElement = null;
    }
    const event = new DOMEvent('blur', { bubbles: false, cancelable: false });
    this.dispatchEvent(event);
  }

  select() {
    // Input / textarea text selection stub
  }

  scrollIntoView() {
    // Headless no-op stub
  }

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 0
    };
  }

  matches(selector) {
    return matchesSelector(this, selector);
  }

  closest(selector) {
    let cur = this;
    while (cur && cur.nodeType === 1) {
      if (cur.matches(selector)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  querySelector(selector) {
    return querySelector(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

  getElementById(id) {
    return querySelector(this, `#${id}`);
  }

  getElementsByClassName(className) {
    return querySelectorAll(this, `.${className}`);
  }

  getElementsByTagName(tagName) {
    return querySelectorAll(this, tagName);
  }
}

/**
 * Document Node
 */
class DOMDocument extends DOMNode {
  constructor() {
    super(9, '#document');
    this.defaultView = null;
    this.activeElement = null;
  }

  createElement(tagName) {
    return new DOMElement(tagName);
  }

  createTextNode(text) {
    return new DOMTextNode(text);
  }

  createComment(data) {
    return new DOMCommentNode(data);
  }

  createDocumentFragment() {
    return new DOMNode(11, '#document-fragment');
  }

  get documentElement() {
    for (const child of this.childNodes) {
      if (child.nodeType === 1 && child.tagName === 'HTML') return child;
    }
    return this.children[0] || null;
  }

  get head() {
    const docEl = this.documentElement;
    if (!docEl) return null;
    for (const child of docEl.children) {
      if (child.tagName === 'HEAD') return child;
    }
    return null;
  }

  get body() {
    const docEl = this.documentElement;
    if (!docEl) return null;
    for (const child of docEl.children) {
      if (child.tagName === 'BODY') return child;
    }
    return null;
  }

  get title() {
    const head = this.head;
    if (!head) return '';
    const titleEl = head.querySelector('title');
    return titleEl ? titleEl.textContent : '';
  }

  set title(val) {
    let docEl = this.documentElement;
    if (!docEl) {
      docEl = this.createElement('html');
      this.appendChild(docEl);
    }
    let head = this.head;
    if (!head) {
      head = this.createElement('head');
      docEl.insertBefore(head, this.body);
    }
    let titleEl = head.querySelector('title');
    if (!titleEl) {
      titleEl = this.createElement('title');
      head.appendChild(titleEl);
    }
    titleEl.textContent = val;
  }

  querySelector(selector) {
    return querySelector(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

  getElementById(id) {
    return querySelector(this, `#${id}`);
  }

  getElementsByClassName(className) {
    return querySelectorAll(this, `.${className}`);
  }

  getElementsByTagName(tagName) {
    return querySelectorAll(this, tagName);
  }

  execCommand(cmd, showUI, value) {
    return true;
  }

  get children() {
    return this.childNodes.filter(node => node.nodeType === 1);
  }
}

/**
 * Event Classes
 */
class DOMEvent {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.bubbles = eventInitDict.bubbles !== undefined ? Boolean(eventInitDict.bubbles) : false;
    this.cancelable = eventInitDict.cancelable !== undefined ? Boolean(eventInitDict.cancelable) : false;
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this.timeStamp = Date.now();
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {
    this.bubbles = false;
  }
}

class DOMCustomEvent extends DOMEvent {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.detail = eventInitDict.detail || null;
  }
}

class DOMKeyboardEvent extends DOMEvent {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.key = eventInitDict.key || '';
    this.code = eventInitDict.code || '';
    this.ctrlKey = Boolean(eventInitDict.ctrlKey);
    this.shiftKey = Boolean(eventInitDict.shiftKey);
    this.altKey = Boolean(eventInitDict.altKey);
    this.metaKey = Boolean(eventInitDict.metaKey);
  }
}

class DOMMouseEvent extends DOMEvent {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.clientX = eventInitDict.clientX || 0;
    this.clientY = eventInitDict.clientY || 0;
    this.screenX = eventInitDict.screenX || 0;
    this.screenY = eventInitDict.screenY || 0;
    this.button = eventInitDict.button || 0;
    this.buttons = eventInitDict.buttons || 0;
    this.ctrlKey = Boolean(eventInitDict.ctrlKey);
    this.shiftKey = Boolean(eventInitDict.shiftKey);
    this.altKey = Boolean(eventInitDict.altKey);
    this.metaKey = Boolean(eventInitDict.metaKey);
  }
}

// Helpers for escaping
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * CSS Selector Matching Engine
 */
function parseCompoundSelector(compound) {
  const parts = [];
  const regex = /([.#]?[a-zA-Z0-9_\-*]+|\[[^\]]+\]|:[a-zA-Z0-9_\-]+(?:\([^)]+\))?)/g;
  let match;
  while ((match = regex.exec(compound)) !== null) {
    parts.push(match[1]);
  }
  return parts;
}

function matchSimple(element, simple) {
  if (element.nodeType !== 1) return false;

  if (simple === '*') return true;

  // ID selector
  if (simple.startsWith('#')) {
    return element.id === simple.slice(1);
  }

  // Class selector
  if (simple.startsWith('.')) {
    return element.classList.contains(simple.slice(1));
  }

  // Attribute selector [attr] or [attr="val"] with optional case-insensitive flag [attr op "val" i]
  if (simple.startsWith('[') && simple.endsWith(']')) {
    const inner = simple.slice(1, -1).trim();
    if (!inner.includes('=')) {
      return element.hasAttribute(inner);
    }
    const opMatch = inner.match(/^([a-zA-Z0-9_\-:]+)\s*([~|^$*]?=)\s*(?:(['"])(.*?)\3|([^\s]+))(?:\s+([iI]))?\s*$/);
    if (!opMatch) return false;
    const attrName = opMatch[1];
    const op = opMatch[2];
    const expectedVal = opMatch[4] !== undefined ? opMatch[4] : opMatch[5];
    const isCaseInsensitive = Boolean(opMatch[6]);

    const actualVal = element.getAttribute(attrName);
    if (actualVal === null) return false;

    let a = actualVal;
    let b = expectedVal !== undefined ? expectedVal : '';
    if (isCaseInsensitive) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }

    if (op === '=') return a === b;
    if (op === '*=') return a.includes(b);
    if (op === '^=') return a.startsWith(b);
    if (op === '$=') return a.endsWith(b);
    if (op === '~=') {
      const words = a.split(/\s+/);
      return words.includes(b);
    }
    if (op === '|=') {
      return a === b || a.startsWith(b + '-');
    }
    return false;
  }

  // Pseudo-classes
  if (simple.startsWith(':')) {
    const pseudo = simple.slice(1);
    if (pseudo === 'first-child') {
      if (!element.parentElement) return true;
      return element.parentElement.firstElementChild === element;
    }
    if (pseudo === 'last-child') {
      if (!element.parentElement) return true;
      return element.parentElement.lastElementChild === element;
    }
    if (pseudo === 'disabled') {
      return element.disabled;
    }
    if (pseudo === 'checked') {
      return element.checked;
    }
    if (pseudo.startsWith('not(') && pseudo.endsWith(')')) {
      const innerSel = pseudo.slice(4, -1);
      return !matchSimple(element, innerSel);
    }
    const nthMatch = pseudo.match(/^nth-child\((\d+)\)$/);
    if (nthMatch) {
      const n = parseInt(nthMatch[1], 10);
      if (!element.parentElement) return n === 1;
      const idx = element.parentElement.children.indexOf(element);
      return idx === n - 1;
    }
    // Return false for unknown pseudo-classes to prevent false positives
    return false;
  }

  // Tag name
  return element.tagName.toLowerCase() === simple.toLowerCase();
}

function matchCompound(element, compound) {
  const simples = parseCompoundSelector(compound);
  if (simples.length === 0) return false;
  for (const s of simples) {
    if (!matchSimple(element, s)) return false;
  }
  return true;
}

function matchesSelector(element, selector) {
  // Comma-separated list
  const groups = selector.split(',').map(s => s.trim()).filter(Boolean);
  for (const group of groups) {
    if (matchComplexSelector(element, group)) return true;
  }
  return false;
}

function tokenizeComplexSelector(sel) {
  sel = sel.trim();
  const tokens = [];
  let currentToken = '';
  let inBracket = false;
  let inQuote = null;

  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i];

    if (inQuote) {
      currentToken += ch;
      if (ch === inQuote) inQuote = null;
    } else if (inBracket) {
      currentToken += ch;
      if (ch === '"' || ch === "'") inQuote = ch;
      else if (ch === ']') inBracket = false;
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = ch;
        currentToken += ch;
      } else if (ch === '[') {
        inBracket = true;
        currentToken += ch;
      } else if (ch === '>' || ch === '+' || ch === '~') {
        if (currentToken.trim()) tokens.push(currentToken.trim());
        tokens.push(ch);
        currentToken = '';
      } else if (/\s/.test(ch)) {
        let j = i + 1;
        while (j < sel.length && /\s/.test(sel[j])) j++;
        if (j < sel.length && (sel[j] === '>' || sel[j] === '+' || sel[j] === '~')) {
          i = j - 1;
        } else {
          if (currentToken.trim()) {
            tokens.push(currentToken.trim());
            tokens.push(' ');
            currentToken = '';
          }
          i = j - 1;
        }
      } else {
        currentToken += ch;
      }
    }
  }

  if (currentToken.trim()) {
    tokens.push(currentToken.trim());
  }

  return tokens.filter(t => t.length > 0);
}

function matchComplexSelector(element, selector) {
  const tokens = tokenizeComplexSelector(selector);
  if (tokens.length === 0) return false;

  // We match backwards from the last compound selector
  let curIndex = tokens.length - 1;
  let curElement = element;

  // Last token must be a compound selector
  const targetCompound = tokens[curIndex];
  if (!matchCompound(curElement, targetCompound)) {
    return false;
  }

  curIndex--;

  while (curIndex >= 0) {
    const combinator = tokens[curIndex];
    curIndex--;
    if (curIndex < 0) return false;
    const prevCompound = tokens[curIndex];
    curIndex--;

    if (combinator === '>') {
      // Direct child
      curElement = curElement.parentElement;
      if (!curElement || !matchCompound(curElement, prevCompound)) {
        return false;
      }
    } else if (combinator === ' ') {
      // Descendant
      let ancestor = curElement.parentElement;
      let found = false;
      while (ancestor) {
        if (matchCompound(ancestor, prevCompound)) {
          curElement = ancestor;
          found = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!found) return false;
    } else if (combinator === '+') {
      // Adjacent sibling
      curElement = curElement.previousElementSibling;
      if (!curElement || !matchCompound(curElement, prevCompound)) {
        return false;
      }
    } else if (combinator === '~') {
      // General sibling
      let sibling = curElement.previousElementSibling;
      let found = false;
      while (sibling) {
        if (matchCompound(sibling, prevCompound)) {
          curElement = sibling;
          found = true;
          break;
        }
        sibling = sibling.previousElementSibling;
      }
      if (!found) return false;
    }
  }

  return true;
}

function querySelectorAll(root, selector) {
  const results = [];
  function traverse(node) {
    for (const child of node.childNodes) {
      if (child.nodeType === 1) {
        if (matchesSelector(child, selector)) {
          results.push(child);
        }
        traverse(child);
      }
    }
  }
  traverse(root);
  return results;
}

function querySelector(root, selector) {
  let result = null;
  function traverse(node) {
    for (const child of node.childNodes) {
      if (child.nodeType === 1) {
        if (matchesSelector(child, selector)) {
          result = child;
          return true;
        }
        if (traverse(child)) return true;
      }
    }
    return false;
  }
  traverse(root);
  return result;
}

function findTagEnd(str, startIndex) {
  let inQuote = null;
  for (let j = startIndex; j < str.length; j++) {
    const ch = str[j];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
    } else {
      if (ch === '"' || ch === "'") inQuote = ch;
      else if (ch === '>') return j;
    }
  }
  return -1;
}

/**
 * Fast HTML Tokenizer & DOM Parser
 */
function parseHTML(html) {
  const doc = new DOMDocument();
  let currentParent = doc;
  const stack = [doc];

  let i = 0;
  const len = html.length;

  while (i < len) {
    // 1. Script & Style raw content capture
    if (
      currentParent.nodeType === 1 &&
      (currentParent.tagName === 'SCRIPT' || currentParent.tagName === 'STYLE')
    ) {
      const closeTag = `</${currentParent.tagName.toLowerCase()}`;
      const closeIdx = html.toLowerCase().indexOf(closeTag, i);
      if (closeIdx !== -1) {
        const text = html.slice(i, closeIdx);
        if (text) {
          currentParent.appendChild(new DOMTextNode(text));
        }
        i = closeIdx;
      } else {
        const text = html.slice(i);
        if (text) currentParent.appendChild(new DOMTextNode(text));
        break;
      }
    }

    // 2. Look for tag opening '<'
    const nextLt = html.indexOf('<', i);
    if (nextLt === -1) {
      const text = html.slice(i);
      if (text) currentParent.appendChild(new DOMTextNode(text));
      break;
    }

    if (nextLt > i) {
      const text = html.slice(i, nextLt);
      if (text) currentParent.appendChild(new DOMTextNode(text));
      i = nextLt;
    }

    // Now at '<'
    // 3. Comments: <!-- ... -->
    if (html.startsWith('<!--', i)) {
      const commentEnd = html.indexOf('-->', i + 4);
      if (commentEnd !== -1) {
        const commentData = html.slice(i + 4, commentEnd);
        currentParent.appendChild(new DOMCommentNode(commentData));
        i = commentEnd + 3;
        continue;
      } else {
        const commentData = html.slice(i + 4);
        currentParent.appendChild(new DOMCommentNode(commentData));
        break;
      }
    }

    // 4. DOCTYPE <!DOCTYPE ...>
    if (html.slice(i, i + 9).toUpperCase() === '<!DOCTYPE') {
      const docEnd = html.indexOf('>', i);
      if (docEnd !== -1) {
        i = docEnd + 1;
        continue;
      }
    }

    // 5. Closing tag: </tag>
    if (html[i + 1] === '/') {
      const closeEnd = html.indexOf('>', i + 2);
      if (closeEnd !== -1) {
        const tagName = html.slice(i + 2, closeEnd).trim().split(/\s+/)[0].toUpperCase();
        // Pop matching element
        while (stack.length > 1) {
          const top = stack[stack.length - 1];
          stack.pop();
          if (top.tagName === tagName) {
            break;
          }
        }
        currentParent = stack[stack.length - 1];
        i = closeEnd + 1;
        continue;
      }
    }

    // 6. Opening or self-closing tag: <tag ...>
    if (html[i] === '<' && /[a-zA-Z0-9_\-]/.test(html[i + 1])) {
      const nameMatch = html.slice(i).match(/^<([a-zA-Z0-9_\-]+)/);
      if (nameMatch) {
        const tagName = nameMatch[1];
        const tagEndIdx = findTagEnd(html, i + nameMatch[0].length);
        if (tagEndIdx !== -1) {
          const innerContent = html.slice(i + nameMatch[0].length, tagEndIdx).trim();
          const selfCloseSlash = innerContent.endsWith('/');
          const attrStr = selfCloseSlash ? innerContent.slice(0, -1) : innerContent;

          const element = new DOMElement(tagName);
          parseAttributes(attrStr, element);

          currentParent.appendChild(element);

          const isVoid = VOID_ELEMENTS.has(tagName.toLowerCase());
          const isSvgSelf = element.isSvgElement && (selfCloseSlash || SVG_SELF_CLOSING.has(tagName.toLowerCase()));

          if (!isVoid && !isSvgSelf && !selfCloseSlash) {
            stack.push(element);
            currentParent = element;
          }

          i = tagEndIdx + 1;
          continue;
        }
      }
    }

    // If no valid tag pattern matched, advance 1 character to avoid infinite loop
    currentParent.appendChild(new DOMTextNode(html[i]));
    i++;
  }

  return doc;
}

function parseAttributes(attrStr, element) {
  if (!attrStr || !attrStr.trim()) return;
  const regex = /([a-zA-Z0-9_\-:]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    const name = match[1];
    let val = '';
    if (match[2] !== undefined) val = match[2];
    else if (match[3] !== undefined) val = match[3];
    else if (match[4] !== undefined) val = match[4];
    else val = ''; // boolean attribute
    element.setAttribute(name, val);
  }
}

function parseHTMLSnippet(html) {
  const doc = parseHTML(`<body>${html}</body>`);
  const body = doc.body;
  return body ? [...body.childNodes] : [];
}

/**
 * VM Sandboxed Environment for Live Dynamic Testing
 */
function createSandboxEnvironment(document, rawHTML = '') {
  const memoryStorage = {};
  const localStorageMock = {
    getItem: (key) => memoryStorage[key] || null,
    setItem: (key, val) => { memoryStorage[key] = String(val); },
    removeItem: (key) => { delete memoryStorage[key]; },
    clear: () => { for (const k in memoryStorage) delete memoryStorage[k]; },
    key: (i) => Object.keys(memoryStorage)[i] || null,
    get length() { return Object.keys(memoryStorage).length; }
  };

  const clipboardData = { text: '' };
  const clipboardMock = {
    writeText: (t) => {
      clipboardData.text = String(t);
      return Promise.resolve();
    },
    readText: () => Promise.resolve(clipboardData.text)
  };

  const windowMock = new DOMNode(1, 'WINDOW');
  document.defaultView = windowMock;

  const activeTimers = new Set();
  const activeIntervals = new Set();

  const customSetTimeout = (cb, ms, ...args) => {
    const id = setTimeout(() => {
      activeTimers.delete(id);
      cb(...args);
    }, ms);
    activeTimers.add(id);
    return id;
  };

  const customClearTimeout = (id) => {
    activeTimers.delete(id);
    clearTimeout(id);
  };

  const customSetInterval = (cb, ms, ...args) => {
    const id = setInterval(cb, ms, ...args);
    activeIntervals.add(id);
    return id;
  };

  const customClearInterval = (id) => {
    activeIntervals.delete(id);
    clearInterval(id);
  };

  const cleanup = () => {
    for (const t of activeTimers) clearTimeout(t);
    activeTimers.clear();
    for (const i of activeIntervals) clearInterval(i);
    activeIntervals.clear();
  };

  const contextObj = {
    window: windowMock,
    document: document,
    navigator: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      clipboard: clipboardMock
    },
    localStorage: localStorageMock,
    sessionStorage: localStorageMock,
    location: {
      href: 'https://raycast.com/',
      origin: 'https://raycast.com',
      pathname: '/',
      hash: '',
      search: ''
    },
    getComputedStyle: (el) => ({
      getPropertyValue: (prop) => el.style.getPropertyValue(prop),
      display: el.style.display || 'block',
      opacity: el.style.opacity || '1',
      visibility: el.style.visibility || 'visible'
    }),
    requestAnimationFrame: (cb) => customSetTimeout(cb, 16),
    cancelAnimationFrame: (id) => customClearTimeout(id),
    setTimeout: customSetTimeout,
    clearTimeout: customClearTimeout,
    setInterval: customSetInterval,
    clearInterval: customClearInterval,
    console: console,
    Event: DOMEvent,
    CustomEvent: DOMCustomEvent,
    KeyboardEvent: DOMKeyboardEvent,
    MouseEvent: DOMMouseEvent,
    IntersectionObserver: class {
      constructor(callback) {
        this.callback = callback;
        this.elements = [];
      }
      observe(el) {
        this.elements.push(el);
        // Automatically trigger intersection after a tick
        customSetTimeout(() => {
          this.callback([{
            target: el,
            isIntersecting: true,
            intersectionRatio: 1.0
          }]);
        }, 10);
      }
      unobserve(el) {
        this.elements = this.elements.filter(e => e !== el);
      }
      disconnect() {
        this.elements = [];
      }
    }
  };

  // Wire up windowMock properties
  windowMock.document = document;
  windowMock.window = windowMock;
  windowMock.self = windowMock;
  windowMock.navigator = contextObj.navigator;
  windowMock.localStorage = localStorageMock;
  windowMock.sessionStorage = localStorageMock;
  windowMock.location = contextObj.location;
  windowMock.requestAnimationFrame = contextObj.requestAnimationFrame;
  windowMock.cancelAnimationFrame = contextObj.cancelAnimationFrame;
  windowMock.setTimeout = customSetTimeout;
  windowMock.clearTimeout = customClearTimeout;
  windowMock.setInterval = customSetInterval;
  windowMock.clearInterval = customClearInterval;
  windowMock.getComputedStyle = contextObj.getComputedStyle;
  windowMock.Event = DOMEvent;
  windowMock.CustomEvent = DOMCustomEvent;
  windowMock.KeyboardEvent = DOMKeyboardEvent;
  windowMock.MouseEvent = DOMMouseEvent;
  windowMock.scrollX = 0;
  windowMock.scrollY = 0;
  windowMock.pageXOffset = 0;
  windowMock.pageYOffset = 0;
  windowMock.innerWidth = 1440;
  windowMock.innerHeight = 900;
  windowMock.scrollTo = function(x, y) {
    this.scrollX = x;
    this.scrollY = y;
  };

  const vmContext = vm.createContext(contextObj);

  // Extract <script> elements and execute them
  const scripts = document.querySelectorAll('script');
  const executionErrors = [];

  for (const script of scripts) {
    const code = script.textContent;
    if (code && code.trim()) {
      try {
        vm.runInContext(code, vmContext, {
          displayErrors: true,
          timeout: 5000
        });
      } catch (err) {
        executionErrors.push({ script, error: err });
      }
    }
  }

  // Dispatch DOMContentLoaded and load events
  const dclEvent = new DOMEvent('DOMContentLoaded', { bubbles: false, cancelable: false });
  document.dispatchEvent(dclEvent);
  windowMock.dispatchEvent(dclEvent);

  const loadEvent = new DOMEvent('load', { bubbles: false, cancelable: false });
  windowMock.dispatchEvent(loadEvent);

  return {
    document,
    window: windowMock,
    context: vmContext,
    clipboard: clipboardData,
    errors: executionErrors,
    cleanup,
    evaluate: (code) => vm.runInContext(code, vmContext),
    getGlobal: (name) => {
      try {
        return vm.runInContext(name, vmContext);
      } catch (_) {
        return windowMock[name] !== undefined ? windowMock[name] : vmContext[name];
      }
    }
  };
}

/**
 * Loads index.html or returns a diagnostic document if not yet present
 */
function loadDocument(targetFilePath = null) {
  const defaultPath = path.resolve(__dirname, '..', 'index.html');
  const filePath = targetFilePath || process.env.TARGET_INDEX_HTML || defaultPath;

  if (!fs.existsSync(filePath)) {
    const diagnosticHTML = `
      <!DOCTYPE html>
      <html lang="en" data-diagnostic="missing">
        <head>
          <title>Progressive E2E Test Runner — Pending Deliverable</title>
        </head>
        <body>
          <div id="progressive-diagnostic-placeholder">
            <h1>index.html not yet present</h1>
            <p>The implementation track (M1/M2/M3) has not yet published index.html to ${filePath}.</p>
          </div>
        </body>
      </html>
    `;
    const doc = parseHTML(diagnosticHTML);
    const env = createSandboxEnvironment(doc, diagnosticHTML);
    env.isPlaceholder = true;
    env.filePath = filePath;
    return env;
  }

  const rawHTML = fs.readFileSync(filePath, 'utf8');
  const doc = parseHTML(rawHTML);
  const env = createSandboxEnvironment(doc, rawHTML);
  env.isPlaceholder = false;
  env.filePath = filePath;
  env.rawHTML = rawHTML;

  if (env.errors && env.errors.length > 0) {
    for (const e of env.errors) {
      if (process.env.DEBUG_TESTS) {
        console.warn(`[Script Execution Warning]:`, e.error ? e.error.message : e);
      }
    }
  }

  return env;
}

module.exports = {
  parseHTML,
  parseHTMLSnippet,
  createSandboxEnvironment,
  loadDocument,
  DOMNode,
  DOMElement,
  DOMTextNode,
  DOMCommentNode,
  DOMDocument,
  DOMEvent,
  DOMCustomEvent,
  DOMKeyboardEvent,
  DOMMouseEvent
};
