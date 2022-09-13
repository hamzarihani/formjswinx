'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Ids = require('ids');
var minDash = require('min-dash');
var snarkdown = require('@bpmn-io/snarkdown');
var jsxRuntime = require('preact/jsx-runtime');
var hooks = require('preact/hooks');
var preact = require('preact');
var Markup = require('preact-markup');
var compat = require('preact/compat');
var didi = require('didi');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Ids__default = /*#__PURE__*/_interopDefaultLegacy(Ids);
var snarkdown__default = /*#__PURE__*/_interopDefaultLegacy(snarkdown);
var Markup__default = /*#__PURE__*/_interopDefaultLegacy(Markup);

function createInjector(bootstrapModules) {
  const modules = [],
        components = [];

  function hasModule(module) {
    return modules.includes(module);
  }

  function addModule(module) {
    modules.push(module);
  }

  function visit(module) {
    if (hasModule(module)) {
      return;
    }

    (module.__depends__ || []).forEach(visit);

    if (hasModule(module)) {
      return;
    }

    addModule(module);
    (module.__init__ || []).forEach(function (component) {
      components.push(component);
    });
  }

  bootstrapModules.forEach(visit);
  const injector = new didi.Injector(modules);
  components.forEach(function (component) {
    try {
      injector[typeof component === 'string' ? 'get' : 'invoke'](component);
    } catch (err) {
      console.error('Failed to instantiate component');
      console.error(err.stack);
      throw err;
    }
  });
  return injector;
}

/**
 * @param {string?} prefix
 *
 * @returns Element
 */
function createFormContainer(prefix = 'fjs') {
  const container = document.createElement('div');
  container.classList.add(`${prefix}-container`);
  return container;
}

function findErrors(errors, path) {
  return errors[pathStringify(path)];
}
function isRequired(field) {
  return field.required;
}
function pathParse(path) {
  if (!path) {
    return [];
  }

  return path.split('.').map(key => {
    return isNaN(parseInt(key)) ? key : parseInt(key);
  });
}
function pathsEqual(a, b) {
  return a && b && a.length === b.length && a.every((value, index) => value === b[index]);
}
function pathStringify(path) {
  if (!path) {
    return '';
  }

  return path.join('.');
}
const indices = {};
function generateIndexForType(type) {
  if (type in indices) {
    indices[type]++;
  } else {
    indices[type] = 1;
  }

  return indices[type];
}
function generateIdForType(type) {
  return `${type}${generateIndexForType(type)}`;
}
/**
 * @template T
 * @param {T} data
 * @param {(this: any, key: string, value: any) => any} [replacer]
 * @return {T}
 */

function clone(data, replacer) {
  return JSON.parse(JSON.stringify(data, replacer));
}

var FN_REF = '__fn';
var DEFAULT_PRIORITY = 1000;
var slice = Array.prototype.slice;
/**
 * A general purpose event bus.
 *
 * This component is used to communicate across a diagram instance.
 * Other parts of a diagram can use it to listen to and broadcast events.
 *
 *
 * ## Registering for Events
 *
 * The event bus provides the {@link EventBus#on} and {@link EventBus#once}
 * methods to register for events. {@link EventBus#off} can be used to
 * remove event registrations. Listeners receive an instance of {@link Event}
 * as the first argument. It allows them to hook into the event execution.
 *
 * ```javascript
 *
 * // listen for event
 * eventBus.on('foo', function(event) {
 *
 *   // access event type
 *   event.type; // 'foo'
 *
 *   // stop propagation to other listeners
 *   event.stopPropagation();
 *
 *   // prevent event default
 *   event.preventDefault();
 * });
 *
 * // listen for event with custom payload
 * eventBus.on('bar', function(event, payload) {
 *   console.log(payload);
 * });
 *
 * // listen for event returning value
 * eventBus.on('foobar', function(event) {
 *
 *   // stop event propagation + prevent default
 *   return false;
 *
 *   // stop event propagation + return custom result
 *   return {
 *     complex: 'listening result'
 *   };
 * });
 *
 *
 * // listen with custom priority (default=1000, higher is better)
 * eventBus.on('priorityfoo', 1500, function(event) {
 *   console.log('invoked first!');
 * });
 *
 *
 * // listen for event and pass the context (`this`)
 * eventBus.on('foobar', function(event) {
 *   this.foo();
 * }, this);
 * ```
 *
 *
 * ## Emitting Events
 *
 * Events can be emitted via the event bus using {@link EventBus#fire}.
 *
 * ```javascript
 *
 * // false indicates that the default action
 * // was prevented by listeners
 * if (eventBus.fire('foo') === false) {
 *   console.log('default has been prevented!');
 * };
 *
 *
 * // custom args + return value listener
 * eventBus.on('sum', function(event, a, b) {
 *   return a + b;
 * });
 *
 * // you can pass custom arguments + retrieve result values.
 * var sum = eventBus.fire('sum', 1, 2);
 * console.log(sum); // 3
 * ```
 */

function EventBus() {
  this._listeners = {}; // cleanup on destroy on lowest priority to allow
  // message passing until the bitter end

  this.on('diagram.destroy', 1, this._destroy, this);
}
/**
 * Register an event listener for events with the given name.
 *
 * The callback will be invoked with `event, ...additionalArguments`
 * that have been passed to {@link EventBus#fire}.
 *
 * Returning false from a listener will prevent the events default action
 * (if any is specified). To stop an event from being processed further in
 * other listeners execute {@link Event#stopPropagation}.
 *
 * Returning anything but `undefined` from a listener will stop the listener propagation.
 *
 * @param {string|Array<string>} events
 * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
 * @param {Function} callback
 * @param {Object} [that] Pass context (`this`) to the callback
 */

EventBus.prototype.on = function (events, priority, callback, that) {
  events = minDash.isArray(events) ? events : [events];

  if (minDash.isFunction(priority)) {
    that = callback;
    callback = priority;
    priority = DEFAULT_PRIORITY;
  }

  if (!minDash.isNumber(priority)) {
    throw new Error('priority must be a number');
  }

  var actualCallback = callback;

  if (that) {
    actualCallback = minDash.bind(callback, that); // make sure we remember and are able to remove
    // bound callbacks via {@link #off} using the original
    // callback

    actualCallback[FN_REF] = callback[FN_REF] || callback;
  }

  var self = this;
  events.forEach(function (e) {
    self._addListener(e, {
      priority: priority,
      callback: actualCallback,
      next: null
    });
  });
};
/**
 * Register an event listener that is executed only once.
 *
 * @param {string} event the event name to register for
 * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
 * @param {Function} callback the callback to execute
 * @param {Object} [that] Pass context (`this`) to the callback
 */


EventBus.prototype.once = function (event, priority, callback, that) {
  var self = this;

  if (minDash.isFunction(priority)) {
    that = callback;
    callback = priority;
    priority = DEFAULT_PRIORITY;
  }

  if (!minDash.isNumber(priority)) {
    throw new Error('priority must be a number');
  }

  function wrappedCallback() {
    wrappedCallback.__isTomb = true;
    var result = callback.apply(that, arguments);
    self.off(event, wrappedCallback);
    return result;
  } // make sure we remember and are able to remove
  // bound callbacks via {@link #off} using the original
  // callback


  wrappedCallback[FN_REF] = callback;
  this.on(event, priority, wrappedCallback);
};
/**
 * Removes event listeners by event and callback.
 *
 * If no callback is given, all listeners for a given event name are being removed.
 *
 * @param {string|Array<string>} events
 * @param {Function} [callback]
 */


EventBus.prototype.off = function (events, callback) {
  events = minDash.isArray(events) ? events : [events];
  var self = this;
  events.forEach(function (event) {
    self._removeListener(event, callback);
  });
};
/**
 * Create an EventBus event.
 *
 * @param {Object} data
 *
 * @return {Object} event, recognized by the eventBus
 */


EventBus.prototype.createEvent = function (data) {
  var event = new InternalEvent();
  event.init(data);
  return event;
};
/**
 * Fires a named event.
 *
 * @example
 *
 * // fire event by name
 * events.fire('foo');
 *
 * // fire event object with nested type
 * var event = { type: 'foo' };
 * events.fire(event);
 *
 * // fire event with explicit type
 * var event = { x: 10, y: 20 };
 * events.fire('element.moved', event);
 *
 * // pass additional arguments to the event
 * events.on('foo', function(event, bar) {
 *   alert(bar);
 * });
 *
 * events.fire({ type: 'foo' }, 'I am bar!');
 *
 * @param {string} [name] the optional event name
 * @param {Object} [event] the event object
 * @param {...Object} additional arguments to be passed to the callback functions
 *
 * @return {boolean} the events return value, if specified or false if the
 *                   default action was prevented by listeners
 */


EventBus.prototype.fire = function (type, data) {
  var event, firstListener, returnValue, args;
  args = slice.call(arguments);

  if (typeof type === 'object') {
    data = type;
    type = data.type;
  }

  if (!type) {
    throw new Error('no event type specified');
  }

  firstListener = this._listeners[type];

  if (!firstListener) {
    return;
  } // we make sure we fire instances of our home made
  // events here. We wrap them only once, though


  if (data instanceof InternalEvent) {
    // we are fine, we alread have an event
    event = data;
  } else {
    event = this.createEvent(data);
  } // ensure we pass the event as the first parameter


  args[0] = event; // original event type (in case we delegate)

  var originalType = event.type; // update event type before delegation

  if (type !== originalType) {
    event.type = type;
  }

  try {
    returnValue = this._invokeListeners(event, args, firstListener);
  } finally {
    // reset event type after delegation
    if (type !== originalType) {
      event.type = originalType;
    }
  } // set the return value to false if the event default
  // got prevented and no other return value exists


  if (returnValue === undefined && event.defaultPrevented) {
    returnValue = false;
  }

  return returnValue;
};

EventBus.prototype.handleError = function (error) {
  return this.fire('error', {
    error: error
  }) === false;
};

EventBus.prototype._destroy = function () {
  this._listeners = {};
};

EventBus.prototype._invokeListeners = function (event, args, listener) {
  var returnValue;

  while (listener) {
    // handle stopped propagation
    if (event.cancelBubble) {
      break;
    }

    returnValue = this._invokeListener(event, args, listener);
    listener = listener.next;
  }

  return returnValue;
};

EventBus.prototype._invokeListener = function (event, args, listener) {
  var returnValue;

  if (listener.callback.__isTomb) {
    return returnValue;
  }

  try {
    // returning false prevents the default action
    returnValue = invokeFunction(listener.callback, args); // stop propagation on return value

    if (returnValue !== undefined) {
      event.returnValue = returnValue;
      event.stopPropagation();
    } // prevent default on return false


    if (returnValue === false) {
      event.preventDefault();
    }
  } catch (error) {
    if (!this.handleError(error)) {
      console.error('unhandled error in event listener', error);
      throw error;
    }
  }

  return returnValue;
};
/*
 * Add new listener with a certain priority to the list
 * of listeners (for the given event).
 *
 * The semantics of listener registration / listener execution are
 * first register, first serve: New listeners will always be inserted
 * after existing listeners with the same priority.
 *
 * Example: Inserting two listeners with priority 1000 and 1300
 *
 *    * before: [ 1500, 1500, 1000, 1000 ]
 *    * after: [ 1500, 1500, (new=1300), 1000, 1000, (new=1000) ]
 *
 * @param {string} event
 * @param {Object} listener { priority, callback }
 */


EventBus.prototype._addListener = function (event, newListener) {
  var listener = this._getListeners(event),
      previousListener; // no prior listeners


  if (!listener) {
    this._setListeners(event, newListener);

    return;
  } // ensure we order listeners by priority from
  // 0 (high) to n > 0 (low)


  while (listener) {
    if (listener.priority < newListener.priority) {
      newListener.next = listener;

      if (previousListener) {
        previousListener.next = newListener;
      } else {
        this._setListeners(event, newListener);
      }

      return;
    }

    previousListener = listener;
    listener = listener.next;
  } // add new listener to back


  previousListener.next = newListener;
};

EventBus.prototype._getListeners = function (name) {
  return this._listeners[name];
};

EventBus.prototype._setListeners = function (name, listener) {
  this._listeners[name] = listener;
};

EventBus.prototype._removeListener = function (event, callback) {
  var listener = this._getListeners(event),
      nextListener,
      previousListener,
      listenerCallback;

  if (!callback) {
    // clear listeners
    this._setListeners(event, null);

    return;
  }

  while (listener) {
    nextListener = listener.next;
    listenerCallback = listener.callback;

    if (listenerCallback === callback || listenerCallback[FN_REF] === callback) {
      if (previousListener) {
        previousListener.next = nextListener;
      } else {
        // new first listener
        this._setListeners(event, nextListener);
      }
    }

    previousListener = listener;
    listener = nextListener;
  }
};
/**
 * A event that is emitted via the event bus.
 */


function InternalEvent() {}

InternalEvent.prototype.stopPropagation = function () {
  this.cancelBubble = true;
};

InternalEvent.prototype.preventDefault = function () {
  this.defaultPrevented = true;
};

InternalEvent.prototype.init = function (data) {
  minDash.assign(this, data || {});
};
/**
 * Invoke function. Be fast...
 *
 * @param {Function} fn
 * @param {Array<Object>} args
 *
 * @return {Any}
 */


function invokeFunction(fn, args) {
  return fn.apply(null, args);
}

class Validator {
  validateField(field, value) {
    const {
      validate
    } = field;
    let errors = [];

    if (!validate) {
      return errors;
    }

    if (validate.pattern && value && !new RegExp(validate.pattern).test(value)) {
      errors = [...errors, `Field must match pattern ${validate.pattern}.`];
    }

    if (validate.required && (minDash.isNil(value) || value === '')) {
      errors = [...errors, 'Field is required.'];
    }

    if ('min' in validate && value && value < validate.min) {
      errors = [...errors, `Field must have minimum value of ${validate.min}.`];
    }

    if ('max' in validate && value && value > validate.max) {
      errors = [...errors, `Field must have maximum value of ${validate.max}.`];
    }

    if ('minLength' in validate && value && value.trim().length < validate.minLength) {
      errors = [...errors, `Field must have minimum length of ${validate.minLength}.`];
    }

    if ('maxLength' in validate && value && value.trim().length > validate.maxLength) {
      errors = [...errors, `Field must have maximum length of ${validate.maxLength}.`];
    }

    return errors;
  }

}

class FormFieldRegistry {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._formFields = {};
    eventBus.on('form.clear', () => this.clear());
    this._ids = new Ids__default['default']([32, 36, 1]);
    this._keys = new Ids__default['default']([32, 36, 1]);
  }

  add(formField) {
    const {
      id
    } = formField;

    if (this._formFields[id]) {
      throw new Error(`form field with ID ${id} already exists`);
    }

    this._eventBus.fire('formField.add', {
      formField
    });

    this._formFields[id] = formField;
  }

  remove(formField) {
    const {
      id
    } = formField;

    if (!this._formFields[id]) {
      return;
    }

    this._eventBus.fire('formField.remove', {
      formField
    });

    delete this._formFields[id];
  }

  get(id) {
    return this._formFields[id];
  }

  getAll() {
    return Object.values(this._formFields);
  }

  forEach(callback) {
    this.getAll().forEach(formField => callback(formField));
  }

  clear() {
    this._formFields = {};

    this._ids.clear();

    this._keys.clear();
  }

}
FormFieldRegistry.$inject = ['eventBus'];

class Importer {
  /**
   * @constructor
   * @param { import('../core').FormFieldRegistry } formFieldRegistry
   * @param { import('../render/FormFields').default } formFields
   */
  constructor(formFieldRegistry, formFields) {
    this._formFieldRegistry = formFieldRegistry;
    this._formFields = formFields;
  }
  /**
   * Import schema adding `id`, `_parent` and `_path`
   * information to each field and adding it to the
   * form field registry.
   *
   * @param {any} schema
   * @param {any} [data]
   *
   * @return { { warnings: Array<any>, schema: any, data: any } }
   */


  importSchema(schema, data = {}) {
    // TODO: Add warnings
    const warnings = [];

    try {
      const importedSchema = this.importFormField(clone(schema)),
            importedData = this.importData(clone(data));
      return {
        warnings,
        schema: importedSchema,
        data: importedData
      };
    } catch (err) {
      err.warnings = warnings;
      throw err;
    }
  }
  /**
   * @param {any} formField
   * @param {string} [parentId]
   *
   * @return {any} importedField
   */


  importFormField(formField, parentId) {
    const {
      components,
      key,
      type,
      id = generateIdForType(type)
    } = formField;

    if (parentId) {
      // set form field parent
      formField._parent = parentId;
    }

    if (!this._formFields.get(type)) {
      throw new Error(`form field of type <${type}> not supported`);
    }

    if (key) {
      // validate <key> uniqueness
      if (this._formFieldRegistry._keys.assigned(key)) {
        throw new Error(`form field with key <${key}> already exists`);
      }

      this._formFieldRegistry._keys.claim(key, formField); // TODO: buttons should not have key


      if (type !== 'button') {
        // set form field path
        formField._path = [key];
      }
    }

    if (id) {
      // validate <id> uniqueness
      if (this._formFieldRegistry._ids.assigned(id)) {
        throw new Error(`form field with id <${id}> already exists`);
      }

      this._formFieldRegistry._ids.claim(id, formField);
    } // set form field ID


    formField.id = id;

    this._formFieldRegistry.add(formField);

    if (components) {
      this.importFormFields(components, id);
    }

    return formField;
  }

  importFormFields(components, parentId) {
    components.forEach(component => {
      this.importFormField(component, parentId);
    });
  }
  /**
   * @param {Object} data
   *
   * @return {Object} importedData
   */


  importData(data) {
    return this._formFieldRegistry.getAll().reduce((importedData, formField) => {
      const {
        defaultValue,
        _path,
        type
      } = formField;

      if (!_path) {
        return importedData;
      } // (1) try to get value from data
      // (2) try to get default value from form field
      // (3) get empty value from form field


      return { ...importedData,
        [_path[0]]: minDash.get(data, _path, minDash.isUndefined(defaultValue) ? this._formFields.get(type).emptyValue : defaultValue)
      };
    }, {});
  }

}
Importer.$inject = ['formFieldRegistry', 'formFields'];

var importModule = {
  importer: ['type', Importer]
};

const NODE_TYPE_TEXT = 3,
      NODE_TYPE_ELEMENT = 1;
const ALLOWED_NODES = ['h1', 'h2', 'h3', 'h4', 'h5', 'span', 'em', 'a', 'p', 'div', 'ul', 'ol', 'li', 'hr', 'blockquote', 'img', 'pre', 'code', 'br', 'strong'];
const ALLOWED_ATTRIBUTES = ['align', 'alt', 'class', 'href', 'id', 'name', 'rel', 'target', 'src'];
const ALLOWED_URI_PATTERN = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i; // eslint-disable-line no-useless-escape

const ATTR_WHITESPACE_PATTERN = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g; // eslint-disable-line no-control-regex

const FORM_ELEMENT = document.createElement('form');
/**
 * Sanitize a HTML string and return the cleaned, safe version.
 *
 * @param {string} html
 * @return {string}
 */

function sanitizeHTML(html) {
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html>\n<html><body><div>${html}`, 'text/html');
  doc.normalize();
  const element = doc.body.firstChild;

  if (element) {
    sanitizeNode(
    /** @type Element */
    element);
    return new XMLSerializer().serializeToString(element);
  } else {
    // handle the case that document parsing
    // does not work at all, due to HTML gibberish
    return '';
  }
}
/**
 * Recursively sanitize a HTML node, potentially
 * removing it, its children or attributes.
 *
 * Inspired by https://github.com/developit/snarkdown/issues/70
 * and https://github.com/cure53/DOMPurify. Simplified
 * for our use-case.
 *
 * @param {Element} node
 */

function sanitizeNode(node) {
  // allow text nodes
  if (node.nodeType === NODE_TYPE_TEXT) {
    return;
  } // disallow all other nodes but Element


  if (node.nodeType !== NODE_TYPE_ELEMENT) {
    return node.remove();
  }

  const lcTag = node.tagName.toLowerCase(); // disallow non-whitelisted tags

  if (!ALLOWED_NODES.includes(lcTag)) {
    return node.remove();
  }

  const attributes = node.attributes; // clean attributes

  for (let i = attributes.length; i--;) {
    const attribute = attributes[i];
    const name = attribute.name;
    const lcName = name.toLowerCase(); // normalize node value

    const value = attribute.value.trim();
    node.removeAttribute(name);
    const valid = isValidAttribute(lcTag, lcName, value);

    if (valid) {
      node.setAttribute(name, value);
    }
  } // force noopener on target="_blank" links


  if (lcTag === 'a' && node.getAttribute('target') === '_blank' && node.getAttribute('rel') !== 'noopener') {
    node.setAttribute('rel', 'noopener');
  }

  for (let i = node.childNodes.length; i--;) {
    sanitizeNode(
    /** @type Element */
    node.childNodes[i]);
  }
}
/**
 * Validates attributes for validity.
 *
 * @param {string} lcTag
 * @param {string} lcName
 * @param {string} value
 * @return {boolean}
 */


function isValidAttribute(lcTag, lcName, value) {
  // disallow most attributes based on whitelist
  if (!ALLOWED_ATTRIBUTES.includes(lcName)) {
    return false;
  } // disallow "DOM clobbering" / polution of document and wrapping form elements


  if ((lcName === 'id' || lcName === 'name') && (value in document || value in FORM_ELEMENT)) {
    return false;
  }

  if (lcName === 'target' && value !== '_blank') {
    return false;
  } // allow valid url links only


  if (lcName === 'href' && !ALLOWED_URI_PATTERN.test(value.replace(ATTR_WHITESPACE_PATTERN, ''))) {
    return false;
  }

  return true;
}

function formFieldClasses(type, errors = []) {
  if (!type) {
    throw new Error('type required');
  }

  const classes = ['fjs-form-field', `fjs-form-field-${type}`];

  if (errors.length) {
    classes.push('fjs-has-errors');
  }

  return classes.join(' ');
}
function prefixId(id, formId) {
  if (formId) {
    return `fjs-form-${formId}-${id}`;
  }

  return `fjs-form-${id}`;
}
function markdownToHTML(markdown) {
  const htmls = markdown.split(/(?:\r?\n){2,}/).map(line => /^((\d+.)|[><\s#-*])/.test(line) ? snarkdown__default['default'](line) : `<p>${snarkdown__default['default'](line)}</p>`);
  return htmls.join('\n\n');
} // see https://github.com/developit/snarkdown/issues/70

function safeMarkdown(markdown) {
  const html = markdownToHTML(markdown);
  return sanitizeHTML(html);
}

const type$6 = 'button';
function Button(props) {
  const {
    disabled,
    field
  } = props;
  const {
    action = 'submit'
  } = field;
  return jsxRuntime.jsx("div", {
    class: formFieldClasses(type$6),
    children: jsxRuntime.jsx("button", {
      class: "fjs-button",
      type: action,
      disabled: disabled,
      children: field.label
    })
  });
}

Button.create = function (options = {}) {
  return {
    action: 'submit',
    ...options
  };
};

Button.type = type$6;
Button.label = 'Button';
Button.keyed = true;

const FormRenderContext = preact.createContext({
  Empty: props => {
    return null;
  },
  Children: props => {
    return props.children;
  },
  Element: props => {
    return props.children;
  }
});

/**
 * @param {string} type
 * @param {boolean} [strict]
 *
 * @returns {any}
 */

function getService(type, strict) {}

const FormContext = preact.createContext({
  getService,
  formId: null
});

function Description(props) {
  const {
    description
  } = props;

  if (!description) {
    return null;
  }

  return jsxRuntime.jsx("div", {
    class: "fjs-form-field-description",
    children: description
  });
}

function Errors(props) {
  const {
    errors
  } = props;

  if (!errors.length) {
    return null;
  }

  return jsxRuntime.jsx("div", {
    class: "fjs-form-field-error",
    children: jsxRuntime.jsx("ul", {
      children: errors.map(error => {
        return jsxRuntime.jsx("li", {
          children: error
        });
      })
    })
  });
}

function Label(props) {
  const {
    id,
    label,
    required = false
  } = props;
  return jsxRuntime.jsxs("label", {
    for: id,
    class: "fjs-form-field-label",
    children: [props.children, label || '', required && jsxRuntime.jsx("span", {
      class: "fjs-asterix",
      children: "*"
    })]
  });
}

const type$5 = 'checkbox';
function Checkbox(props) {
  const {
    disabled,
    errors = [],
    field,
    value = false
  } = props;
  const {
    description,
    id,
    label
  } = field;

  const onChange = ({
    target
  }) => {
    props.onChange({
      field,
      value: target.checked
    });
  };

  const {
    formId
  } = hooks.useContext(FormContext);
  return jsxRuntime.jsxs("div", {
    class: formFieldClasses(type$5, errors),
    children: [jsxRuntime.jsx(Label, {
      id: prefixId(id, formId),
      label: label,
      required: false,
      children: jsxRuntime.jsx("input", {
        checked: value,
        class: "fjs-input",
        disabled: disabled,
        id: prefixId(id, formId),
        type: "checkbox",
        onChange: onChange
      })
    }), jsxRuntime.jsx(Description, {
      description: description
    }), jsxRuntime.jsx(Errors, {
      errors: errors
    })]
  });
}

Checkbox.create = function (options = {}) {
  return { ...options
  };
};

Checkbox.type = type$5;
Checkbox.label = 'Checkbox';
Checkbox.keyed = true;
Checkbox.emptyValue = false;

function useService (type, strict) {
  const {
    getService
  } = hooks.useContext(FormContext);
  return getService(type, strict);
}

const noop$1 = () => false;

function FormField(props) {
  const {
    field,
    onChange
  } = props;
  const {
    _path
  } = field;
  const formFields = useService('formFields'),
        form = useService('form');

  const {
    data,
    errors,
    properties
  } = form._getState();

  const {
    Element
  } = hooks.useContext(FormRenderContext);
  const FormFieldComponent = formFields.get(field.type);

  if (!FormFieldComponent) {
    throw new Error(`cannot render field <${field.type}>`);
  }

  const value = minDash.get(data, _path);
  const fieldErrors = findErrors(errors, _path);
  const disabled = properties.readOnly || field.disabled || false;
  return jsxRuntime.jsx(Element, {
    field: field,
    children: jsxRuntime.jsx(FormFieldComponent, { ...props,
      disabled: disabled,
      errors: fieldErrors,
      onChange: disabled ? noop$1 : onChange,
      value: value
    })
  });
}

function Default(props) {
  const {
    Children,
    Empty
  } = hooks.useContext(FormRenderContext);
  const {
    field
  } = props;
  const {
    components = []
  } = field;
  return jsxRuntime.jsxs(Children, {
    class: "fjs-vertical-layout",
    field: field,
    children: [components.map(childField => {
      return preact.createElement(FormField, { ...props,
        key: childField.id,
        field: childField
      });
    }), components.length ? null : jsxRuntime.jsx(Empty, {})]
  });
}

Default.create = function (options = {}) {
  return {
    components: [],
    ...options
  };
};

Default.type = 'default';
Default.keyed = false;

/**
 * This file must not be changed or exchanged.
 *
 * @see http://bpmn.io/license for more information.
 */

function Logo() {
  return jsxRuntime.jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 14.02 5.57",
    width: "53",
    height: "21",
    style: "vertical-align:middle",
    children: [jsxRuntime.jsx("path", {
      fill: "currentColor",
      d: "M1.88.92v.14c0 .41-.13.68-.4.8.33.14.46.44.46.86v.33c0 .61-.33.95-.95.95H0V0h.95c.65 0 .93.3.93.92zM.63.57v1.06h.24c.24 0 .38-.1.38-.43V.98c0-.28-.1-.4-.32-.4zm0 1.63v1.22h.36c.2 0 .32-.1.32-.39v-.35c0-.37-.12-.48-.4-.48H.63zM4.18.99v.52c0 .64-.31.98-.94.98h-.3V4h-.62V0h.92c.63 0 .94.35.94.99zM2.94.57v1.35h.3c.2 0 .3-.09.3-.37v-.6c0-.29-.1-.38-.3-.38h-.3zm2.89 2.27L6.25 0h.88v4h-.6V1.12L6.1 3.99h-.6l-.46-2.82v2.82h-.55V0h.87zM8.14 1.1V4h-.56V0h.79L9 2.4V0h.56v4h-.64zm2.49 2.29v.6h-.6v-.6zM12.12 1c0-.63.33-1 .95-1 .61 0 .95.37.95 1v2.04c0 .64-.34 1-.95 1-.62 0-.95-.37-.95-1zm.62 2.08c0 .28.13.39.33.39s.32-.1.32-.4V.98c0-.29-.12-.4-.32-.4s-.33.11-.33.4z"
    }), jsxRuntime.jsx("path", {
      fill: "currentColor",
      d: "M0 4.53h14.02v1.04H0zM11.08 0h.63v.62h-.63zm.63 4V1h-.63v2.98z"
    })]
  });
}

function Lightbox(props) {
  const {
    open
  } = props;

  if (!open) {
    return null;
  }

  return jsxRuntime.jsxs("div", {
    class: "fjs-powered-by-lightbox",
    style: "z-index: 100; position: fixed; top: 0; left: 0;right: 0; bottom: 0",
    children: [jsxRuntime.jsx("div", {
      class: "backdrop",
      style: "width: 100%; height: 100%; background: rgba(40 40 40 / 20%)",
      onClick: props.onBackdropClick
    }), jsxRuntime.jsxs("div", {
      class: "notice",
      style: "position: absolute; left: 50%; top: 40%; transform: translate(-50%); width: 260px; padding: 10px; background: white; box-shadow: 0  1px 4px rgba(0 0 0 / 30%); font-family: Helvetica, Arial, sans-serif; font-size: 14px; display: flex; line-height: 1.3",
      children: [jsxRuntime.jsx("a", {
        href: "https://bpmn.io",
        target: "_blank",
        rel: "noopener",
        style: "margin: 15px 20px 15px 10px; align-self: center; color: #404040",
        children: jsxRuntime.jsx(Logo, {})
      }), jsxRuntime.jsxs("span", {
        children: ["Web-based tooling for BPMN, DMN, and forms powered by ", jsxRuntime.jsx("a", {
          href: "https://bpmn.io",
          target: "_blank",
          rel: "noopener",
          children: "bpmn.io"
        }), "."]
      })]
    })]
  });
}

function Link(props) {
  return jsxRuntime.jsx("div", {
    class: "fjs-powered-by fjs-form-field",
    style: "text-align: right",
    children: jsxRuntime.jsx("a", {
      href: "https://bpmn.io",
      target: "_blank",
      rel: "noopener",
      class: "fjs-powered-by-link",
      title: "Powered by bpmn.io",
      style: "color: #404040",
      onClick: props.onClick,
      children: jsxRuntime.jsx(Logo, {})
    })
  });
}

function PoweredBy(props) {
  const [open, setOpen] = hooks.useState(false);

  function toggleOpen(open) {
    return event => {
      event.preventDefault();
      setOpen(open);
    };
  }

  return jsxRuntime.jsxs(preact.Fragment, {
    children: [compat.createPortal(jsxRuntime.jsx(Lightbox, {
      open: open,
      onBackdropClick: toggleOpen(false)
    }), document.body), jsxRuntime.jsx(Link, {
      onClick: toggleOpen(true)
    })]
  });
}

const noop = () => {};

function FormComponent(props) {
  const form = useService('form');

  const {
    schema
  } = form._getState();

  const {
    onSubmit = noop,
    onReset = noop,
    onChange = noop
  } = props;

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit();
  };

  const handleReset = event => {
    event.preventDefault();
    onReset();
  };

  return jsxRuntime.jsxs("form", {
    class: "fjs-form",
    onSubmit: handleSubmit,
    onReset: handleReset,
    children: [jsxRuntime.jsx(FormField, {
      field: schema,
      onChange: onChange
    }), jsxRuntime.jsx(PoweredBy, {})]
  });
}

const type$4 = 'number';
function Number(props) {
  const {
    disabled,
    errors = [],
    field,
    value
  } = props;
  const {
    description,
    id,
    label,
    validate = {}
  } = field;
  const {
    required
  } = validate;

  const onChange = ({
    target
  }) => {
    const parsedValue = parseInt(target.value, 10);
    props.onChange({
      field,
      value: isNaN(parsedValue) ? null : parsedValue
    });
  };

  const {
    formId
  } = hooks.useContext(FormContext);
  return jsxRuntime.jsxs("div", {
    class: formFieldClasses(type$4, errors),
    children: [jsxRuntime.jsx(Label, {
      id: prefixId(id, formId),
      label: label,
      required: required
    }), jsxRuntime.jsx("input", {
      class: "fjs-input",
      disabled: disabled,
      id: prefixId(id, formId),
      onInput: onChange,
      type: "number",
      value: value || ''
    }), jsxRuntime.jsx(Description, {
      description: description
    }), jsxRuntime.jsx(Errors, {
      errors: errors
    })]
  });
}

Number.create = function (options = {}) {
  return { ...options
  };
};

Number.type = type$4;
Number.keyed = true;
Number.label = 'Number';
Number.emptyValue = null;

const type$3 = 'radio';
function Radio(props) {
  const {
    disabled,
    errors = [],
    field,
    value
  } = props;
  const {
    description,
    id,
    label,
    validate = {},
    values
  } = field;
  const {
    required
  } = validate;

  const onChange = v => {
    props.onChange({
      field,
      value: v
    });
  };

  const {
    formId
  } = hooks.useContext(FormContext);
  return jsxRuntime.jsxs("div", {
    class: formFieldClasses(type$3, errors),
    children: [jsxRuntime.jsx(Label, {
      label: label,
      required: required
    }), values.map((v, index) => {
      return jsxRuntime.jsx(Label, {
        id: prefixId(`${id}-${index}`, formId),
        label: v.label,
        required: false,
        children: jsxRuntime.jsx("input", {
          checked: v.value === value,
          class: "fjs-input",
          disabled: disabled,
          id: prefixId(`${id}-${index}`, formId),
          type: "radio",
          onClick: () => onChange(v.value)
        })
      }, `${id}-${index}`);
    }), jsxRuntime.jsx(Description, {
      description: description
    }), jsxRuntime.jsx(Errors, {
      errors: errors
    })]
  });
}

Radio.create = function (options = {}) {
  return {
    values: [{
      label: 'Value',
      value: 'value'
    }],
    ...options
  };
};

Radio.type = type$3;
Radio.label = 'Radio';
Radio.keyed = true;
Radio.emptyValue = null;

const type$2 = 'select';
function Select(props) {
  const {
    disabled,
    errors = [],
    field,
    value
  } = props;
  const {
    description,
    id,
    label,
    validate = {},
    values
  } = field;
  const {
    required
  } = validate;

  const onChange = ({
    target
  }) => {
    props.onChange({
      field,
      value: target.value === '' ? null : target.value
    });
  };

  const {
    formId
  } = hooks.useContext(FormContext);
  return jsxRuntime.jsxs("div", {
    class: formFieldClasses(type$2, errors),
    children: [jsxRuntime.jsx(Label, {
      id: prefixId(id, formId),
      label: label,
      required: required
    }), jsxRuntime.jsxs("select", {
      class: "fjs-select",
      disabled: disabled,
      id: prefixId(id, formId),
      onChange: onChange,
      value: value || '',
      children: [jsxRuntime.jsx("option", {
        value: ""
      }), values.map((v, index) => {
        return jsxRuntime.jsx("option", {
          value: v.value,
          children: v.label
        }, `${id}-${index}`);
      })]
    }), jsxRuntime.jsx(Description, {
      description: description
    }), jsxRuntime.jsx(Errors, {
      errors: errors
    })]
  });
}

Select.create = function (options = {}) {
  return {
    values: [{
      label: 'Value',
      value: 'value'
    }],
    ...options
  };
};

Select.type = type$2;
Select.label = 'Select';
Select.keyed = true;
Select.emptyValue = null;

const type$1 = 'text';
function Text(props) {
  const {
    field
  } = props;
  const {
    text = ''
  } = field;
  return jsxRuntime.jsx("div", {
    class: formFieldClasses(type$1),
    children: jsxRuntime.jsx(Markup__default['default'], {
      markup: safeMarkdown(text),
      trim: false
    })
  });
}

Text.create = function (options = {}) {
  return {
    text: '# Text',
    ...options
  };
};

Text.type = type$1;
Text.keyed = false;

const type = 'textfield';
function Textfield(props) {
  const {
    disabled,
    errors = [],
    field,
    value = ''
  } = props;
  const {
    description,
    id,
    label,
    validate = {}
  } = field;
  const {
    required
  } = validate;

  const onChange = ({
    target
  }) => {
    props.onChange({
      field,
      value: target.value
    });
  };

  const {
    formId
  } = hooks.useContext(FormContext);
  return jsxRuntime.jsxs("div", {
    class: formFieldClasses(type, errors),
    children: [jsxRuntime.jsx(Label, {
      id: prefixId(id, formId),
      label: label,
      required: required
    }), jsxRuntime.jsx("input", {
      class: "fjs-input",
      disabled: disabled,
      id: prefixId(id, formId),
      onInput: onChange,
      type: "text",
      value: value
    }), jsxRuntime.jsx(Description, {
      description: description
    }), jsxRuntime.jsx(Errors, {
      errors: errors
    })]
  });
}

Textfield.create = function (options = {}) {
  return { ...options
  };
};

Textfield.type = type;
Textfield.label = 'Text Field';
Textfield.keyed = true;
Textfield.emptyValue = '';

const formFields = [Button, Checkbox, Default, Number, Radio, Select, Text, Textfield];

class FormFields {
  constructor() {
    this._formFields = {};
    formFields.forEach(formField => {
      const {
        type
      } = formField;
      this.register(type, formField);
    });
  }

  register(type, formField) {
    this._formFields[type] = formField;
  }

  get(type) {
    return this._formFields[type];
  }

}

function Renderer(config, eventBus, form, injector) {
  const App = () => {
    const [state, setState] = hooks.useState(form._getState());
    const formContext = {
      getService(type, strict = true) {
        return injector.get(type, strict);
      },

      formId: form._id
    };
    eventBus.on('changed', newState => {
      setState(newState);
    });
    const onChange = hooks.useCallback(update => form._update(update), [form]);
    const {
      properties
    } = state;
    const {
      readOnly
    } = properties;
    const onSubmit = hooks.useCallback(() => {
      if (!readOnly) {
        form.submit();
      }
    }, [form, readOnly]);
    const onReset = hooks.useCallback(() => form.reset(), [form]);
    const {
      schema
    } = state;

    if (!schema) {
      return null;
    }

    return jsxRuntime.jsx(FormContext.Provider, {
      value: formContext,
      children: jsxRuntime.jsx(FormComponent, {
        onChange: onChange,
        onSubmit: onSubmit,
        onReset: onReset
      })
    });
  };

  const {
    container
  } = config;
  eventBus.on('form.init', () => {
    preact.render(jsxRuntime.jsx(App, {}), container);
  });
  eventBus.on('form.destroy', () => {
    preact.render(null, container);
  });
}
Renderer.$inject = ['config.renderer', 'eventBus', 'form', 'injector'];

var renderModule = {
  __init__: ['formFields', 'renderer'],
  formFields: ['type', FormFields],
  renderer: ['type', Renderer]
};

var core = {
  __depends__: [importModule, renderModule],
  eventBus: ['type', EventBus],
  formFieldRegistry: ['type', FormFieldRegistry],
  validator: ['type', Validator]
};

/**
 * @typedef { import('./types').Injector } Injector
 * @typedef { import('./types').Data } Data
 * @typedef { import('./types').Errors } Errors
 * @typedef { import('./types').Schema } Schema
 * @typedef { import('./types').FormProperties } FormProperties
 * @typedef { import('./types').FormProperty } FormProperty
 * @typedef { import('./types').FormEvent } FormEvent
 * @typedef { import('./types').FormOptions } FormOptions
 *
 * @typedef { {
 *   data: Data,
 *   initialData: Data,
 *   errors: Errors,
 *   properties: FormProperties,
 *   schema: Schema
 * } } State
 */

const ids = new Ids__default['default']([32, 36, 1]);
/**
 * The form.
 */

class Form {
  /**
   * @constructor
   * @param {FormOptions} options
   */
  constructor(options = {}) {
    /**
     * @public
     * @type {String}
     */
    this._id = ids.next();
    /**
     * @private
     * @type {Element}
     */

    this._container = createFormContainer();
    const {
      container,
      injector = this._createInjector(options, this._container),
      properties = {}
    } = options;
    /**
     * @private
     * @type {State}
     */

    this._state = {
      initialData: null,
      data: null,
      properties,
      errors: {},
      schema: null
    };
    this.get = injector.get;
    this.invoke = injector.invoke;
    this.get('eventBus').fire('form.init');

    if (container) {
      this.attachTo(container);
    }
  }

  clear() {
    // clear form services
    this._emit('diagram.clear'); // clear diagram services (e.g. EventBus)


    this._emit('form.clear');
  }
  /**
   * Destroy the form, removing it from DOM,
   * if attached.
   */


  destroy() {
    // destroy form services
    this.get('eventBus').fire('form.destroy'); // destroy diagram services (e.g. EventBus)

    this.get('eventBus').fire('diagram.destroy');

    this._detach(false);
  }
  /**
   * Open a form schema with the given initial data.
   *
   * @param {Schema} schema
   * @param {Data} [data]
   *
   * @return Promise<{ warnings: Array<any> }>
   */


  importSchema(schema, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.clear();
        const {
          schema: importedSchema,
          data: importedData,
          warnings
        } = this.get('importer').importSchema(schema, data);

        this._setState({
          data: importedData,
          errors: {},
          schema: importedSchema,
          initialData: clone(importedData)
        });

        this._emit('import.done', {
          warnings
        });

        return resolve({
          warnings
        });
      } catch (error) {
        this._emit('import.done', {
          error,
          warnings: error.warnings || []
        });

        return reject(error);
      }
    });
  }
  /**
   * Submit the form, triggering all field validations.
   *
   * @returns { { data: Data, errors: Errors } }
   */


  submit() {
    const {
      properties
    } = this._getState();

    if (properties.readOnly) {
      throw new Error('form is read-only');
    }

    const formFieldRegistry = this.get('formFieldRegistry');
    const data = formFieldRegistry.getAll().reduce((data, field) => {
      const {
        disabled,
        _path
      } = field; // do not submit disabled form fields

      if (disabled || !_path) {
        return data;
      }

      const value = minDash.get(this._getState().data, _path);
      return { ...data,
        [_path[0]]: value
      };
    }, {});
    const errors = this.validate();

    this._emit('submit', {
      data,
      errors
    });

    return {
      data,
      errors
    };
  }

  reset() {
    this._emit('reset');

    this._setState({
      data: clone(this._state.initialData),
      errors: {}
    });
  }
  /**
   * @returns {Errors}
   */


  validate() {
    const formFieldRegistry = this.get('formFieldRegistry'),
          validator = this.get('validator');

    const {
      data
    } = this._getState();

    const errors = formFieldRegistry.getAll().reduce((errors, field) => {
      const {
        disabled,
        _path
      } = field;

      if (disabled) {
        return errors;
      }

      const value = minDash.get(data, _path);
      const fieldErrors = validator.validateField(field, value);
      return minDash.set(errors, [pathStringify(_path)], fieldErrors.length ? fieldErrors : undefined);
    },
    /** @type {Errors} */
    {});

    this._setState({
      errors
    });

    return errors;
  }
  /**
   * @param {Element|string} parentNode
   */


  attachTo(parentNode) {
    if (!parentNode) {
      throw new Error('parentNode required');
    }

    this.detach();

    if (minDash.isString(parentNode)) {
      parentNode = document.querySelector(parentNode);
    }

    const container = this._container;
    parentNode.appendChild(container);

    this._emit('attach');
  }

  detach() {
    this._detach();
  }
  /**
   * @private
   *
   * @param {boolean} [emit]
   */


  _detach(emit = true) {
    const container = this._container,
          parentNode = container.parentNode;

    if (!parentNode) {
      return;
    }

    if (emit) {
      this._emit('detach');
    }

    parentNode.removeChild(container);
  }
  /**
   * @param {FormProperty} property
   * @param {any} value
   */


  setProperty(property, value) {
    const properties = minDash.set(this._getState().properties, [property], value);

    this._setState({
      properties
    });
  }
  /**
   * @param {FormEvent} type
   * @param {number} priority
   * @param {Function} handler
   */


  on(type, priority, handler) {
    this.get('eventBus').on(type, priority, handler);
  }
  /**
   * @param {FormEvent} type
   * @param {Function} handler
   */


  off(type, handler) {
    this.get('eventBus').off(type, handler);
  }
  /**
   * @private
   *
   * @param {FormOptions} options
   * @param {Element} container
   *
   * @returns {Injector}
   */


  _createInjector(options, container) {
    const {
      additionalModules = [],
      modules = []
    } = options;
    const config = {
      renderer: {
        container
      }
    };
    return createInjector([{
      config: ['value', config]
    }, {
      form: ['value', this]
    }, core, ...modules, ...additionalModules]);
  }
  /**
   * @private
   */


  _emit(type, data) {
    this.get('eventBus').fire(type, data);
  }
  /**
   * @internal
   *
   * @param { { add?: boolean, field: any, remove?: number, value?: any } } update
   */


  _update(update) {
    const {
      field,
      value
    } = update;
    const {
      _path
    } = field;

    let {
      data,
      errors
    } = this._getState();

    const validator = this.get('validator');
    const fieldErrors = validator.validateField(field, value);
    minDash.set(data, _path, value);
    minDash.set(errors, [pathStringify(_path)], fieldErrors.length ? fieldErrors : undefined);

    this._setState({
      data: clone(data),
      errors: clone(errors)
    });
  }
  /**
   * @internal
   */


  _getState() {
    return this._state;
  }
  /**
   * @internal
   */


  _setState(state) {
    this._state = { ...this._state,
      ...state
    };

    this._emit('changed', this._getState());
  }

}

const schemaVersion = 4;
/**
 * @typedef { import('./types').CreateFormOptions } CreateFormOptions
 */

/**
 * Create a form.
 *
 * @param {CreateFormOptions} options
 *
 * @return {Promise<Form>}
 */

function createForm(options) {
  const {
    data,
    schema,
    ...rest
  } = options;
  const form = new Form(rest);
  return form.importSchema(schema, data).then(function () {
    return form;
  });
}

exports.Button = Button;
exports.Checkbox = Checkbox;
exports.Default = Default;
exports.Form = Form;
exports.FormComponent = FormComponent;
exports.FormContext = FormContext;
exports.FormFieldRegistry = FormFieldRegistry;
exports.FormFields = FormFields;
exports.FormRenderContext = FormRenderContext;
exports.Number = Number;
exports.Radio = Radio;
exports.Select = Select;
exports.Text = Text;
exports.Textfield = Textfield;
exports.clone = clone;
exports.createForm = createForm;
exports.createFormContainer = createFormContainer;
exports.createInjector = createInjector;
exports.findErrors = findErrors;
exports.formFields = formFields;
exports.generateIdForType = generateIdForType;
exports.generateIndexForType = generateIndexForType;
exports.isRequired = isRequired;
exports.pathParse = pathParse;
exports.pathStringify = pathStringify;
exports.pathsEqual = pathsEqual;
exports.schemaVersion = schemaVersion;
//# sourceMappingURL=index.cjs.map
