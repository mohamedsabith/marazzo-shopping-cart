'no use strict';
!(function (e) {
  function t(e, t) {
    var n = e,
      r = '';
    while (n) {
      var i = t[n];
      if (typeof i == 'string') return i + r;
      if (i) return i.location.replace(/\/*$/, '/') + (r || i.main || i.name);
      if (i === !1) return '';
      var s = n.lastIndexOf('/');
      if (s === -1) break;
      (r = n.substr(s) + r), (n = n.slice(0, s));
    }
    return e;
  }
  if (typeof e.window != 'undefined' && e.document) return;
  if (e.require && e.define) return;
  e.console ||
    ((e.console = function () {
      var e = Array.prototype.slice.call(arguments, 0);
      postMessage({ type: 'log', data: e });
    }),
    (e.console.error =
      e.console.warn =
      e.console.log =
      e.console.trace =
        e.console)),
    (e.window = e),
    (e.ace = e),
    (e.onerror = function (e, t, n, r, i) {
      postMessage({
        type: 'error',
        data: {
          message: e,
          data: i.data,
          file: t,
          line: n,
          col: r,
          stack: i.stack,
        },
      });
    }),
    (e.normalizeModule = function (t, n) {
      if (n.indexOf('!') !== -1) {
        var r = n.split('!');
        return e.normalizeModule(t, r[0]) + '!' + e.normalizeModule(t, r[1]);
      }
      if (n.charAt(0) == '.') {
        var i = t.split('/').slice(0, -1).join('/');
        n = (i ? i + '/' : '') + n;
        while (n.indexOf('.') !== -1 && s != n) {
          var s = n;
          n = n
            .replace(/^\.\//, '')
            .replace(/\/\.\//, '/')
            .replace(/[^\/]+\/\.\.\//, '');
        }
      }
      return n;
    }),
    (e.require = function (r, i) {
      i || ((i = r), (r = null));
      if (!i.charAt)
        throw new Error(
          'worker.js require() accepts only (parentId, id) as arguments'
        );
      i = e.normalizeModule(r, i);
      var s = e.require.modules[i];
      if (s)
        return (
          s.initialized ||
            ((s.initialized = !0), (s.exports = s.factory().exports)),
          s.exports
        );
      if (!e.require.tlns) return console.log('unable to load ' + i);
      var o = t(i, e.require.tlns);
      return (
        o.slice(-3) != '.js' && (o += '.js'),
        (e.require.id = i),
        (e.require.modules[i] = {}),
        importScripts(o),
        e.require(r, i)
      );
    }),
    (e.require.modules = {}),
    (e.require.tlns = {}),
    (e.define = function (t, n, r) {
      arguments.length == 2
        ? ((r = n), typeof t != 'string' && ((n = t), (t = e.require.id)))
        : arguments.length == 1 && ((r = t), (n = []), (t = e.require.id));
      if (typeof r != 'function') {
        e.require.modules[t] = { exports: r, initialized: !0 };
        return;
      }
      n.length || (n = ['require', 'exports', 'module']);
      var i = function (n) {
        return e.require(t, n);
      };
      e.require.modules[t] = {
        exports: {},
        factory: function () {
          var e = this,
            t = r.apply(
              this,
              n.slice(0, r.length).map(function (t) {
                switch (t) {
                  case 'require':
                    return i;
                  case 'exports':
                    return e.exports;
                  case 'module':
                    return e;
                  default:
                    return i(t);
                }
              })
            );
          return t && (e.exports = t), e;
        },
      };
    }),
    (e.define.amd = {}),
    (require.tlns = {}),
    (e.initBaseUrls = function (t) {
      for (var n in t) require.tlns[n] = t[n];
    }),
    (e.initSender = function () {
      var n = e.require('ace/lib/event_emitter').EventEmitter,
        r = e.require('ace/lib/oop'),
        i = function () {};
      return (
        function () {
          r.implement(this, n),
            (this.callback = function (e, t) {
              postMessage({ type: 'call', id: t, data: e });
            }),
            (this.emit = function (e, t) {
              postMessage({ type: 'event', name: e, data: t });
            });
        }.call(i.prototype),
        new i()
      );
    });
  var n = (e.main = null),
    r = (e.sender = null);
  e.onmessage = function (t) {
    var i = t.data;
    if (i.event && r) r._signal(i.event, i.data);
    else if (i.command)
      if (n[i.command]) n[i.command].apply(n, i.args);
      else {
        if (!e[i.command]) throw new Error('Unknown command:' + i.command);
        e[i.command].apply(e, i.args);
      }
    else if (i.init) {
      e.initBaseUrls(i.tlns), (r = e.sender = e.initSender());
      var s = require(i.module)[i.classname];
      n = e.main = new s(r);
    }
  };
})(this),
  define('ace/lib/oop', [], function (e, t, n) {
    'use strict';
    (t.inherits = function (e, t) {
      (e.super_ = t),
        (e.prototype = Object.create(t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        }));
    }),
      (t.mixin = function (e, t) {
        for (var n in t) e[n] = t[n];
        return e;
      }),
      (t.implement = function (e, n) {
        t.mixin(e, n);
      });
  }),
  define('ace/range', [], function (e, t, n) {
    'use strict';
    var r = function (e, t) {
        return e.row - t.row || e.column - t.column;
      },
      i = function (e, t, n, r) {
        (this.start = { row: e, column: t }),
          (this.end = { row: n, column: r });
      };
    (function () {
      (this.isEqual = function (e) {
        return (
          this.start.row === e.start.row &&
          this.end.row === e.end.row &&
          this.start.column === e.start.column &&
          this.end.column === e.end.column
        );
      }),
        (this.toString = function () {
          return (
            'Range: [' +
            this.start.row +
            '/' +
            this.start.column +
            '] -> [' +
            this.end.row +
            '/' +
            this.end.column +
            ']'
          );
        }),
        (this.contains = function (e, t) {
          return this.compare(e, t) == 0;
        }),
        (this.compareRange = function (e) {
          var t,
            n = e.end,
            r = e.start;
          return (
            (t = this.compare(n.row, n.column)),
            t == 1
              ? ((t = this.compare(r.row, r.column)),
                t == 1 ? 2 : t == 0 ? 1 : 0)
              : t == -1
              ? -2
              : ((t = this.compare(r.row, r.column)),
                t == -1 ? -1 : t == 1 ? 42 : 0)
          );
        }),
        (this.comparePoint = function (e) {
          return this.compare(e.row, e.column);
        }),
        (this.containsRange = function (e) {
          return (
            this.comparePoint(e.start) == 0 && this.comparePoint(e.end) == 0
          );
        }),
        (this.intersects = function (e) {
          var t = this.compareRange(e);
          return t == -1 || t == 0 || t == 1;
        }),
        (this.isEnd = function (e, t) {
          return this.end.row == e && this.end.column == t;
        }),
        (this.isStart = function (e, t) {
          return this.start.row == e && this.start.column == t;
        }),
        (this.setStart = function (e, t) {
          typeof e == 'object'
            ? ((this.start.column = e.column), (this.start.row = e.row))
            : ((this.start.row = e), (this.start.column = t));
        }),
        (this.setEnd = function (e, t) {
          typeof e == 'object'
            ? ((this.end.column = e.column), (this.end.row = e.row))
            : ((this.end.row = e), (this.end.column = t));
        }),
        (this.inside = function (e, t) {
          return this.compare(e, t) == 0
            ? this.isEnd(e, t) || this.isStart(e, t)
              ? !1
              : !0
            : !1;
        }),
        (this.insideStart = function (e, t) {
          return this.compare(e, t) == 0 ? (this.isEnd(e, t) ? !1 : !0) : !1;
        }),
        (this.insideEnd = function (e, t) {
          return this.compare(e, t) == 0 ? (this.isStart(e, t) ? !1 : !0) : !1;
        }),
        (this.compare = function (e, t) {
          return !this.isMultiLine() && e === this.start.row
            ? t < this.start.column
              ? -1
              : t > this.end.column
              ? 1
              : 0
            : e < this.start.row
            ? -1
            : e > this.end.row
            ? 1
            : this.start.row === e
            ? t >= this.start.column
              ? 0
              : -1
            : this.end.row === e
            ? t <= this.end.column
              ? 0
              : 1
            : 0;
        }),
        (this.compareStart = function (e, t) {
          return this.start.row == e && this.start.column == t
            ? -1
            : this.compare(e, t);
        }),
        (this.compareEnd = function (e, t) {
          return this.end.row == e && this.end.column == t
            ? 1
            : this.compare(e, t);
        }),
        (this.compareInside = function (e, t) {
          return this.end.row == e && this.end.column == t
            ? 1
            : this.start.row == e && this.start.column == t
            ? -1
            : this.compare(e, t);
        }),
        (this.clipRows = function (e, t) {
          if (this.end.row > t) var n = { row: t + 1, column: 0 };
          else if (this.end.row < e) var n = { row: e, column: 0 };
          if (this.start.row > t) var r = { row: t + 1, column: 0 };
          else if (this.start.row < e) var r = { row: e, column: 0 };
          return i.fromPoints(r || this.start, n || this.end);
        }),
        (this.extend = function (e, t) {
          var n = this.compare(e, t);
          if (n == 0) return this;
          if (n == -1) var r = { row: e, column: t };
          else var s = { row: e, column: t };
          return i.fromPoints(r || this.start, s || this.end);
        }),
        (this.isEmpty = function () {
          return (
            this.start.row === this.end.row &&
            this.start.column === this.end.column
          );
        }),
        (this.isMultiLine = function () {
          return this.start.row !== this.end.row;
        }),
        (this.clone = function () {
          return i.fromPoints(this.start, this.end);
        }),
        (this.collapseRows = function () {
          return this.end.column == 0
            ? new i(
                this.start.row,
                0,
                Math.max(this.start.row, this.end.row - 1),
                0
              )
            : new i(this.start.row, 0, this.end.row, 0);
        }),
        (this.toScreenRange = function (e) {
          var t = e.documentToScreenPosition(this.start),
            n = e.documentToScreenPosition(this.end);
          return new i(t.row, t.column, n.row, n.column);
        }),
        (this.moveBy = function (e, t) {
          (this.start.row += e),
            (this.start.column += t),
            (this.end.row += e),
            (this.end.column += t);
        });
    }).call(i.prototype),
      (i.fromPoints = function (e, t) {
        return new i(e.row, e.column, t.row, t.column);
      }),
      (i.comparePoints = r),
      (i.comparePoints = function (e, t) {
        return e.row - t.row || e.column - t.column;
      }),
      (t.Range = i);
  }),
  define('ace/apply_delta', [], function (e, t, n) {
    'use strict';
    function r(e, t) {
      throw (console.log('Invalid Delta:', e), 'Invalid Delta: ' + t);
    }
    function i(e, t) {
      return (
        t.row >= 0 &&
        t.row < e.length &&
        t.column >= 0 &&
        t.column <= e[t.row].length
      );
    }
    function s(e, t) {
      t.action != 'insert' &&
        t.action != 'remove' &&
        r(t, "delta.action must be 'insert' or 'remove'"),
        t.lines instanceof Array || r(t, 'delta.lines must be an Array'),
        (!t.start || !t.end) && r(t, 'delta.start/end must be an present');
      var n = t.start;
      i(e, t.start) || r(t, 'delta.start must be contained in document');
      var s = t.end;
      t.action == 'remove' &&
        !i(e, s) &&
        r(t, "delta.end must contained in document for 'remove' actions");
      var o = s.row - n.row,
        u = s.column - (o == 0 ? n.column : 0);
      (o != t.lines.length - 1 || t.lines[o].length != u) &&
        r(t, 'delta.range must match delta lines');
    }
    t.applyDelta = function (e, t, n) {
      var r = t.start.row,
        i = t.start.column,
        s = e[r] || '';
      switch (t.action) {
        case 'insert':
          var o = t.lines;
          if (o.length === 1)
            e[r] = s.substring(0, i) + t.lines[0] + s.substring(i);
          else {
            var u = [r, 1].concat(t.lines);
            e.splice.apply(e, u),
              (e[r] = s.substring(0, i) + e[r]),
              (e[r + t.lines.length - 1] += s.substring(i));
          }
          break;
        case 'remove':
          var a = t.end.column,
            f = t.end.row;
          r === f
            ? (e[r] = s.substring(0, i) + s.substring(a))
            : e.splice(r, f - r + 1, s.substring(0, i) + e[f].substring(a));
      }
    };
  }),
  define('ace/lib/event_emitter', [], function (e, t, n) {
    'use strict';
    var r = {},
      i = function () {
        this.propagationStopped = !0;
      },
      s = function () {
        this.defaultPrevented = !0;
      };
    (r._emit = r._dispatchEvent =
      function (e, t) {
        this._eventRegistry || (this._eventRegistry = {}),
          this._defaultHandlers || (this._defaultHandlers = {});
        var n = this._eventRegistry[e] || [],
          r = this._defaultHandlers[e];
        if (!n.length && !r) return;
        if (typeof t != 'object' || !t) t = {};
        t.type || (t.type = e),
          t.stopPropagation || (t.stopPropagation = i),
          t.preventDefault || (t.preventDefault = s),
          (n = n.slice());
        for (var o = 0; o < n.length; o++) {
          n[o](t, this);
          if (t.propagationStopped) break;
        }
        if (r && !t.defaultPrevented) return r(t, this);
      }),
      (r._signal = function (e, t) {
        var n = (this._eventRegistry || {})[e];
        if (!n) return;
        n = n.slice();
        for (var r = 0; r < n.length; r++) n[r](t, this);
      }),
      (r.once = function (e, t) {
        var n = this;
        this.on(e, function r() {
          n.off(e, r), t.apply(null, arguments);
        });
        if (!t)
          return new Promise(function (e) {
            t = e;
          });
      }),
      (r.setDefaultHandler = function (e, t) {
        var n = this._defaultHandlers;
        n || (n = this._defaultHandlers = { _disabled_: {} });
        if (n[e]) {
          var r = n[e],
            i = n._disabled_[e];
          i || (n._disabled_[e] = i = []), i.push(r);
          var s = i.indexOf(t);
          s != -1 && i.splice(s, 1);
        }
        n[e] = t;
      }),
      (r.removeDefaultHandler = function (e, t) {
        var n = this._defaultHandlers;
        if (!n) return;
        var r = n._disabled_[e];
        if (n[e] == t) r && this.setDefaultHandler(e, r.pop());
        else if (r) {
          var i = r.indexOf(t);
          i != -1 && r.splice(i, 1);
        }
      }),
      (r.on = r.addEventListener =
        function (e, t, n) {
          this._eventRegistry = this._eventRegistry || {};
          var r = this._eventRegistry[e];
          return (
            r || (r = this._eventRegistry[e] = []),
            r.indexOf(t) == -1 && r[n ? 'unshift' : 'push'](t),
            t
          );
        }),
      (r.off =
        r.removeListener =
        r.removeEventListener =
          function (e, t) {
            this._eventRegistry = this._eventRegistry || {};
            var n = this._eventRegistry[e];
            if (!n) return;
            var r = n.indexOf(t);
            r !== -1 && n.splice(r, 1);
          }),
      (r.removeAllListeners = function (e) {
        e || (this._eventRegistry = this._defaultHandlers = undefined),
          this._eventRegistry && (this._eventRegistry[e] = undefined),
          this._defaultHandlers && (this._defaultHandlers[e] = undefined);
      }),
      (t.EventEmitter = r);
  }),
  define('ace/anchor', [], function (e, t, n) {
    'use strict';
    var r = e('./lib/oop'),
      i = e('./lib/event_emitter').EventEmitter,
      s = (t.Anchor = function (e, t, n) {
        (this.$onChange = this.onChange.bind(this)),
          this.attach(e),
          typeof n == 'undefined'
            ? this.setPosition(t.row, t.column)
            : this.setPosition(t, n);
      });
    (function () {
      function e(e, t, n) {
        var r = n ? e.column <= t.column : e.column < t.column;
        return e.row < t.row || (e.row == t.row && r);
      }
      function t(t, n, r) {
        var i = t.action == 'insert',
          s = (i ? 1 : -1) * (t.end.row - t.start.row),
          o = (i ? 1 : -1) * (t.end.column - t.start.column),
          u = t.start,
          a = i ? u : t.end;
        return e(n, u, r)
          ? { row: n.row, column: n.column }
          : e(a, n, !r)
          ? { row: n.row + s, column: n.column + (n.row == a.row ? o : 0) }
          : { row: u.row, column: u.column };
      }
      r.implement(this, i),
        (this.getPosition = function () {
          return this.$clipPositionToDocument(this.row, this.column);
        }),
        (this.getDocument = function () {
          return this.document;
        }),
        (this.$insertRight = !1),
        (this.onChange = function (e) {
          if (e.start.row == e.end.row && e.start.row != this.row) return;
          if (e.start.row > this.row) return;
          var n = t(
            e,
            { row: this.row, column: this.column },
            this.$insertRight
          );
          this.setPosition(n.row, n.column, !0);
        }),
        (this.setPosition = function (e, t, n) {
          var r;
          n
            ? (r = { row: e, column: t })
            : (r = this.$clipPositionToDocument(e, t));
          if (this.row == r.row && this.column == r.column) return;
          var i = { row: this.row, column: this.column };
          (this.row = r.row),
            (this.column = r.column),
            this._signal('change', { old: i, value: r });
        }),
        (this.detach = function () {
          this.document.off('change', this.$onChange);
        }),
        (this.attach = function (e) {
          (this.document = e || this.document),
            this.document.on('change', this.$onChange);
        }),
        (this.$clipPositionToDocument = function (e, t) {
          var n = {};
          return (
            e >= this.document.getLength()
              ? ((n.row = Math.max(0, this.document.getLength() - 1)),
                (n.column = this.document.getLine(n.row).length))
              : e < 0
              ? ((n.row = 0), (n.column = 0))
              : ((n.row = e),
                (n.column = Math.min(
                  this.document.getLine(n.row).length,
                  Math.max(0, t)
                ))),
            t < 0 && (n.column = 0),
            n
          );
        });
    }).call(s.prototype);
  }),
  define('ace/document', [], function (e, t, n) {
    'use strict';
    var r = e('./lib/oop'),
      i = e('./apply_delta').applyDelta,
      s = e('./lib/event_emitter').EventEmitter,
      o = e('./range').Range,
      u = e('./anchor').Anchor,
      a = function (e) {
        (this.$lines = ['']),
          e.length === 0
            ? (this.$lines = [''])
            : Array.isArray(e)
            ? this.insertMergedLines({ row: 0, column: 0 }, e)
            : this.insert({ row: 0, column: 0 }, e);
      };
    (function () {
      r.implement(this, s),
        (this.setValue = function (e) {
          var t = this.getLength() - 1;
          this.remove(new o(0, 0, t, this.getLine(t).length)),
            this.insert({ row: 0, column: 0 }, e);
        }),
        (this.getValue = function () {
          return this.getAllLines().join(this.getNewLineCharacter());
        }),
        (this.createAnchor = function (e, t) {
          return new u(this, e, t);
        }),
        'aaa'.split(/a/).length === 0
          ? (this.$split = function (e) {
              return e.replace(/\r\n|\r/g, '\n').split('\n');
            })
          : (this.$split = function (e) {
              return e.split(/\r\n|\r|\n/);
            }),
        (this.$detectNewLine = function (e) {
          var t = e.match(/^.*?(\r\n|\r|\n)/m);
          (this.$autoNewLine = t ? t[1] : '\n'),
            this._signal('changeNewLineMode');
        }),
        (this.getNewLineCharacter = function () {
          switch (this.$newLineMode) {
            case 'windows':
              return '\r\n';
            case 'unix':
              return '\n';
            default:
              return this.$autoNewLine || '\n';
          }
        }),
        (this.$autoNewLine = ''),
        (this.$newLineMode = 'auto'),
        (this.setNewLineMode = function (e) {
          if (this.$newLineMode === e) return;
          (this.$newLineMode = e), this._signal('changeNewLineMode');
        }),
        (this.getNewLineMode = function () {
          return this.$newLineMode;
        }),
        (this.isNewLine = function (e) {
          return e == '\r\n' || e == '\r' || e == '\n';
        }),
        (this.getLine = function (e) {
          return this.$lines[e] || '';
        }),
        (this.getLines = function (e, t) {
          return this.$lines.slice(e, t + 1);
        }),
        (this.getAllLines = function () {
          return this.getLines(0, this.getLength());
        }),
        (this.getLength = function () {
          return this.$lines.length;
        }),
        (this.getTextRange = function (e) {
          return this.getLinesForRange(e).join(this.getNewLineCharacter());
        }),
        (this.getLinesForRange = function (e) {
          var t;
          if (e.start.row === e.end.row)
            t = [
              this.getLine(e.start.row).substring(e.start.column, e.end.column),
            ];
          else {
            (t = this.getLines(e.start.row, e.end.row)),
              (t[0] = (t[0] || '').substring(e.start.column));
            var n = t.length - 1;
            e.end.row - e.start.row == n &&
              (t[n] = t[n].substring(0, e.end.column));
          }
          return t;
        }),
        (this.insertLines = function (e, t) {
          return (
            console.warn(
              'Use of document.insertLines is deprecated. Use the insertFullLines method instead.'
            ),
            this.insertFullLines(e, t)
          );
        }),
        (this.removeLines = function (e, t) {
          return (
            console.warn(
              'Use of document.removeLines is deprecated. Use the removeFullLines method instead.'
            ),
            this.removeFullLines(e, t)
          );
        }),
        (this.insertNewLine = function (e) {
          return (
            console.warn(
              "Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead."
            ),
            this.insertMergedLines(e, ['', ''])
          );
        }),
        (this.insert = function (e, t) {
          return (
            this.getLength() <= 1 && this.$detectNewLine(t),
            this.insertMergedLines(e, this.$split(t))
          );
        }),
        (this.insertInLine = function (e, t) {
          var n = this.clippedPos(e.row, e.column),
            r = this.pos(e.row, e.column + t.length);
          return (
            this.applyDelta(
              { start: n, end: r, action: 'insert', lines: [t] },
              !0
            ),
            this.clonePos(r)
          );
        }),
        (this.clippedPos = function (e, t) {
          var n = this.getLength();
          e === undefined
            ? (e = n)
            : e < 0
            ? (e = 0)
            : e >= n && ((e = n - 1), (t = undefined));
          var r = this.getLine(e);
          return (
            t == undefined && (t = r.length),
            (t = Math.min(Math.max(t, 0), r.length)),
            { row: e, column: t }
          );
        }),
        (this.clonePos = function (e) {
          return { row: e.row, column: e.column };
        }),
        (this.pos = function (e, t) {
          return { row: e, column: t };
        }),
        (this.$clipPosition = function (e) {
          var t = this.getLength();
          return (
            e.row >= t
              ? ((e.row = Math.max(0, t - 1)),
                (e.column = this.getLine(t - 1).length))
              : ((e.row = Math.max(0, e.row)),
                (e.column = Math.min(
                  Math.max(e.column, 0),
                  this.getLine(e.row).length
                ))),
            e
          );
        }),
        (this.insertFullLines = function (e, t) {
          e = Math.min(Math.max(e, 0), this.getLength());
          var n = 0;
          e < this.getLength()
            ? ((t = t.concat([''])), (n = 0))
            : ((t = [''].concat(t)), e--, (n = this.$lines[e].length)),
            this.insertMergedLines({ row: e, column: n }, t);
        }),
        (this.insertMergedLines = function (e, t) {
          var n = this.clippedPos(e.row, e.column),
            r = {
              row: n.row + t.length - 1,
              column: (t.length == 1 ? n.column : 0) + t[t.length - 1].length,
            };
          return (
            this.applyDelta({ start: n, end: r, action: 'insert', lines: t }),
            this.clonePos(r)
          );
        }),
        (this.remove = function (e) {
          var t = this.clippedPos(e.start.row, e.start.column),
            n = this.clippedPos(e.end.row, e.end.column);
          return (
            this.applyDelta({
              start: t,
              end: n,
              action: 'remove',
              lines: this.getLinesForRange({ start: t, end: n }),
            }),
            this.clonePos(t)
          );
        }),
        (this.removeInLine = function (e, t, n) {
          var r = this.clippedPos(e, t),
            i = this.clippedPos(e, n);
          return (
            this.applyDelta(
              {
                start: r,
                end: i,
                action: 'remove',
                lines: this.getLinesForRange({ start: r, end: i }),
              },
              !0
            ),
            this.clonePos(r)
          );
        }),
        (this.removeFullLines = function (e, t) {
          (e = Math.min(Math.max(0, e), this.getLength() - 1)),
            (t = Math.min(Math.max(0, t), this.getLength() - 1));
          var n = t == this.getLength() - 1 && e > 0,
            r = t < this.getLength() - 1,
            i = n ? e - 1 : e,
            s = n ? this.getLine(i).length : 0,
            u = r ? t + 1 : t,
            a = r ? 0 : this.getLine(u).length,
            f = new o(i, s, u, a),
            l = this.$lines.slice(e, t + 1);
          return (
            this.applyDelta({
              start: f.start,
              end: f.end,
              action: 'remove',
              lines: this.getLinesForRange(f),
            }),
            l
          );
        }),
        (this.removeNewLine = function (e) {
          e < this.getLength() - 1 &&
            e >= 0 &&
            this.applyDelta({
              start: this.pos(e, this.getLine(e).length),
              end: this.pos(e + 1, 0),
              action: 'remove',
              lines: ['', ''],
            });
        }),
        (this.replace = function (e, t) {
          e instanceof o || (e = o.fromPoints(e.start, e.end));
          if (t.length === 0 && e.isEmpty()) return e.start;
          if (t == this.getTextRange(e)) return e.end;
          this.remove(e);
          var n;
          return t ? (n = this.insert(e.start, t)) : (n = e.start), n;
        }),
        (this.applyDeltas = function (e) {
          for (var t = 0; t < e.length; t++) this.applyDelta(e[t]);
        }),
        (this.revertDeltas = function (e) {
          for (var t = e.length - 1; t >= 0; t--) this.revertDelta(e[t]);
        }),
        (this.applyDelta = function (e, t) {
          var n = e.action == 'insert';
          if (
            n
              ? e.lines.length <= 1 && !e.lines[0]
              : !o.comparePoints(e.start, e.end)
          )
            return;
          n && e.lines.length > 2e4
            ? this.$splitAndapplyLargeDelta(e, 2e4)
            : (i(this.$lines, e, t), this._signal('change', e));
        }),
        (this.$safeApplyDelta = function (e) {
          var t = this.$lines.length;
          ((e.action == 'remove' && e.start.row < t && e.end.row < t) ||
            (e.action == 'insert' && e.start.row <= t)) &&
            this.applyDelta(e);
        }),
        (this.$splitAndapplyLargeDelta = function (e, t) {
          var n = e.lines,
            r = n.length - t + 1,
            i = e.start.row,
            s = e.start.column;
          for (var o = 0, u = 0; o < r; o = u) {
            u += t - 1;
            var a = n.slice(o, u);
            a.push(''),
              this.applyDelta(
                {
                  start: this.pos(i + o, s),
                  end: this.pos(i + u, (s = 0)),
                  action: e.action,
                  lines: a,
                },
                !0
              );
          }
          (e.lines = n.slice(o)),
            (e.start.row = i + o),
            (e.start.column = s),
            this.applyDelta(e, !0);
        }),
        (this.revertDelta = function (e) {
          this.$safeApplyDelta({
            start: this.clonePos(e.start),
            end: this.clonePos(e.end),
            action: e.action == 'insert' ? 'remove' : 'insert',
            lines: e.lines.slice(),
          });
        }),
        (this.indexToPosition = function (e, t) {
          var n = this.$lines || this.getAllLines(),
            r = this.getNewLineCharacter().length;
          for (var i = t || 0, s = n.length; i < s; i++) {
            e -= n[i].length + r;
            if (e < 0) return { row: i, column: e + n[i].length + r };
          }
          return { row: s - 1, column: e + n[s - 1].length + r };
        }),
        (this.positionToIndex = function (e, t) {
          var n = this.$lines || this.getAllLines(),
            r = this.getNewLineCharacter().length,
            i = 0,
            s = Math.min(e.row, n.length);
          for (var o = t || 0; o < s; ++o) i += n[o].length + r;
          return i + e.column;
        });
    }).call(a.prototype),
      (t.Document = a);
  }),
  define('ace/lib/lang', [], function (e, t, n) {
    'use strict';
    (t.last = function (e) {
      return e[e.length - 1];
    }),
      (t.stringReverse = function (e) {
        return e.split('').reverse().join('');
      }),
      (t.stringRepeat = function (e, t) {
        var n = '';
        while (t > 0) {
          t & 1 && (n += e);
          if ((t >>= 1)) e += e;
        }
        return n;
      });
    var r = /^\s\s*/,
      i = /\s\s*$/;
    (t.stringTrimLeft = function (e) {
      return e.replace(r, '');
    }),
      (t.stringTrimRight = function (e) {
        return e.replace(i, '');
      }),
      (t.copyObject = function (e) {
        var t = {};
        for (var n in e) t[n] = e[n];
        return t;
      }),
      (t.copyArray = function (e) {
        var t = [];
        for (var n = 0, r = e.length; n < r; n++)
          e[n] && typeof e[n] == 'object'
            ? (t[n] = this.copyObject(e[n]))
            : (t[n] = e[n]);
        return t;
      }),
      (t.deepCopy = function s(e) {
        if (typeof e != 'object' || !e) return e;
        var t;
        if (Array.isArray(e)) {
          t = [];
          for (var n = 0; n < e.length; n++) t[n] = s(e[n]);
          return t;
        }
        if (Object.prototype.toString.call(e) !== '[object Object]') return e;
        t = {};
        for (var n in e) t[n] = s(e[n]);
        return t;
      }),
      (t.arrayToMap = function (e) {
        var t = {};
        for (var n = 0; n < e.length; n++) t[e[n]] = 1;
        return t;
      }),
      (t.createMap = function (e) {
        var t = Object.create(null);
        for (var n in e) t[n] = e[n];
        return t;
      }),
      (t.arrayRemove = function (e, t) {
        for (var n = 0; n <= e.length; n++) t === e[n] && e.splice(n, 1);
      }),
      (t.escapeRegExp = function (e) {
        return e.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
      }),
      (t.escapeHTML = function (e) {
        return ('' + e)
          .replace(/&/g, '&#38;')
          .replace(/"/g, '&#34;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&#60;');
      }),
      (t.getMatchOffsets = function (e, t) {
        var n = [];
        return (
          e.replace(t, function (e) {
            n.push({
              offset: arguments[arguments.length - 2],
              length: e.length,
            });
          }),
          n
        );
      }),
      (t.deferredCall = function (e) {
        var t = null,
          n = function () {
            (t = null), e();
          },
          r = function (e) {
            return r.cancel(), (t = setTimeout(n, e || 0)), r;
          };
        return (
          (r.schedule = r),
          (r.call = function () {
            return this.cancel(), e(), r;
          }),
          (r.cancel = function () {
            return clearTimeout(t), (t = null), r;
          }),
          (r.isPending = function () {
            return t;
          }),
          r
        );
      }),
      (t.delayedCall = function (e, t) {
        var n = null,
          r = function () {
            (n = null), e();
          },
          i = function (e) {
            n == null && (n = setTimeout(r, e || t));
          };
        return (
          (i.delay = function (e) {
            n && clearTimeout(n), (n = setTimeout(r, e || t));
          }),
          (i.schedule = i),
          (i.call = function () {
            this.cancel(), e();
          }),
          (i.cancel = function () {
            n && clearTimeout(n), (n = null);
          }),
          (i.isPending = function () {
            return n;
          }),
          i
        );
      });
  }),
  define('ace/worker/mirror', [], function (e, t, n) {
    'use strict';
    var r = e('../range').Range,
      i = e('../document').Document,
      s = e('../lib/lang'),
      o = (t.Mirror = function (e) {
        this.sender = e;
        var t = (this.doc = new i('')),
          n = (this.deferredUpdate = s.delayedCall(this.onUpdate.bind(this))),
          r = this;
        e.on('change', function (e) {
          var i = e.data;
          if (i[0].start) t.applyDeltas(i);
          else
            for (var s = 0; s < i.length; s += 2) {
              if (Array.isArray(i[s + 1]))
                var o = { action: 'insert', start: i[s], lines: i[s + 1] };
              else var o = { action: 'remove', start: i[s], end: i[s + 1] };
              t.applyDelta(o, !0);
            }
          if (r.$timeout) return n.schedule(r.$timeout);
          r.onUpdate();
        });
      });
    (function () {
      (this.$timeout = 500),
        (this.setTimeout = function (e) {
          this.$timeout = e;
        }),
        (this.setValue = function (e) {
          this.doc.setValue(e), this.deferredUpdate.schedule(this.$timeout);
        }),
        (this.getValue = function (e) {
          this.sender.callback(this.doc.getValue(), e);
        }),
        (this.onUpdate = function () {}),
        (this.isPending = function () {
          return this.deferredUpdate.isPending();
        });
    }).call(o.prototype);
  }),
  define('ace/mode/php/php', [], function (e, t, n) {
    var r = { Constants: {} };
    (r.Constants.T_INCLUDE = 259),
      (r.Constants.T_INCLUDE_ONCE = 260),
      (r.Constants.T_EVAL = 318),
      (r.Constants.T_REQUIRE = 261),
      (r.Constants.T_REQUIRE_ONCE = 262),
      (r.Constants.T_LOGICAL_OR = 263),
      (r.Constants.T_LOGICAL_XOR = 264),
      (r.Constants.T_LOGICAL_AND = 265),
      (r.Constants.T_PRINT = 266),
      (r.Constants.T_YIELD = 267),
      (r.Constants.T_DOUBLE_ARROW = 268),
      (r.Constants.T_YIELD_FROM = 269),
      (r.Constants.T_PLUS_EQUAL = 270),
      (r.Constants.T_MINUS_EQUAL = 271),
      (r.Constants.T_MUL_EQUAL = 272),
      (r.Constants.T_DIV_EQUAL = 273),
      (r.Constants.T_CONCAT_EQUAL = 274),
      (r.Constants.T_MOD_EQUAL = 275),
      (r.Constants.T_AND_EQUAL = 276),
      (r.Constants.T_OR_EQUAL = 277),
      (r.Constants.T_XOR_EQUAL = 278),
      (r.Constants.T_SL_EQUAL = 279),
      (r.Constants.T_SR_EQUAL = 280),
      (r.Constants.T_POW_EQUAL = 281),
      (r.Constants.T_COALESCE_EQUAL = 282),
      (r.Constants.T_COALESCE = 283),
      (r.Constants.T_BOOLEAN_OR = 284),
      (r.Constants.T_BOOLEAN_AND = 285),
      (r.Constants.T_IS_EQUAL = 286),
      (r.Constants.T_IS_NOT_EQUAL = 287),
      (r.Constants.T_IS_IDENTICAL = 288),
      (r.Constants.T_IS_NOT_IDENTICAL = 289),
      (r.Constants.T_SPACESHIP = 290),
      (r.Constants.T_IS_SMALLER_OR_EQUAL = 291),
      (r.Constants.T_IS_GREATER_OR_EQUAL = 292),
      (r.Constants.T_SL = 293),
      (r.Constants.T_SR = 294),
      (r.Constants.T_INSTANCEOF = 295),
      (r.Constants.T_INC = 319),
      (r.Constants.T_DEC = 320),
      (r.Constants.T_INT_CAST = 296),
      (r.Constants.T_DOUBLE_CAST = 297),
      (r.Constants.T_STRING_CAST = 298),
      (r.Constants.T_ARRAY_CAST = 299),
      (r.Constants.T_OBJECT_CAST = 300),
      (r.Constants.T_BOOL_CAST = 301),
      (r.Constants.T_UNSET_CAST = 302),
      (r.Constants.T_POW = 303),
      (r.Constants.T_NEW = 304),
      (r.Constants.T_CLONE = 305),
      (r.Constants.T_EXIT = 321),
      (r.Constants.T_IF = 322),
      (r.Constants.T_ELSEIF = 307),
      (r.Constants.T_ELSE = 308),
      (r.Constants.T_ENDIF = 323),
      (r.Constants.T_LNUMBER = 309),
      (r.Constants.T_DNUMBER = 310),
      (r.Constants.T_STRING = 311),
      (r.Constants.T_STRING_VARNAME = 316),
      (r.Constants.T_VARIABLE = 312),
      (r.Constants.T_NUM_STRING = 317),
      (r.Constants.T_INLINE_HTML = 313),
      (r.Constants.T_BAD_CHARACTER = 395),
      (r.Constants.T_ENCAPSED_AND_WHITESPACE = 314),
      (r.Constants.T_CONSTANT_ENCAPSED_STRING = 315),
      (r.Constants.T_ECHO = 324),
      (r.Constants.T_DO = 325),
      (r.Constants.T_WHILE = 326),
      (r.Constants.T_ENDWHILE = 327),
      (r.Constants.T_FOR = 328),
      (r.Constants.T_ENDFOR = 329),
      (r.Constants.T_FOREACH = 330),
      (r.Constants.T_ENDFOREACH = 331),
      (r.Constants.T_DECLARE = 332),
      (r.Constants.T_ENDDECLARE = 333),
      (r.Constants.T_AS = 334),
      (r.Constants.T_SWITCH = 335),
      (r.Constants.T_ENDSWITCH = 336),
      (r.Constants.T_CASE = 337),
      (r.Constants.T_DEFAULT = 338),
      (r.Constants.T_BREAK = 339),
      (r.Constants.T_CONTINUE = 340),
      (r.Constants.T_GOTO = 341),
      (r.Constants.T_FUNCTION = 342),
      (r.Constants.T_FN = 343),
      (r.Constants.T_CONST = 344),
      (r.Constants.T_RETURN = 345),
      (r.Constants.T_TRY = 346),
      (r.Constants.T_CATCH = 347),
      (r.Constants.T_FINALLY = 348),
      (r.Constants.T_THROW = 349),
      (r.Constants.T_USE = 350),
      (r.Constants.T_INSTEADOF = 351),
      (r.Constants.T_GLOBAL = 352),
      (r.Constants.T_STATIC = 353),
      (r.Constants.T_ABSTRACT = 354),
      (r.Constants.T_FINAL = 355),
      (r.Constants.T_PRIVATE = 356),
      (r.Constants.T_PROTECTED = 357),
      (r.Constants.T_PUBLIC = 358),
      (r.Constants.T_VAR = 359),
      (r.Constants.T_UNSET = 360),
      (r.Constants.T_ISSET = 361),
      (r.Constants.T_EMPTY = 362),
      (r.Constants.T_HALT_COMPILER = 363),
      (r.Constants.T_CLASS = 364),
      (r.Constants.T_TRAIT = 365),
      (r.Constants.T_INTERFACE = 366),
      (r.Constants.T_EXTENDS = 367),
      (r.Constants.T_IMPLEMENTS = 368),
      (r.Constants.T_OBJECT_OPERATOR = 369),
      (r.Constants.T_DOUBLE_ARROW = 268),
      (r.Constants.T_LIST = 370),
      (r.Constants.T_ARRAY = 371),
      (r.Constants.T_CALLABLE = 372),
      (r.Constants.T_CLASS_C = 376),
      (r.Constants.T_TRAIT_C = 377),
      (r.Constants.T_METHOD_C = 378),
      (r.Constants.T_FUNC_C = 379),
      (r.Constants.T_LINE = 373),
      (r.Constants.T_FILE = 374),
      (r.Constants.T_COMMENT = 380),
      (r.Constants.T_DOC_COMMENT = 381),
      (r.Constants.T_OPEN_TAG = 382),
      (r.Constants.T_OPEN_TAG_WITH_ECHO = 383),
      (r.Constants.T_CLOSE_TAG = 384),
      (r.Constants.T_WHITESPACE = 385),
      (r.Constants.T_START_HEREDOC = 386),
      (r.Constants.T_END_HEREDOC = 387),
      (r.Constants.T_DOLLAR_OPEN_CURLY_BRACES = 388),
      (r.Constants.T_CURLY_OPEN = 389),
      (r.Constants.T_PAAMAYIM_NEKUDOTAYIM = 390),
      (r.Constants.T_NAMESPACE = 391),
      (r.Constants.T_NS_C = 392),
      (r.Constants.T_DIR = 375),
      (r.Constants.T_NS_SEPARATOR = 393),
      (r.Constants.T_ELLIPSIS = 394),
      (r.Lexer = function (e, t) {
        var n,
          i,
          s = ['INITIAL'],
          o = 0,
          u = function (e) {
            s[o] = e;
          },
          a = function (e) {
            s[++o] = e;
          },
          f = function () {
            --o;
          },
          l = t === undefined || /^(on|true|1)$/i.test(t.short_open_tag),
          c = l
            ? /^(\<\?php(?:\r\n|[ \t\r\n])|<\?|\<script language\=('|")?php('|")?\>)/i
            : /^(\<\?php(?:\r\n|[ \t\r\n])|\<script language\=('|")?php('|")?\>)/i,
          h = l
            ? /[^<]*(?:<(?!\?|script language\=('|")?php('|")?\>)[^<]*)*/i
            : /[^<]*(?:<(?!\?=|\?php[ \t\r\n]|script language\=('|")?php('|")?\>)[^<]*)*/i,
          p = '[a-zA-Z_\\x7f-\\uffff][a-zA-Z0-9_\\x7f-\\uffff]*',
          d = function (e) {
            return (
              '[^' +
              e +
              '\\\\${]*(?:(?:\\\\[\\s\\S]|\\$(?!\\{|[a-zA-Z_\\x7f-\\uffff])|\\{(?!\\$))[^' +
              e +
              '\\\\${]*)*'
            );
          },
          v = [
            {
              value: r.Constants.T_VARIABLE,
              re: new RegExp('^\\$' + p + '(?=\\[)'),
              func: function () {
                a('VAR_OFFSET');
              },
            },
            {
              value: r.Constants.T_VARIABLE,
              re: new RegExp('^\\$' + p + '(?=->' + p + ')'),
              func: function () {
                a('LOOKING_FOR_PROPERTY');
              },
            },
            {
              value: r.Constants.T_DOLLAR_OPEN_CURLY_BRACES,
              re: new RegExp('^\\$\\{(?=' + p + '[\\[}])'),
              func: function () {
                a('LOOKING_FOR_VARNAME');
              },
            },
            { value: r.Constants.T_VARIABLE, re: new RegExp('^\\$' + p) },
            {
              value: r.Constants.T_DOLLAR_OPEN_CURLY_BRACES,
              re: /^\$\{/,
              func: function () {
                a('IN_SCRIPTING');
              },
            },
            {
              value: r.Constants.T_CURLY_OPEN,
              re: /^\{(?=\$)/,
              func: function () {
                a('IN_SCRIPTING');
              },
            },
          ],
          m = {
            INITIAL: [
              {
                value: r.Constants.T_OPEN_TAG_WITH_ECHO,
                re: /^<\?=/i,
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
              {
                value: r.Constants.T_OPEN_TAG,
                re: c,
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
              { value: r.Constants.T_INLINE_HTML, re: h },
            ],
            IN_SCRIPTING: [
              { value: r.Constants.T_WHITESPACE, re: /^[ \n\r\t]+/ },
              { value: r.Constants.T_ABSTRACT, re: /^abstract\b/i },
              { value: r.Constants.T_LOGICAL_AND, re: /^and\b/i },
              { value: r.Constants.T_ARRAY, re: /^array\b/i },
              { value: r.Constants.T_AS, re: /^as\b/i },
              { value: r.Constants.T_BREAK, re: /^break\b/i },
              { value: r.Constants.T_CALLABLE, re: /^callable\b/i },
              { value: r.Constants.T_CASE, re: /^case\b/i },
              { value: r.Constants.T_CATCH, re: /^catch\b/i },
              { value: r.Constants.T_CLASS, re: /^class\b/i },
              { value: r.Constants.T_CLONE, re: /^clone\b/i },
              { value: r.Constants.T_CONST, re: /^const\b/i },
              { value: r.Constants.T_CONTINUE, re: /^continue\b/i },
              { value: r.Constants.T_DECLARE, re: /^declare\b/i },
              { value: r.Constants.T_DEFAULT, re: /^default\b/i },
              { value: r.Constants.T_DO, re: /^do\b/i },
              { value: r.Constants.T_ECHO, re: /^echo\b/i },
              { value: r.Constants.T_ELSE, re: /^else\b/i },
              { value: r.Constants.T_ELSEIF, re: /^elseif\b/i },
              { value: r.Constants.T_ENDDECLARE, re: /^enddeclare\b/i },
              { value: r.Constants.T_ENDFOR, re: /^endfor\b/i },
              { value: r.Constants.T_ENDFOREACH, re: /^endforeach\b/i },
              { value: r.Constants.T_ENDIF, re: /^endif\b/i },
              { value: r.Constants.T_ENDSWITCH, re: /^endswitch\b/i },
              { value: r.Constants.T_ENDWHILE, re: /^endwhile\b/i },
              { value: r.Constants.T_EMPTY, re: /^empty\b/i },
              { value: r.Constants.T_EVAL, re: /^eval\b/i },
              { value: r.Constants.T_EXIT, re: /^(?:exit|die)\b/i },
              { value: r.Constants.T_EXTENDS, re: /^extends\b/i },
              { value: r.Constants.T_FINAL, re: /^final\b/i },
              { value: r.Constants.T_FINALLY, re: /^finally\b/i },
              { value: r.Constants.T_FN, re: /^fn\b/i },
              { value: r.Constants.T_FOR, re: /^for\b/i },
              { value: r.Constants.T_FOREACH, re: /^foreach\b/i },
              { value: r.Constants.T_FUNCTION, re: /^function\b/i },
              { value: r.Constants.T_GLOBAL, re: /^global\b/i },
              { value: r.Constants.T_GOTO, re: /^goto\b/i },
              { value: r.Constants.T_IF, re: /^if\b/i },
              { value: r.Constants.T_IMPLEMENTS, re: /^implements\b/i },
              { value: r.Constants.T_INCLUDE, re: /^include\b/i },
              { value: r.Constants.T_INCLUDE_ONCE, re: /^include_once\b/i },
              { value: r.Constants.T_INSTANCEOF, re: /^instanceof\b/i },
              { value: r.Constants.T_INSTEADOF, re: /^insteadof\b/i },
              { value: r.Constants.T_INTERFACE, re: /^interface\b/i },
              { value: r.Constants.T_ISSET, re: /^isset\b/i },
              { value: r.Constants.T_LIST, re: /^list\b/i },
              { value: r.Constants.T_NAMESPACE, re: /^namespace\b/i },
              { value: r.Constants.T_NEW, re: /^new\b/i },
              { value: r.Constants.T_LOGICAL_OR, re: /^or\b/i },
              { value: r.Constants.T_PRINT, re: /^print\b/i },
              { value: r.Constants.T_PRIVATE, re: /^private\b/i },
              { value: r.Constants.T_PROTECTED, re: /^protected\b/i },
              { value: r.Constants.T_PUBLIC, re: /^public\b/i },
              { value: r.Constants.T_REQUIRE, re: /^require\b/i },
              { value: r.Constants.T_REQUIRE_ONCE, re: /^require_once\b/i },
              { value: r.Constants.T_STATIC, re: /^static\b/i },
              { value: r.Constants.T_SWITCH, re: /^switch\b/i },
              { value: r.Constants.T_THROW, re: /^throw\b/i },
              { value: r.Constants.T_TRAIT, re: /^trait\b/i },
              { value: r.Constants.T_TRY, re: /^try\b/i },
              { value: r.Constants.T_UNSET, re: /^unset\b/i },
              { value: r.Constants.T_USE, re: /^use\b/i },
              { value: r.Constants.T_VAR, re: /^var\b/i },
              { value: r.Constants.T_WHILE, re: /^while\b/i },
              { value: r.Constants.T_LOGICAL_XOR, re: /^xor\b/i },
              { value: r.Constants.T_YIELD_FROM, re: /^yield\s+from\b/i },
              { value: r.Constants.T_YIELD, re: /^yield\b/i },
              { value: r.Constants.T_RETURN, re: /^return\b/i },
              { value: r.Constants.T_METHOD_C, re: /^__METHOD__\b/i },
              { value: r.Constants.T_LINE, re: /^__LINE__\b/i },
              { value: r.Constants.T_FILE, re: /^__FILE__\b/i },
              { value: r.Constants.T_FUNC_C, re: /^__FUNCTION__\b/i },
              { value: r.Constants.T_NS_C, re: /^__NAMESPACE__\b/i },
              { value: r.Constants.T_TRAIT_C, re: /^__TRAIT__\b/i },
              { value: r.Constants.T_DIR, re: /^__DIR__\b/i },
              { value: r.Constants.T_CLASS_C, re: /^__CLASS__\b/i },
              { value: r.Constants.T_AND_EQUAL, re: /^&=/ },
              {
                value: r.Constants.T_ARRAY_CAST,
                re: /^\([ \t]*array[ \t]*\)/i,
              },
              {
                value: r.Constants.T_BOOL_CAST,
                re: /^\([ \t]*(?:bool|boolean)[ \t]*\)/i,
              },
              {
                value: r.Constants.T_DOUBLE_CAST,
                re: /^\([ \t]*(?:real|float|double)[ \t]*\)/i,
              },
              {
                value: r.Constants.T_INT_CAST,
                re: /^\([ \t]*(?:int|integer)[ \t]*\)/i,
              },
              {
                value: r.Constants.T_OBJECT_CAST,
                re: /^\([ \t]*object[ \t]*\)/i,
              },
              {
                value: r.Constants.T_STRING_CAST,
                re: /^\([ \t]*(?:binary|string)[ \t]*\)/i,
              },
              {
                value: r.Constants.T_UNSET_CAST,
                re: /^\([ \t]*unset[ \t]*\)/i,
              },
              { value: r.Constants.T_BOOLEAN_AND, re: /^&&/ },
              { value: r.Constants.T_BOOLEAN_OR, re: /^\|\|/ },
              {
                value: r.Constants.T_CLOSE_TAG,
                re: /^(?:\?>|<\/script>)(\r\n|\r|\n)?/i,
                func: function () {
                  u('INITIAL');
                },
              },
              { value: r.Constants.T_DOUBLE_ARROW, re: /^=>/ },
              { value: r.Constants.T_PAAMAYIM_NEKUDOTAYIM, re: /^::/ },
              { value: r.Constants.T_INC, re: /^\+\+/ },
              { value: r.Constants.T_DEC, re: /^--/ },
              { value: r.Constants.T_CONCAT_EQUAL, re: /^\.=/ },
              { value: r.Constants.T_DIV_EQUAL, re: /^\/=/ },
              { value: r.Constants.T_XOR_EQUAL, re: /^\^=/ },
              { value: r.Constants.T_MUL_EQUAL, re: /^\*=/ },
              { value: r.Constants.T_MOD_EQUAL, re: /^%=/ },
              { value: r.Constants.T_SL_EQUAL, re: /^<<=/ },
              {
                value: r.Constants.T_START_HEREDOC,
                re: new RegExp(
                  "^[bB]?<<<[ \\t]*'(" + p + ")'(?:\\r\\n|\\r|\\n)"
                ),
                func: function (e) {
                  (n = e[1]), u('NOWDOC');
                },
              },
              {
                value: r.Constants.T_START_HEREDOC,
                re: new RegExp(
                  '^[bB]?<<<[ \\t]*("?)(' + p + ')\\1(?:\\r\\n|\\r|\\n)'
                ),
                func: function (e) {
                  (n = e[2]), (i = !0), u('HEREDOC');
                },
              },
              { value: r.Constants.T_SL, re: /^<</ },
              { value: r.Constants.T_SPACESHIP, re: /^<=>/ },
              { value: r.Constants.T_IS_SMALLER_OR_EQUAL, re: /^<=/ },
              { value: r.Constants.T_SR_EQUAL, re: /^>>=/ },
              { value: r.Constants.T_SR, re: /^>>/ },
              { value: r.Constants.T_IS_GREATER_OR_EQUAL, re: /^>=/ },
              { value: r.Constants.T_OR_EQUAL, re: /^\|=/ },
              { value: r.Constants.T_PLUS_EQUAL, re: /^\+=/ },
              { value: r.Constants.T_MINUS_EQUAL, re: /^-=/ },
              {
                value: r.Constants.T_OBJECT_OPERATOR,
                re: new RegExp('^->(?=[ \n\r	]*' + p + ')'),
                func: function () {
                  a('LOOKING_FOR_PROPERTY');
                },
              },
              { value: r.Constants.T_OBJECT_OPERATOR, re: /^->/i },
              { value: r.Constants.T_ELLIPSIS, re: /^\.\.\./ },
              { value: r.Constants.T_POW_EQUAL, re: /^\*\*=/ },
              { value: r.Constants.T_POW, re: /^\*\*/ },
              { value: r.Constants.T_COALESCE, re: /^\?\?/ },
              { value: r.Constants.T_COMMENT, re: /^\/\*([\S\s]*?)(?:\*\/|$)/ },
              {
                value: r.Constants.T_COMMENT,
                re: /^(?:\/\/|#)[^\r\n?]*(?:\?(?!>)[^\r\n?]*)*(?:\r\n|\r|\n)?/,
              },
              { value: r.Constants.T_IS_IDENTICAL, re: /^===/ },
              { value: r.Constants.T_IS_EQUAL, re: /^==/ },
              { value: r.Constants.T_IS_NOT_IDENTICAL, re: /^!==/ },
              { value: r.Constants.T_IS_NOT_EQUAL, re: /^(!=|<>)/ },
              {
                value: r.Constants.T_DNUMBER,
                re: /^(?:[0-9]+\.[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?/,
              },
              { value: r.Constants.T_DNUMBER, re: /^[0-9]+[eE][+-]?[0-9]+/ },
              {
                value: r.Constants.T_LNUMBER,
                re: /^(?:0x[0-9A-F]+|0b[01]+|[0-9]+)/i,
              },
              { value: r.Constants.T_VARIABLE, re: new RegExp('^\\$' + p) },
              {
                value: r.Constants.T_CONSTANT_ENCAPSED_STRING,
                re: /^[bB]?'[^'\\]*(?:\\[\s\S][^'\\]*)*'/,
              },
              {
                value: r.Constants.T_CONSTANT_ENCAPSED_STRING,
                re: new RegExp('^[bB]?"' + d('"') + '"'),
              },
              {
                value: -1,
                re: /^[bB]?"/,
                func: function () {
                  u('DOUBLE_QUOTES');
                },
              },
              {
                value: -1,
                re: /^`/,
                func: function () {
                  u('BACKTICKS');
                },
              },
              { value: r.Constants.T_NS_SEPARATOR, re: /^\\/ },
              {
                value: r.Constants.T_STRING,
                re: /^[a-zA-Z_\x7f-\uffff][a-zA-Z0-9_\x7f-\uffff]*/,
              },
              {
                value: -1,
                re: /^\{/,
                func: function () {
                  a('IN_SCRIPTING');
                },
              },
              {
                value: -1,
                re: /^\}/,
                func: function () {
                  o > 0 && f();
                },
              },
              { value: -1, re: /^[\[\];:?()!.,><=+-/*|&@^%"'$~]/ },
            ],
            DOUBLE_QUOTES: v.concat([
              {
                value: -1,
                re: /^"/,
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
              {
                value: r.Constants.T_ENCAPSED_AND_WHITESPACE,
                re: new RegExp('^' + d('"')),
              },
            ]),
            BACKTICKS: v.concat([
              {
                value: -1,
                re: /^`/,
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
              {
                value: r.Constants.T_ENCAPSED_AND_WHITESPACE,
                re: new RegExp('^' + d('`')),
              },
            ]),
            VAR_OFFSET: [
              {
                value: -1,
                re: /^\]/,
                func: function () {
                  f();
                },
              },
              {
                value: r.Constants.T_NUM_STRING,
                re: /^(?:0x[0-9A-F]+|0b[01]+|[0-9]+)/i,
              },
              { value: r.Constants.T_VARIABLE, re: new RegExp('^\\$' + p) },
              { value: r.Constants.T_STRING, re: new RegExp('^' + p) },
              { value: -1, re: /^[;:,.\[()|^&+-/*=%!~$<>?@{}"`]/ },
            ],
            LOOKING_FOR_PROPERTY: [
              { value: r.Constants.T_OBJECT_OPERATOR, re: /^->/ },
              {
                value: r.Constants.T_STRING,
                re: new RegExp('^' + p),
                func: function () {
                  f();
                },
              },
              { value: r.Constants.T_WHITESPACE, re: /^[ \n\r\t]+/ },
            ],
            LOOKING_FOR_VARNAME: [
              {
                value: r.Constants.T_STRING_VARNAME,
                re: new RegExp('^' + p + '(?=[\\[}])'),
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
            ],
            NOWDOC: [
              {
                value: r.Constants.T_END_HEREDOC,
                matchFunc: function (e) {
                  var t = new RegExp('^' + n + '(?=;?[\\r\\n])');
                  return e.match(t) ? [e.substr(0, n.length)] : null;
                },
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
              {
                value: r.Constants.T_ENCAPSED_AND_WHITESPACE,
                matchFunc: function (e) {
                  var t = new RegExp('[\\r\\n]' + n + '(?=;?[\\r\\n])'),
                    r = t.exec(e),
                    i = r ? r.index + 1 : e.length;
                  return [e.substring(0, i)];
                },
              },
            ],
            HEREDOC: v.concat([
              {
                value: r.Constants.T_END_HEREDOC,
                matchFunc: function (e) {
                  if (!i) return null;
                  var t = new RegExp('^' + n + '(?=;?[\\r\\n])');
                  return e.match(t) ? [e.substr(0, n.length)] : null;
                },
                func: function () {
                  u('IN_SCRIPTING');
                },
              },
              {
                value: r.Constants.T_ENCAPSED_AND_WHITESPACE,
                matchFunc: function (e) {
                  var t = e.length,
                    r = new RegExp('^' + d('')),
                    s = r.exec(e);
                  return (
                    s && (t = s[0].length),
                    (r = new RegExp('([\\r\\n])' + n + '(?=;?[\\r\\n])')),
                    (s = r.exec(e.substring(0, t))),
                    s ? ((t = s.index + 1), (i = !0)) : (i = !1),
                    t == 0 ? null : [e.substring(0, t)]
                  );
                },
              },
            ]),
          },
          g = [],
          y = 1,
          b = !0;
        if (e === null) return g;
        typeof e != 'string' && (e = e.toString());
        while (e.length > 0 && b === !0) {
          var w = s[o],
            E = m[w];
          b = E.some(function (t) {
            var n = t.matchFunc !== undefined ? t.matchFunc(e) : e.match(t.re);
            if (n !== null) {
              if (n[0].length == 0) throw new Error('empty match');
              t.func !== undefined && t.func(n);
              if (t.value === -1) g.push(n[0]);
              else {
                var r = n[0];
                g.push([parseInt(t.value, 10), r, y]),
                  (y += r.split('\n').length - 1);
              }
              return (e = e.substring(n[0].length)), !0;
            }
            return !1;
          });
        }
        return g;
      }),
      (r.Parser = function (e, t) {
        var n = this.yybase,
          i = this.yydefault,
          s = this.yycheck,
          o = this.yyaction,
          u = this.yylen,
          a = this.yygbase,
          f = this.yygcheck,
          l = this.yyp,
          c = this.yygoto,
          h = this.yylhs,
          p = this.terminals,
          d = this.translate,
          v = this.yygdefault;
        (this.pos = -1),
          (this.line = 1),
          (this.tokenMap = this.createTokenMap()),
          (this.dropTokens = {}),
          (this.dropTokens[r.Constants.T_WHITESPACE] = 1),
          (this.dropTokens[r.Constants.T_OPEN_TAG] = 1);
        var m = [];
        e.forEach(function (e, t) {
          typeof e == 'object' && e[0] === r.Constants.T_OPEN_TAG_WITH_ECHO
            ? (m.push([r.Constants.T_OPEN_TAG, e[1], e[2]]),
              m.push([r.Constants.T_ECHO, e[1], e[2]]))
            : m.push(e);
        }),
          (this.tokens = m);
        var g = this.TOKEN_NONE;
        (this.startAttributes = { startLine: 1 }), (this.endAttributes = {});
        var y = [this.startAttributes],
          b = 0,
          w = [b];
        (this.yyastk = []), (this.stackPos = 0);
        var E, S;
        for (;;) {
          if (n[b] === 0) E = i[b];
          else {
            g === this.TOKEN_NONE &&
              ((S = this.getNextToken()),
              (g =
                S >= 0 && S < this.TOKEN_MAP_SIZE ? d[S] : this.TOKEN_INVALID),
              (y[this.stackPos] = this.startAttributes));
            if (
              (((E = n[b] + g) >= 0 && E < this.YYLAST && s[E] === g) ||
                (b < this.YY2TBLSTATE &&
                  (E = n[b + this.YYNLSTATES] + g) >= 0 &&
                  E < this.YYLAST &&
                  s[E] === g)) &&
              (E = o[E]) !== this.YYDEFAULT
            )
              if (E > 0) {
                ++this.stackPos,
                  (w[this.stackPos] = b = E),
                  (this.yyastk[this.stackPos] = this.tokenValue),
                  (y[this.stackPos] = this.startAttributes),
                  (g = this.TOKEN_NONE);
                if (E < this.YYNLSTATES) continue;
                E -= this.YYNLSTATES;
              } else E = -E;
            else E = i[b];
          }
          for (;;) {
            if (E === 0) return this.yyval;
            if (E === this.YYUNEXPECTED) {
              if (t !== !0) {
                var T = [];
                for (var N = 0; N < this.TOKEN_MAP_SIZE; ++N)
                  if (
                    ((E = n[b] + N) >= 0 && E < this.YYLAST && s[E] == N) ||
                    (b < this.YY2TBLSTATE &&
                      (E = n[b + this.YYNLSTATES] + N) &&
                      E < this.YYLAST &&
                      s[E] == N)
                  )
                    if (o[E] != this.YYUNEXPECTED) {
                      if (T.length == 4) {
                        T = [];
                        break;
                      }
                      T.push(this.terminals[N]);
                    }
                var C = '';
                throw (
                  (T.length && (C = ', expecting ' + T.join(' or ')),
                  new r.ParseError(
                    'syntax error, unexpected ' + p[g] + C,
                    this.startAttributes.startLine
                  ))
                );
              }
              return this.startAttributes.startLine;
            }
            for (var x in this.endAttributes)
              y[this.stackPos - u[E]][x] = this.endAttributes[x];
            (this.stackPos -= u[E]),
              (E = h[E]),
              (l = a[E] + w[this.stackPos]) >= 0 &&
              l < this.YYGLAST &&
              f[l] === E
                ? (b = c[l])
                : (b = v[E]),
              ++this.stackPos,
              (w[this.stackPos] = b),
              (this.yyastk[this.stackPos] = this.yyval),
              (y[this.stackPos] = this.startAttributes);
            if (b < this.YYNLSTATES) break;
            E = b - this.YYNLSTATES;
          }
        }
      }),
      (r.ParseError = function (e, t) {
        (this.message = e), (this.line = t);
      }),
      (r.Parser.prototype.getNextToken = function () {
        (this.startAttributes = {}), (this.endAttributes = {});
        var e, t;
        while (this.tokens[++this.pos] !== undefined) {
          e = this.tokens[this.pos];
          if (typeof e == 'string')
            return (
              (this.startAttributes.startLine = this.line),
              (this.endAttributes.endLine = this.line),
              'b"' === e
                ? ((this.tokenValue = 'b"'), '"'.charCodeAt(0))
                : ((this.tokenValue = e), e.charCodeAt(0))
            );
          this.line += (t = e[1].match(/\n/g)) === null ? 0 : t.length;
          if (r.Constants.T_COMMENT === e[0])
            Array.isArray(this.startAttributes.comments) ||
              (this.startAttributes.comments = []),
              this.startAttributes.comments.push({
                type: 'comment',
                comment: e[1],
                line: e[2],
              });
          else if (r.Constants.T_DOC_COMMENT === e[0])
            this.startAttributes.comments.push(
              new PHPParser_Comment_Doc(e[1], e[2])
            );
          else if (this.dropTokens[e[0]] === undefined)
            return (
              (this.tokenValue = e[1]),
              (this.startAttributes.startLine = e[2]),
              (this.endAttributes.endLine = this.line),
              this.tokenMap[e[0]]
            );
        }
        return (this.startAttributes.startLine = this.line), 0;
      }),
      (r.Parser.prototype.tokenName = function (e) {
        var t = [
            'T_INCLUDE',
            'T_INCLUDE_ONCE',
            'T_EVAL',
            'T_REQUIRE',
            'T_REQUIRE_ONCE',
            'T_LOGICAL_OR',
            'T_LOGICAL_XOR',
            'T_LOGICAL_AND',
            'T_PRINT',
            'T_YIELD',
            'T_DOUBLE_ARROW',
            'T_YIELD_FROM',
            'T_PLUS_EQUAL',
            'T_MINUS_EQUAL',
            'T_MUL_EQUAL',
            'T_DIV_EQUAL',
            'T_CONCAT_EQUAL',
            'T_MOD_EQUAL',
            'T_AND_EQUAL',
            'T_OR_EQUAL',
            'T_XOR_EQUAL',
            'T_SL_EQUAL',
            'T_SR_EQUAL',
            'T_POW_EQUAL',
            'T_COALESCE_EQUAL',
            'T_COALESCE',
            'T_BOOLEAN_OR',
            'T_BOOLEAN_AND',
            'T_IS_EQUAL',
            'T_IS_NOT_EQUAL',
            'T_IS_IDENTICAL',
            'T_IS_NOT_IDENTICAL',
            'T_SPACESHIP',
            'T_IS_SMALLER_OR_EQUAL',
            'T_IS_GREATER_OR_EQUAL',
            'T_SL',
            'T_SR',
            'T_INSTANCEOF',
            'T_INC',
            'T_DEC',
            'T_INT_CAST',
            'T_DOUBLE_CAST',
            'T_STRING_CAST',
            'T_ARRAY_CAST',
            'T_OBJECT_CAST',
            'T_BOOL_CAST',
            'T_UNSET_CAST',
            'T_POW',
            'T_NEW',
            'T_CLONE',
            'T_EXIT',
            'T_IF',
            'T_ELSEIF',
            'T_ELSE',
            'T_ENDIF',
            'T_LNUMBER',
            'T_DNUMBER',
            'T_STRING',
            'T_STRING_VARNAME',
            'T_VARIABLE',
            'T_NUM_STRING',
            'T_INLINE_HTML',
            'T_CHARACTER',
            'T_BAD_CHARACTER',
            'T_ENCAPSED_AND_WHITESPACE',
            'T_CONSTANT_ENCAPSED_STRING',
            'T_ECHO',
            'T_DO',
            'T_WHILE',
            'T_ENDWHILE',
            'T_FOR',
            'T_ENDFOR',
            'T_FOREACH',
            'T_ENDFOREACH',
            'T_DECLARE',
            'T_ENDDECLARE',
            'T_AS',
            'T_SWITCH',
            'T_ENDSWITCH',
            'T_CASE',
            'T_DEFAULT',
            'T_BREAK',
            'T_CONTINUE',
            'T_GOTO',
            'T_FUNCTION',
            'T_FN',
            'T_CONST',
            'T_RETURN',
            'T_TRY',
            'T_CATCH',
            'T_FINALLY',
            'T_THROW',
            'T_USE',
            'T_INSTEADOF',
            'T_GLOBAL',
            'T_STATIC',
            'T_ABSTRACT',
            'T_FINAL',
            'T_PRIVATE',
            'T_PROTECTED',
            'T_PUBLIC',
            'T_VAR',
            'T_UNSET',
            'T_ISSET',
            'T_EMPTY',
            'T_HALT_COMPILER',
            'T_CLASS',
            'T_TRAIT',
            'T_INTERFACE',
            'T_EXTENDS',
            'T_IMPLEMENTS',
            'T_OBJECT_OPERATOR',
            'T_DOUBLE_ARROW',
            'T_LIST',
            'T_ARRAY',
            'T_CALLABLE',
            'T_CLASS_C',
            'T_TRAIT_C',
            'T_METHOD_C',
            'T_FUNC_C',
            'T_LINE',
            'T_FILE',
            'T_COMMENT',
            'T_DOC_COMMENT',
            'T_OPEN_TAG',
            'T_OPEN_TAG_WITH_ECHO',
            'T_CLOSE_TAG',
            'T_WHITESPACE',
            'T_START_HEREDOC',
            'T_END_HEREDOC',
            'T_DOLLAR_OPEN_CURLY_BRACES',
            'T_CURLY_OPEN',
            'T_PAAMAYIM_NEKUDOTAYIM',
            'T_NAMESPACE',
            'T_NS_C',
            'T_DIR',
            'T_NS_SEPARATOR',
            'T_ELLIPSIS',
          ],
          n = 'UNKNOWN';
        return (
          t.some(function (t) {
            return r.Constants[t] === e ? ((n = t), !0) : !1;
          }),
          n
        );
      }),
      (r.Parser.prototype.createTokenMap = function () {
        var e = {},
          t,
          n;
        for (n = 256; n < 1e3; ++n)
          r.Constants.T_OPEN_TAG_WITH_ECHO === n
            ? (e[n] = r.Constants.T_ECHO)
            : r.Constants.T_CLOSE_TAG === n
            ? (e[n] = 59)
            : 'UNKNOWN' !== (t = this.tokenName(n)) && (e[n] = this[t]);
        return e;
      }),
      (r.Parser.prototype.TOKEN_NONE = -1),
      (r.Parser.prototype.TOKEN_INVALID = 159),
      (r.Parser.prototype.TOKEN_MAP_SIZE = 394),
      (r.Parser.prototype.YYLAST = 964),
      (r.Parser.prototype.YY2TBLSTATE = 348),
      (r.Parser.prototype.YYGLAST = 508),
      (r.Parser.prototype.YYNLSTATES = 602),
      (r.Parser.prototype.YYUNEXPECTED = 32767),
      (r.Parser.prototype.YYDEFAULT = -32766),
      (r.Parser.prototype.YYERRTOK = 256),
      (r.Parser.prototype.T_INCLUDE = 257),
      (r.Parser.prototype.T_INCLUDE_ONCE = 258),
      (r.Parser.prototype.T_EVAL = 259),
      (r.Parser.prototype.T_REQUIRE = 260),
      (r.Parser.prototype.T_REQUIRE_ONCE = 261),
      (r.Parser.prototype.T_LOGICAL_OR = 262),
      (r.Parser.prototype.T_LOGICAL_XOR = 263),
      (r.Parser.prototype.T_LOGICAL_AND = 264),
      (r.Parser.prototype.T_PRINT = 265),
      (r.Parser.prototype.T_YIELD = 266),
      (r.Parser.prototype.T_DOUBLE_ARROW = 267),
      (r.Parser.prototype.T_YIELD_FROM = 268),
      (r.Parser.prototype.T_PLUS_EQUAL = 269),
      (r.Parser.prototype.T_MINUS_EQUAL = 270),
      (r.Parser.prototype.T_MUL_EQUAL = 271),
      (r.Parser.prototype.T_DIV_EQUAL = 272),
      (r.Parser.prototype.T_CONCAT_EQUAL = 273),
      (r.Parser.prototype.T_MOD_EQUAL = 274),
      (r.Parser.prototype.T_AND_EQUAL = 275),
      (r.Parser.prototype.T_OR_EQUAL = 276),
      (r.Parser.prototype.T_XOR_EQUAL = 277),
      (r.Parser.prototype.T_SL_EQUAL = 278),
      (r.Parser.prototype.T_SR_EQUAL = 279),
      (r.Parser.prototype.T_POW_EQUAL = 280),
      (r.Parser.prototype.T_COALESCE_EQUAL = 281),
      (r.Parser.prototype.T_COALESCE = 282),
      (r.Parser.prototype.T_BOOLEAN_OR = 283),
      (r.Parser.prototype.T_BOOLEAN_AND = 284),
      (r.Parser.prototype.T_IS_EQUAL = 285),
      (r.Parser.prototype.T_IS_NOT_EQUAL = 286),
      (r.Parser.prototype.T_IS_IDENTICAL = 287),
      (r.Parser.prototype.T_IS_NOT_IDENTICAL = 288),
      (r.Parser.prototype.T_SPACESHIP = 289),
      (r.Parser.prototype.T_IS_SMALLER_OR_EQUAL = 290),
      (r.Parser.prototype.T_IS_GREATER_OR_EQUAL = 291),
      (r.Parser.prototype.T_SL = 292),
      (r.Parser.prototype.T_SR = 293),
      (r.Parser.prototype.T_INSTANCEOF = 294),
      (r.Parser.prototype.T_INC = 295),
      (r.Parser.prototype.T_DEC = 296),
      (r.Parser.prototype.T_INT_CAST = 297),
      (r.Parser.prototype.T_DOUBLE_CAST = 298),
      (r.Parser.prototype.T_STRING_CAST = 299),
      (r.Parser.prototype.T_ARRAY_CAST = 300),
      (r.Parser.prototype.T_OBJECT_CAST = 301),
      (r.Parser.prototype.T_BOOL_CAST = 302),
      (r.Parser.prototype.T_UNSET_CAST = 303),
      (r.Parser.prototype.T_POW = 304),
      (r.Parser.prototype.T_NEW = 305),
      (r.Parser.prototype.T_CLONE = 306),
      (r.Parser.prototype.T_EXIT = 307),
      (r.Parser.prototype.T_IF = 308),
      (r.Parser.prototype.T_ELSEIF = 309),
      (r.Parser.prototype.T_ELSE = 310),
      (r.Parser.prototype.T_ENDIF = 311),
      (r.Parser.prototype.T_LNUMBER = 312),
      (r.Parser.prototype.T_DNUMBER = 313),
      (r.Parser.prototype.T_STRING = 314),
      (r.Parser.prototype.T_STRING_VARNAME = 315),
      (r.Parser.prototype.T_VARIABLE = 316),
      (r.Parser.prototype.T_NUM_STRING = 317),
      (r.Parser.prototype.T_INLINE_HTML = 318),
      (r.Parser.prototype.T_CHARACTER = 319),
      (r.Parser.prototype.T_BAD_CHARACTER = 320),
      (r.Parser.prototype.T_ENCAPSED_AND_WHITESPACE = 321),
      (r.Parser.prototype.T_CONSTANT_ENCAPSED_STRING = 322),
      (r.Parser.prototype.T_ECHO = 323),
      (r.Parser.prototype.T_DO = 324),
      (r.Parser.prototype.T_WHILE = 325),
      (r.Parser.prototype.T_ENDWHILE = 326),
      (r.Parser.prototype.T_FOR = 327),
      (r.Parser.prototype.T_ENDFOR = 328),
      (r.Parser.prototype.T_FOREACH = 329),
      (r.Parser.prototype.T_ENDFOREACH = 330),
      (r.Parser.prototype.T_DECLARE = 331),
      (r.Parser.prototype.T_ENDDECLARE = 332),
      (r.Parser.prototype.T_AS = 333),
      (r.Parser.prototype.T_SWITCH = 334),
      (r.Parser.prototype.T_ENDSWITCH = 335),
      (r.Parser.prototype.T_CASE = 336),
      (r.Parser.prototype.T_DEFAULT = 337),
      (r.Parser.prototype.T_BREAK = 338),
      (r.Parser.prototype.T_CONTINUE = 339),
      (r.Parser.prototype.T_GOTO = 340),
      (r.Parser.prototype.T_FUNCTION = 341),
      (r.Parser.prototype.T_FN = 342),
      (r.Parser.prototype.T_CONST = 343),
      (r.Parser.prototype.T_RETURN = 344),
      (r.Parser.prototype.T_TRY = 345),
      (r.Parser.prototype.T_CATCH = 346),
      (r.Parser.prototype.T_FINALLY = 347),
      (r.Parser.prototype.T_THROW = 348),
      (r.Parser.prototype.T_USE = 349),
      (r.Parser.prototype.T_INSTEADOF = 350),
      (r.Parser.prototype.T_GLOBAL = 351),
      (r.Parser.prototype.T_STATIC = 352),
      (r.Parser.prototype.T_ABSTRACT = 353),
      (r.Parser.prototype.T_FINAL = 354),
      (r.Parser.prototype.T_PRIVATE = 355),
      (r.Parser.prototype.T_PROTECTED = 356),
      (r.Parser.prototype.T_PUBLIC = 357),
      (r.Parser.prototype.T_VAR = 358),
      (r.Parser.prototype.T_UNSET = 359),
      (r.Parser.prototype.T_ISSET = 360),
      (r.Parser.prototype.T_EMPTY = 361),
      (r.Parser.prototype.T_HALT_COMPILER = 362),
      (r.Parser.prototype.T_CLASS = 363),
      (r.Parser.prototype.T_TRAIT = 364),
      (r.Parser.prototype.T_INTERFACE = 365),
      (r.Parser.prototype.T_EXTENDS = 366),
      (r.Parser.prototype.T_IMPLEMENTS = 367),
      (r.Parser.prototype.T_OBJECT_OPERATOR = 368),
      (r.Parser.prototype.T_LIST = 369),
      (r.Parser.prototype.T_ARRAY = 370),
      (r.Parser.prototype.T_CALLABLE = 371),
      (r.Parser.prototype.T_CLASS_C = 372),
      (r.Parser.prototype.T_TRAIT_C = 373),
      (r.Parser.prototype.T_METHOD_C = 374),
      (r.Parser.prototype.T_FUNC_C = 375),
      (r.Parser.prototype.T_LINE = 376),
      (r.Parser.prototype.T_FILE = 377),
      (r.Parser.prototype.T_COMMENT = 378),
      (r.Parser.prototype.T_DOC_COMMENT = 379),
      (r.Parser.prototype.T_OPEN_TAG = 380),
      (r.Parser.prototype.T_OPEN_TAG_WITH_ECHO = 381),
      (r.Parser.prototype.T_CLOSE_TAG = 382),
      (r.Parser.prototype.T_WHITESPACE = 383),
      (r.Parser.prototype.T_START_HEREDOC = 384),
      (r.Parser.prototype.T_END_HEREDOC = 385),
      (r.Parser.prototype.T_DOLLAR_OPEN_CURLY_BRACES = 386),
      (r.Parser.prototype.T_CURLY_OPEN = 387),
      (r.Parser.prototype.T_PAAMAYIM_NEKUDOTAYIM = 388),
      (r.Parser.prototype.T_NAMESPACE = 389),
      (r.Parser.prototype.T_NS_C = 390),
      (r.Parser.prototype.T_DIR = 391),
      (r.Parser.prototype.T_NS_SEPARATOR = 392),
      (r.Parser.prototype.T_ELLIPSIS = 393),
      (r.Parser.prototype.terminals = [
        'EOF',
        'error',
        'T_INCLUDE',
        'T_INCLUDE_ONCE',
        'T_EVAL',
        'T_REQUIRE',
        'T_REQUIRE_ONCE',
        "','",
        'T_LOGICAL_OR',
        'T_LOGICAL_XOR',
        'T_LOGICAL_AND',
        'T_PRINT',
        'T_YIELD',
        'T_DOUBLE_ARROW',
        'T_YIELD_FROM',
        "'='",
        'T_PLUS_EQUAL',
        'T_MINUS_EQUAL',
        'T_MUL_EQUAL',
        'T_DIV_EQUAL',
        'T_CONCAT_EQUAL',
        'T_MOD_EQUAL',
        'T_AND_EQUAL',
        'T_OR_EQUAL',
        'T_XOR_EQUAL',
        'T_SL_EQUAL',
        'T_SR_EQUAL',
        'T_POW_EQUAL',
        'T_COALESCE_EQUAL',
        "'?'",
        "':'",
        'T_COALESCE',
        'T_BOOLEAN_OR',
        'T_BOOLEAN_AND',
        "'|'",
        "'^'",
        "'&'",
        'T_IS_EQUAL',
        'T_IS_NOT_EQUAL',
        'T_IS_IDENTICAL',
        'T_IS_NOT_IDENTICAL',
        'T_SPACESHIP',
        "'<'",
        'T_IS_SMALLER_OR_EQUAL',
        "'>'",
        'T_IS_GREATER_OR_EQUAL',
        'T_SL',
        'T_SR',
        "'+'",
        "'-'",
        "'.'",
        "'*'",
        "'/'",
        "'%'",
        "'!'",
        'T_INSTANCEOF',
        "'~'",
        'T_INC',
        'T_DEC',
        'T_INT_CAST',
        'T_DOUBLE_CAST',
        'T_STRING_CAST',
        'T_ARRAY_CAST',
        'T_OBJECT_CAST',
        'T_BOOL_CAST',
        'T_UNSET_CAST',
        "'@'",
        'T_POW',
        "'['",
        'T_NEW',
        'T_CLONE',
        'T_EXIT',
        'T_IF',
        'T_ELSEIF',
        'T_ELSE',
        'T_ENDIF',
        'T_LNUMBER',
        'T_DNUMBER',
        'T_STRING',
        'T_STRING_VARNAME',
        'T_VARIABLE',
        'T_NUM_STRING',
        'T_INLINE_HTML',
        'T_ENCAPSED_AND_WHITESPACE',
        'T_CONSTANT_ENCAPSED_STRING',
        'T_ECHO',
        'T_DO',
        'T_WHILE',
        'T_ENDWHILE',
        'T_FOR',
        'T_ENDFOR',
        'T_FOREACH',
        'T_ENDFOREACH',
        'T_DECLARE',
        'T_ENDDECLARE',
        'T_AS',
        'T_SWITCH',
        'T_ENDSWITCH',
        'T_CASE',
        'T_DEFAULT',
        'T_BREAK',
        'T_CONTINUE',
        'T_GOTO',
        'T_FUNCTION',
        'T_FN',
        'T_CONST',
        'T_RETURN',
        'T_TRY',
        'T_CATCH',
        'T_FINALLY',
        'T_THROW',
        'T_USE',
        'T_INSTEADOF',
        'T_GLOBAL',
        'T_STATIC',
        'T_ABSTRACT',
        'T_FINAL',
        'T_PRIVATE',
        'T_PROTECTED',
        'T_PUBLIC',
        'T_VAR',
        'T_UNSET',
        'T_ISSET',
        'T_EMPTY',
        'T_HALT_COMPILER',
        'T_CLASS',
        'T_TRAIT',
        'T_INTERFACE',
        'T_EXTENDS',
        'T_IMPLEMENTS',
        'T_OBJECT_OPERATOR',
        'T_LIST',
        'T_ARRAY',
        'T_CALLABLE',
        'T_CLASS_C',
        'T_TRAIT_C',
        'T_METHOD_C',
        'T_FUNC_C',
        'T_LINE',
        'T_FILE',
        'T_START_HEREDOC',
        'T_END_HEREDOC',
        'T_DOLLAR_OPEN_CURLY_BRACES',
        'T_CURLY_OPEN',
        'T_PAAMAYIM_NEKUDOTAYIM',
        'T_NAMESPACE',
        'T_NS_C',
        'T_DIR',
        'T_NS_SEPARATOR',
        'T_ELLIPSIS',
        "';'",
        "'{'",
        "'}'",
        "'('",
        "')'",
        "'`'",
        "']'",
        "'\"'",
        "'$'",
        '???',
      ]),
      (r.Parser.prototype.translate = [
        0, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 54, 157, 159, 158, 53, 36, 159, 153, 154, 51, 48, 7,
        49, 50, 52, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 30, 150,
        42, 15, 44, 29, 66, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 68, 159, 156, 35, 159, 155, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 151, 34, 152, 56, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159,
        159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 159, 1, 2, 3, 4, 5, 6,
        8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        27, 28, 31, 32, 33, 37, 38, 39, 40, 41, 43, 45, 46, 47, 55, 57, 58, 59,
        60, 61, 62, 63, 64, 65, 67, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
        80, 81, 82, 159, 159, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94,
        95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
        110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
        124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137,
        138, 139, 159, 159, 159, 159, 159, 159, 140, 141, 142, 143, 144, 145,
        146, 147, 148, 149,
      ]),
      (r.Parser.prototype.yyaction = [
        607, 608, 609, 610, 611, 685, 612, 613, 614, 650, 651, 0, 32, 103, 104,
        105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, -32767, -32767,
        -32767, -32767, 94, 95, 96, 97, 98, -32766, -32766, -32766, 687, 491,
        -497, 904, 905, 906, 903, 902, 901, 904, 905, 906, 903, 902, 901, 615,
        938, 940, -32766, 9, -32766, -32766, -32766, -32766, -32766, -32766,
        -32766, -32766, -32766, 616, 617, 618, 619, 620, 621, 622, 333, 1104,
        683, -32766, -32766, -32766, 846, 1103, 119, 623, 624, 625, 626, 627,
        628, 629, 630, 631, 632, 633, 653, 654, 655, 656, 657, 645, 646, 647,
        675, 648, 649, 634, 635, 636, 637, 638, 639, 640, 677, 678, 679, 680,
        681, 682, 641, 642, 643, 644, 674, 665, 663, 664, 660, 661, 402, 652,
        658, 659, 666, 667, 669, 668, 670, 671, 45, 46, 421, 47, 48, 662, 673,
        672, 27, 49, 50, 233, 51, -32766, -32766, -32766, 96, 97, 98, 24,
        -32766, -32766, -32766, -458, 261, 121, 1023, -32766, -32766, -32766,
        1091, 1073, -32766, -32766, -32766, 1039, -32766, -32766, -32766,
        -32766, -32766, -32766, -496, -32766, -32766, -32766, 52, 53, -32766,
        -497, -32766, -32766, 54, 687, 55, 231, 232, 56, 57, 58, 59, 60, 61, 62,
        63, 1016, 24, 242, 64, 369, -32766, -32766, -32766, 226, 1040, 1041,
        423, 1076, 1073, -493, 880, 508, 1039, 436, 1023, -458, 768, 1073, 239,
        333, -500, -32766, -500, -32766, -32766, -32766, -32766, 856, 253, -458,
        276, 378, 372, 786, 68, 1073, -458, 685, -461, 278, 1126, 403, 289,
        1127, 288, 99, 100, 101, 303, 252, 433, 434, 822, -32766, 69, 261, 237,
        850, 851, 435, 436, 102, 1045, 1046, 1047, 1048, 1042, 1043, 256, 1016,
        -456, -456, 306, 444, 1049, 1044, 375, 133, 561, -239, 363, 66, 237,
        268, 692, 273, 278, 422, -137, -137, -137, -4, 768, 1073, 310, 278,
        1035, 757, 687, 362, 37, 20, 424, -137, 425, -137, 426, -137, 427, -137,
        127, 428, -295, 278, -295, 38, 39, 370, 371, -496, 271, 40, 429, 277,
        687, 65, 261, 1016, 302, 896, 430, 431, -456, -456, 333, -494, 432, 44,
        42, 743, 791, 373, 374, -457, -234, 562, -456, -456, 375, -32766,
        -32766, -32766, 882, -456, -456, 124, -493, 75, 850, 851, 333, -273,
        -260, 422, 768, 770, 576, -137, 261, 125, -32766, 278, 823, 757, 857,
        1073, 37, 20, 424, 240, 425, -178, 426, 589, 427, 393, 503, 428, 687,
        235, 241, 38, 39, 370, 371, 125, 354, 40, 429, 260, 259, 65, 267, 687,
        302, -457, 430, 431, -296, -177, -296, 24, 432, 305, 365, 700, 791, 373,
        374, -457, 120, 118, 24, 1073, 30, 366, -457, 1039, -460, 850, 851, 687,
        367, 691, 1073, 422, 291, 768, 1039, 333, -83, 770, 576, -4, 467, 757,
        126, 368, 37, 20, 424, -92, 425, 278, 426, 444, 427, 1016, 375, 428,
        -219, -219, -219, 38, 39, 370, 371, 333, 1016, 40, 429, 850, 851, 65,
        435, 436, 302, 236, 430, 431, 225, 708, -494, 709, 432, 435, 436, 743,
        791, 373, 374, 690, 387, 136, 1117, 578, 68, 413, 238, 8, 33, 278, 1053,
        227, 708, 687, 709, 68, 422, -260, 535, 21, 278, 770, 576, -219, 550,
        551, 757, 687, 116, 37, 20, 424, 117, 425, 358, 426, -178, 427, 132,
        328, 428, -218, -218, -218, 38, 39, 370, 371, 687, 333, 40, 429, 122,
        768, 65, 383, 384, 302, 123, 430, 431, 29, 234, 333, -177, 432, 528,
        529, 743, 791, 373, 374, 129, 850, 851, 135, 76, 77, 78, 1092, 881, 599,
        582, 254, 333, 137, 138, 782, 590, 593, 293, 767, 131, 252, 770, 576,
        -218, 31, 102, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
        93, 94, 95, 96, 97, 98, 99, 100, 101, 43, 252, 422, 558, 768, 687, 690,
        -32766, 471, 130, 476, 685, 757, 102, 553, 37, 20, 424, 526, 425, 688,
        426, 272, 427, 910, 1016, 428, 792, 1128, 793, 38, 39, 370, 583, 269,
        570, 40, 429, 536, 1052, 65, 275, 1055, 302, -415, 541, 270, -81, 10,
        391, 768, 432, 542, 554, 784, 594, 5, 0, 12, 577, 0, 0, 304, 0, 0, 0, 0,
        336, 342, 0, 0, 0, 0, 0, 0, 422, 0, 0, 0, 584, 770, 576, 0, 0, 0, 757,
        0, 0, 37, 20, 424, 343, 425, 0, 426, 0, 427, 768, 0, 428, 0, 0, 0, 38,
        39, 370, 347, 387, 473, 40, 429, 359, 360, 65, 744, 35, 302, 36, 597,
        598, 748, 422, 825, 809, 432, 816, 587, 876, 877, 806, 817, 757, 746,
        804, 37, 20, 424, 885, 425, 888, 426, 889, 427, 768, 886, 428, 887, 893,
        -485, 38, 39, 370, 579, 770, 576, 40, 429, 581, 585, 65, 586, 588, 302,
        592, 286, 287, 352, 353, 422, 580, 432, 1123, 591, 1125, 703, 790, 702,
        712, 757, 789, 713, 37, 20, 424, 710, 425, 1124, 426, 788, 427, 768,
        1004, 428, 711, 777, 785, 38, 39, 370, 808, 576, -483, 40, 429, 775,
        814, 65, 815, 1122, 302, 1074, 1067, 1081, 1086, 422, 1089, -237, 432,
        -461, -460, -459, 23, 25, 28, 757, 34, 41, 37, 20, 424, 67, 425, 70,
        426, 71, 427, 72, 73, 428, 74, 128, 134, 38, 39, 370, 139, 770, 576, 40,
        429, 229, 230, 65, 246, 247, 302, 248, 249, 250, 251, 290, 422, 355,
        432, 357, -427, -235, -234, 14, 15, 16, 757, 17, 19, 37, 20, 424, 325,
        425, 404, 426, 406, 427, 409, 411, 428, 412, 419, 567, 38, 39, 370, 770,
        576, 1027, 40, 429, 977, 1037, 65, 858, 1008, 302, -32766, -32766,
        -32766, -92, 13, 18, 22, 432, 263, 324, 501, 522, 569, 981, 978, 0, 994,
        0, 1036, 1065, 1066, -32766, 1080, -32766, -32766, -32766, -32766,
        -32766, -32766, -32767, -32767, -32767, -32767, -32767, 1120, 532, 770,
        576, 1054,
      ]),
      (r.Parser.prototype.yycheck = [
        2, 3, 4, 5, 6, 78, 8, 9, 10, 11, 12, 0, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 42, 43, 44, 45, 46, 47, 48, 49, 50, 8, 9, 10,
        78, 79, 7, 114, 115, 116, 117, 118, 119, 114, 115, 116, 117, 118, 119,
        55, 57, 58, 29, 7, 31, 32, 33, 34, 35, 36, 8, 9, 10, 69, 70, 71, 72, 73,
        74, 75, 114, 1, 78, 8, 9, 10, 1, 7, 13, 85, 86, 87, 88, 89, 90, 91, 92,
        93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108,
        109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
        123, 124, 125, 126, 127, 128, 129, 30, 131, 132, 133, 134, 135, 136,
        137, 138, 139, 2, 3, 4, 5, 6, 145, 146, 147, 7, 11, 12, 36, 14, 8, 9,
        10, 48, 49, 50, 68, 8, 9, 10, 68, 29, 7, 1, 8, 9, 10, 1, 80, 8, 9, 29,
        84, 31, 32, 33, 34, 35, 29, 7, 31, 32, 33, 48, 49, 29, 154, 31, 32, 54,
        78, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 114, 68, 69, 70, 71, 8,
        9, 10, 13, 76, 77, 78, 1, 80, 7, 1, 49, 84, 132, 1, 130, 1, 80, 7, 114,
        154, 29, 156, 31, 32, 33, 34, 1, 7, 144, 7, 103, 104, 1, 153, 80, 151,
        78, 153, 158, 78, 151, 114, 81, 7, 51, 52, 53, 7, 55, 122, 123, 30, 8,
        149, 29, 36, 132, 133, 131, 132, 67, 134, 135, 136, 137, 138, 139, 140,
        114, 68, 68, 7, 145, 146, 147, 148, 13, 78, 154, 125, 153, 36, 155, 1,
        157, 158, 72, 73, 74, 75, 0, 1, 80, 7, 158, 1, 82, 78, 7, 85, 86, 87,
        88, 89, 90, 91, 92, 93, 94, 151, 96, 103, 158, 105, 100, 101, 102, 103,
        154, 111, 106, 107, 68, 78, 110, 29, 114, 113, 120, 115, 116, 130, 130,
        114, 7, 121, 68, 68, 124, 125, 126, 127, 68, 154, 145, 144, 144, 148, 8,
        9, 10, 152, 151, 151, 30, 154, 151, 132, 133, 114, 152, 7, 72, 1, 150,
        151, 152, 29, 149, 29, 158, 150, 82, 154, 80, 85, 86, 87, 36, 89, 7, 91,
        151, 93, 130, 1, 96, 78, 36, 36, 100, 101, 102, 103, 149, 105, 106, 107,
        130, 130, 110, 111, 78, 113, 130, 115, 116, 103, 7, 105, 68, 121, 144,
        7, 124, 125, 126, 127, 144, 151, 151, 68, 80, 7, 7, 151, 84, 153, 132,
        133, 78, 7, 150, 80, 72, 145, 1, 84, 114, 30, 150, 151, 152, 83, 82,
        151, 7, 85, 86, 87, 154, 89, 158, 91, 145, 93, 114, 148, 96, 97, 98, 99,
        100, 101, 102, 103, 114, 114, 106, 107, 132, 133, 110, 131, 132, 113,
        36, 115, 116, 95, 103, 154, 105, 121, 131, 132, 124, 125, 126, 127, 80,
        148, 13, 83, 151, 153, 103, 36, 105, 13, 158, 141, 13, 103, 78, 105,
        153, 72, 154, 73, 74, 158, 150, 151, 152, 73, 74, 82, 78, 15, 85, 86,
        87, 15, 89, 148, 91, 154, 93, 98, 99, 96, 97, 98, 99, 100, 101, 102,
        103, 78, 114, 106, 107, 15, 1, 110, 103, 104, 113, 15, 115, 116, 142,
        143, 114, 154, 121, 108, 109, 124, 125, 126, 127, 15, 132, 133, 15, 8,
        9, 10, 154, 150, 151, 30, 30, 114, 15, 15, 36, 30, 30, 34, 30, 30, 55,
        150, 151, 152, 29, 67, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
        43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 68, 55, 72, 75, 1, 78, 80,
        83, 83, 68, 87, 78, 82, 67, 92, 85, 86, 87, 111, 89, 78, 91, 112, 93,
        80, 114, 96, 125, 81, 125, 100, 101, 102, 30, 128, 90, 106, 107, 88,
        141, 110, 128, 141, 113, 144, 94, 129, 95, 95, 95, 1, 121, 97, 97, 149,
        152, 144, -1, 144, 151, -1, -1, 144, -1, -1, -1, -1, 148, 148, -1, -1,
        -1, -1, -1, -1, 72, -1, -1, -1, 30, 150, 151, -1, -1, -1, 82, -1, -1,
        85, 86, 87, 148, 89, -1, 91, -1, 93, 1, -1, 96, -1, -1, -1, 100, 101,
        102, 148, 148, 148, 106, 107, 148, 148, 110, 152, 150, 113, 150, 150,
        150, 150, 72, 150, 150, 121, 150, 30, 150, 150, 150, 150, 82, 150, 150,
        85, 86, 87, 150, 89, 150, 91, 150, 93, 1, 150, 96, 150, 150, 153, 100,
        101, 102, 151, 150, 151, 106, 107, 151, 151, 110, 151, 151, 113, 151,
        151, 151, 151, 151, 72, 151, 121, 152, 30, 152, 152, 152, 152, 152, 82,
        152, 152, 85, 86, 87, 152, 89, 152, 91, 152, 93, 1, 152, 96, 152, 152,
        152, 100, 101, 102, 150, 151, 153, 106, 107, 152, 152, 110, 152, 152,
        113, 152, 152, 152, 152, 72, 152, 154, 121, 153, 153, 153, 153, 153,
        153, 82, 153, 153, 85, 86, 87, 153, 89, 153, 91, 153, 93, 153, 153, 96,
        153, 153, 153, 100, 101, 102, 153, 150, 151, 106, 107, 153, 153, 110,
        153, 153, 113, 153, 153, 153, 153, 153, 72, 153, 121, 153, 155, 154,
        154, 154, 154, 154, 82, 154, 154, 85, 86, 87, 154, 89, 154, 91, 154, 93,
        154, 154, 96, 154, 154, 154, 100, 101, 102, 150, 151, 154, 106, 107,
        154, 154, 110, 154, 154, 113, 8, 9, 10, 154, 154, 154, 154, 121, 154,
        154, 154, 154, 154, 154, 154, -1, 155, -1, 156, 156, 156, 29, 156, 31,
        32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 156, 156, 150, 151, 157,
      ]),
      (r.Parser.prototype.yybase = [
        0, 223, 299, 371, 444, 303, 208, 618, -2, -2, -73, -2, -2, 625, 718,
        718, 764, 718, 552, 671, 811, 811, 811, 228, 113, 113, 113, 254, 361,
        -40, 361, 333, 449, 470, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435,
        435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 435, 291,
        291, 230, 393, 495, 779, 784, 781, 776, 775, 780, 785, 498, 678, 680,
        562, 681, 682, 683, 685, 782, 804, 777, 783, 568, 568, 568, 568, 568,
        568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 253, 69,
        162, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
        56, 56, 56, 56, 56, 349, 349, 349, 157, 210, 150, 200, 211, 143, 27,
        917, 917, 917, 917, 917, -16, -16, -16, -16, 351, 351, 362, 217, 89, 89,
        89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 163, 313, 106, 106, 133,
        133, 133, 133, 133, 133, 221, 305, 234, 347, 369, 523, 806, 167, 167,
        441, 93, 283, 202, 202, 202, 386, 547, 533, 533, 533, 533, 419, 419,
        533, 533, 170, 214, 74, 211, 211, 277, 211, 211, 211, 409, 409, 409,
        452, 318, 352, 546, 318, 619, 640, 577, 675, 578, 677, 278, 585, 145,
        586, 145, 145, 145, 458, 445, 451, 774, 291, 522, 291, 291, 291, 291,
        722, 291, 291, 291, 291, 291, 291, 98, 291, 79, 430, 230, 240, 240, 556,
        240, 452, 538, 263, 635, 410, 425, 538, 538, 538, 636, 637, 336, 363,
        198, 638, 382, 402, 173, 33, 549, 549, 555, 555, 566, 551, 549, 549,
        549, 549, 549, 690, 690, 555, 548, 555, 566, 695, 555, 551, 551, 555,
        555, 549, 555, 690, 551, 156, 415, 249, 273, 551, 551, 426, 528, 549,
        535, 535, 433, 555, 219, 555, 139, 539, 690, 690, 539, 229, 551, 231,
        590, 591, 529, 527, 553, 245, 553, 553, 300, 529, 553, 551, 553, 448,
        50, 548, 295, 553, 11, 699, 701, 418, 703, 694, 705, 731, 706, 530, 524,
        526, 719, 720, 708, 692, 691, 561, 582, 513, 517, 534, 554, 689, 581,
        531, 531, 531, 554, 687, 531, 531, 531, 531, 531, 531, 531, 531, 787,
        540, 545, 723, 537, 541, 576, 543, 623, 520, 582, 582, 584, 732, 786,
        564, 722, 762, 709, 587, 557, 741, 725, 525, 542, 565, 726, 727, 745,
        765, 628, 513, 766, 641, 563, 643, 582, 644, 531, 670, 617, 788, 789,
        688, 791, 736, 747, 749, 580, 645, 569, 803, 646, 768, 629, 631, 589,
        737, 684, 751, 647, 752, 754, 649, 592, 572, 734, 573, 733, 272, 729,
        632, 650, 654, 656, 658, 661, 710, 594, 738, 544, 740, 735, 595, 597,
        560, 663, 488, 599, 570, 571, 600, 714, 558, 550, 601, 602, 769, 664,
        728, 604, 665, 756, 574, 581, 536, 532, 575, 567, 634, 755, 559, 605,
        609, 611, 613, 674, 616, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 136, 136, 136, 136, -2, -2, -2, 0, 0,
        -2, 0, 0, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136,
        136, 136, 136, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568,
        568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 568, 568, 568, 568, 568,
        568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568, 568,
        568, 568, 568, 568, 568, 568, 568, 568, 568, 568, -3, 568, 568, -3, 568,
        568, 568, 568, 568, 568, 568, 202, 202, 202, 202, 318, 318, 318, -67,
        318, 318, 318, 318, 318, 318, 318, 318, 318, 318, 318, 318, 318, 318,
        -67, 202, 202, 318, 318, 318, 318, 318, 318, 318, 318, 318, 318, 419,
        419, 419, 145, 145, 318, 0, 0, 0, 0, 0, 549, 419, 318, 318, 318, 318, 0,
        0, 318, 318, 548, 145, 0, 0, 0, 0, 0, 0, 0, 549, 549, 549, 548, 0, 549,
        419, 0, 240, 291, 440, 440, 440, 440, 0, 549, 0, 549, 0, 0, 0, 0, 0, 0,
        551, 0, 690, 0, 0, 0, 0, 555, 0, 0, 0, 0, 0, 0, 0, 0, 548, 0, 0, 0, 0,
        548, 0, 0, 531, 0, 564, 0, 0, 531, 531, 531, 564, 564, 0, 0, 0, 564,
      ]),
      (r.Parser.prototype.yydefault = [
        3, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 92, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 510, 510, 510, 94, 499, 32767, 499, 32767, 32767,
        32767, 314, 314, 314, 32767, 454, 454, 454, 454, 454, 454, 454, 32767,
        32767, 32767, 32767, 32767, 394, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 92, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 506, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 377, 378, 380,
        381, 313, 455, 509, 259, 505, 312, 130, 270, 261, 211, 243, 310, 134,
        342, 395, 344, 393, 397, 343, 319, 323, 324, 325, 326, 327, 328, 329,
        330, 331, 332, 333, 334, 335, 317, 318, 396, 398, 399, 374, 373, 372,
        340, 316, 341, 345, 316, 347, 346, 363, 364, 361, 362, 365, 366, 367,
        368, 369, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 94, 32767, 32767, 32767, 293, 354,
        355, 250, 250, 250, 250, 250, 250, 32767, 250, 32767, 250, 32767, 32767,
        32767, 32767, 32767, 32767, 448, 371, 349, 350, 348, 32767, 426, 32767,
        32767, 32767, 32767, 32767, 428, 32767, 92, 32767, 32767, 32767, 337,
        339, 420, 508, 320, 507, 32767, 32767, 94, 414, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 423, 32767, 32767, 92,
        32767, 32767, 92, 174, 230, 232, 179, 32767, 431, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 414, 359, 517, 32767,
        456, 32767, 351, 352, 353, 32767, 32767, 456, 456, 456, 32767, 456,
        32767, 456, 456, 32767, 32767, 32767, 32767, 32767, 179, 32767, 32767,
        32767, 32767, 94, 429, 429, 92, 92, 92, 92, 424, 32767, 179, 179, 32767,
        32767, 32767, 32767, 32767, 179, 91, 91, 91, 91, 179, 179, 91, 194,
        32767, 192, 192, 91, 32767, 93, 32767, 93, 196, 32767, 470, 196, 91,
        179, 91, 216, 216, 405, 181, 252, 93, 252, 252, 93, 405, 252, 179, 252,
        91, 91, 32767, 91, 252, 32767, 32767, 32767, 85, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 416, 32767, 436, 32767, 449, 468, 32767, 357, 358, 360, 32767,
        458, 382, 383, 384, 385, 386, 387, 388, 390, 32767, 419, 32767, 32767,
        32767, 87, 121, 269, 32767, 515, 87, 417, 32767, 515, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 87, 87, 32767,
        32767, 32767, 32767, 32767, 495, 32767, 516, 32767, 456, 418, 32767,
        356, 432, 475, 32767, 32767, 457, 32767, 32767, 32767, 32767, 87, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 436, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 456, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 456, 32767, 32767, 242, 32767, 32767, 32767, 309, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 85, 60, 32767, 289, 32767, 32767, 32767, 32767, 32767,
        32767, 32767, 32767, 32767, 32767, 32767, 136, 136, 3, 272, 3, 272, 136,
        136, 136, 272, 272, 136, 136, 136, 136, 136, 136, 136, 169, 224, 227,
        216, 216, 281, 136, 136,
      ]),
      (r.Parser.prototype.yygoto = [
        171, 144, 144, 144, 171, 152, 153, 152, 155, 187, 172, 168, 168, 168,
        168, 169, 169, 169, 169, 169, 169, 169, 164, 165, 166, 167, 184, 182,
        185, 445, 446, 334, 447, 450, 451, 452, 453, 454, 455, 456, 457, 924,
        141, 145, 146, 147, 170, 148, 149, 143, 150, 151, 154, 181, 183, 186,
        206, 209, 211, 212, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223,
        224, 244, 245, 264, 265, 266, 339, 340, 341, 496, 188, 189, 190, 191,
        192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 156, 203, 157,
        173, 174, 175, 207, 176, 158, 159, 160, 177, 161, 208, 142, 204, 162,
        178, 205, 179, 180, 163, 563, 210, 463, 210, 516, 516, 1038, 572, 1038,
        1038, 1038, 1038, 1038, 1038, 1038, 1038, 1038, 1038, 1038, 1038, 1038,
        468, 468, 468, 514, 537, 468, 297, 489, 521, 489, 498, 274, 533, 534,
        698, 483, 258, 468, 448, 448, 448, 725, 448, 448, 448, 448, 448, 448,
        448, 448, 448, 448, 448, 448, 448, 449, 449, 449, 699, 449, 449, 449,
        449, 449, 449, 449, 449, 449, 449, 449, 449, 449, 1114, 1114, 734, 725,
        899, 725, 315, 319, 475, 499, 500, 502, 1083, 1084, 468, 468, 760, 1114,
        761, 900, 482, 506, 468, 468, 468, 329, 330, 686, 481, 545, 495, 332,
        510, 596, 523, 525, 294, 469, 538, 556, 559, 835, 566, 574, 831, 765,
        729, 717, 864, 494, 807, 868, 490, 860, 716, 716, 810, 697, 1013, 1105,
        726, 726, 726, 728, 715, 840, 1093, 800, 824, 805, 805, 803, 805, 595,
        313, 460, 833, 828, 459, 3, 4, 907, 733, 539, 1009, 487, 317, 461, 459,
        497, 892, 575, 972, 474, 843, 557, 890, 1129, 484, 485, 505, 517, 519,
        520, 568, 801, 801, 801, 801, 465, 855, 795, 802, 1002, 787, 405, 1003,
        799, 327, 571, 356, 1082, 530, 1014, 848, 346, 540, 350, 11, 337, 337,
        280, 281, 283, 493, 344, 284, 345, 285, 348, 524, 351, 1015, 1069, 1113,
        1113, 543, 301, 298, 299, 721, 560, 838, 838, 1100, 295, 865, 718, 600,
        323, 544, 1113, 1010, 1017, 511, 1005, 869, 849, 849, 849, 849, 849,
        849, 1017, 849, 849, 849, 720, 730, 1116, 714, 812, 849, 1088, 1088,
        909, 465, 398, 513, 414, 1017, 1017, 1017, 1017, 0, 1079, 1017, 1017, 0,
        701, 0, 0, 0, 0, 0, 1079, 0, 0, 0, 0, 0, 773, 1090, 1090, 774, 706, 0,
        756, 751, 752, 766, 0, 707, 753, 704, 754, 755, 705, 0, 759, 0, 1075, 0,
        0, 0, 0, 0, 1012, 0, 0, 0, 480, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        867, 0, 1077, 1077, 867, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 462, 478, 0, 0, 0, 0, 0, 0, 0, 0, 0, 462, 0, 478, 0, 0, 316, 0, 0,
        466, 386, 0, 388, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 724, 0,
        1121,
      ]),
      (r.Parser.prototype.yygcheck = [
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 63, 56, 10, 56, 86, 86, 86, 8, 86,
        86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 10, 10, 10, 46, 46, 10,
        80, 85, 73, 85, 97, 134, 73, 73, 17, 10, 134, 10, 135, 135, 135, 26,
        135, 135, 135, 135, 135, 135, 135, 135, 135, 135, 135, 135, 135, 137,
        137, 137, 18, 137, 137, 137, 137, 137, 137, 137, 137, 137, 137, 137,
        137, 137, 148, 148, 36, 26, 111, 26, 49, 49, 49, 49, 49, 49, 141, 141,
        10, 10, 55, 148, 55, 111, 10, 10, 10, 10, 10, 69, 69, 5, 39, 69, 2, 69,
        2, 39, 39, 39, 69, 10, 39, 39, 39, 39, 39, 39, 39, 13, 14, 14, 14, 10,
        40, 14, 136, 94, 26, 26, 14, 16, 92, 146, 26, 26, 26, 26, 26, 14, 143,
        14, 16, 16, 16, 16, 16, 16, 52, 16, 16, 16, 75, 37, 37, 14, 14, 54, 14,
        53, 65, 65, 75, 7, 7, 7, 118, 65, 88, 7, 7, 12, 65, 65, 68, 68, 68, 68,
        68, 75, 75, 75, 75, 12, 90, 75, 75, 67, 67, 65, 67, 76, 76, 76, 89, 139,
        24, 92, 91, 56, 56, 56, 65, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
        56, 56, 92, 92, 147, 147, 12, 20, 80, 80, 30, 12, 85, 85, 85, 11, 96,
        28, 82, 19, 23, 147, 127, 63, 15, 124, 99, 63, 63, 63, 63, 63, 63, 63,
        63, 63, 63, 15, 32, 147, 15, 79, 63, 8, 8, 114, 12, 71, 72, 122, 63, 63,
        63, 63, -1, 97, 63, 63, -1, 13, -1, -1, -1, -1, -1, 97, -1, -1, -1, -1,
        -1, 63, 97, 97, 63, 13, -1, 13, 13, 13, 13, -1, 13, 13, 13, 13, 13, 13,
        -1, 13, -1, 97, -1, -1, -1, -1, -1, 12, -1, -1, -1, 8, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, 97, -1, 97, 97, 97, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 8, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, 8, -1, 8, -1, -1, 8, -1, -1, 8, 8, -1, 8,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, -1, 8,
      ]),
      (r.Parser.prototype.yygbase = [
        0, 0, -358, 0, 0, 207, 0, 274, 114, 0, -148, 54, 10, 94, -144, -40, 245,
        150, 174, 48, 70, 0, 0, -3, 25, 0, -108, 0, 44, 0, 52, 0, 3, -23, 0, 0,
        183, -331, 0, -359, 221, 0, 0, 0, 0, 0, 106, 0, 0, 157, 0, 0, 227, 45,
        47, 191, 90, 0, 0, 0, 0, 0, 0, 111, 0, -95, 0, -26, 43, -193, 0, -12,
        -20, -435, 0, 26, 37, 0, 0, 4, -259, 0, 20, 0, 0, 117, -104, 0, 31, 55,
        46, 53, -64, 0, 216, 0, 40, 143, 0, -10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, -34, 0, 0, 7, 0, 0, 0, 30, 0, 0, 0, -32, 0, -9, 0, 0, -5, 0, 0, 0, 0,
        0, 0, -119, -69, 217, -52, 0, 51, 0, -102, 0, 226, 0, 0, 223, 77, -67,
        0, 0,
      ]),
      (r.Parser.prototype.yygdefault = [
        -32768, 420, 603, 2, 604, 676, 684, 548, 437, 573, 438, 464, 335, 758,
        913, 778, 740, 741, 742, 320, 361, 311, 318, 531, 518, 410, 727, 381,
        719, 407, 722, 380, 731, 140, 549, 416, 735, 1, 737, 470, 769, 308, 745,
        309, 552, 747, 477, 749, 750, 314, 321, 322, 917, 486, 515, 762, 213,
        479, 763, 307, 764, 772, 331, 312, 392, 417, 326, 894, 504, 527, 376,
        395, 512, 507, 488, 1024, 797, 401, 390, 811, 296, 819, 601, 827, 830,
        439, 440, 399, 842, 400, 853, 847, 1032, 394, 859, 382, 866, 1064, 385,
        870, 228, 873, 255, 546, 349, 878, 879, 6, 884, 564, 565, 7, 243, 415,
        908, 547, 379, 923, 364, 991, 993, 472, 408, 1006, 389, 555, 418, 1011,
        1068, 377, 441, 396, 282, 300, 257, 442, 458, 262, 443, 397, 1071, 1078,
        338, 1094, 279, 26, 1106, 1115, 292, 492, 509,
      ]),
      (r.Parser.prototype.yylhs = [
        0, 1, 3, 3, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 14,
        15, 15, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 20, 20, 21, 21, 21, 21, 23, 25,
        25, 19, 27, 27, 24, 29, 29, 26, 26, 28, 28, 30, 30, 22, 31, 31, 32, 34,
        35, 35, 36, 37, 37, 39, 38, 38, 38, 38, 40, 40, 40, 40, 40, 40, 40, 40,
        40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 16,
        16, 59, 59, 62, 62, 61, 60, 60, 53, 64, 64, 65, 65, 66, 66, 67, 67, 17,
        18, 18, 18, 70, 70, 70, 71, 71, 74, 74, 72, 72, 76, 77, 77, 47, 47, 55,
        55, 58, 58, 58, 57, 78, 78, 79, 48, 48, 48, 48, 80, 80, 81, 81, 82, 82,
        45, 45, 41, 41, 83, 43, 43, 84, 42, 42, 44, 44, 54, 54, 54, 54, 68, 68,
        87, 87, 88, 88, 88, 90, 90, 91, 91, 91, 89, 89, 69, 69, 69, 92, 92, 93,
        93, 94, 94, 94, 50, 95, 95, 96, 51, 98, 98, 99, 99, 100, 100, 73, 101,
        101, 101, 101, 101, 106, 106, 107, 107, 108, 108, 108, 108, 108, 109,
        110, 110, 105, 105, 102, 102, 104, 104, 112, 112, 111, 111, 111, 111,
        111, 111, 103, 113, 113, 115, 114, 114, 52, 116, 116, 46, 46, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 123, 117, 117, 122, 122,
        125, 126, 126, 127, 128, 128, 128, 75, 75, 63, 63, 63, 118, 118, 118,
        130, 130, 119, 119, 121, 121, 121, 124, 124, 135, 135, 135, 86, 137,
        137, 137, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120,
        120, 120, 120, 120, 49, 49, 133, 133, 133, 129, 129, 129, 138, 138, 138,
        138, 138, 138, 56, 56, 56, 97, 97, 97, 97, 141, 140, 132, 132, 132, 132,
        132, 132, 131, 131, 131, 139, 139, 139, 139, 85, 142, 142, 143, 143,
        143, 143, 143, 143, 143, 136, 145, 145, 144, 144, 146, 146, 146, 146,
        146, 146, 134, 134, 134, 134, 148, 149, 147, 147, 147, 147, 147, 147,
        147, 150, 150, 150, 150,
      ]),
      (r.Parser.prototype.yylen = [
        1, 1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 0, 1, 0, 1, 1,
        1, 1, 1, 3, 5, 4, 3, 4, 2, 3, 1, 1, 7, 8, 6, 7, 2, 3, 1, 2, 3, 1, 2, 3,
        1, 1, 3, 1, 2, 1, 2, 2, 3, 1, 3, 2, 3, 1, 3, 2, 0, 1, 1, 1, 1, 1, 3, 7,
        10, 5, 7, 9, 5, 3, 3, 3, 3, 3, 3, 1, 2, 5, 7, 9, 6, 5, 6, 3, 3, 2, 1, 1,
        1, 0, 2, 1, 3, 8, 0, 4, 2, 1, 3, 0, 1, 0, 1, 3, 1, 8, 7, 6, 5, 1, 2, 2,
        0, 2, 0, 2, 0, 2, 2, 1, 3, 1, 4, 1, 4, 1, 1, 4, 2, 1, 3, 3, 3, 4, 4, 5,
        0, 2, 4, 3, 1, 1, 1, 4, 0, 2, 5, 0, 2, 6, 0, 2, 0, 3, 1, 2, 1, 1, 2, 0,
        1, 3, 4, 6, 4, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2, 4, 1, 3, 1, 2, 2, 2, 3,
        1, 1, 2, 3, 1, 1, 3, 2, 0, 1, 4, 4, 9, 3, 1, 1, 3, 0, 2, 4, 5, 4, 4, 4,
        3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 3, 1, 1, 3, 2,
        3, 1, 0, 1, 1, 3, 3, 3, 4, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2,
        2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 4, 3, 4, 4, 2, 2, 4, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 1, 3, 2, 1, 2, 4, 2, 8, 9, 8, 9, 7, 3, 2, 0, 4, 2,
        1, 3, 2, 2, 2, 4, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1, 0, 1, 1,
        3, 3, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 3, 3, 0, 1,
        1, 3, 1, 1, 3, 1, 1, 4, 4, 4, 1, 4, 1, 1, 3, 1, 4, 2, 2, 1, 3, 1, 4, 4,
        3, 3, 3, 1, 3, 1, 1, 3, 1, 1, 4, 3, 1, 1, 2, 1, 3, 4, 3, 0, 1, 1, 1, 3,
        1, 3, 1, 4, 2, 2, 0, 2, 2, 1, 2, 1, 1, 1, 4, 3, 3, 3, 6, 3, 1, 1, 2, 1,
      ]),
      (t.PHP = r);
  }),
  define('ace/mode/php_worker', [], function (e, t, n) {
    'use strict';
    var r = e('../lib/oop'),
      i = e('../worker/mirror').Mirror,
      s = e('./php/php').PHP,
      o = (t.PhpWorker = function (e) {
        i.call(this, e), this.setTimeout(500);
      });
    r.inherits(o, i),
      function () {
        (this.setOptions = function (e) {
          this.inlinePhp = e && e.inline;
        }),
          (this.onUpdate = function () {
            var e = this.doc.getValue(),
              t = [];
            this.inlinePhp && (e = '<?' + e + '?>');
            var n = s.Lexer(e, { short_open_tag: 1 });
            try {
              new s.Parser(n);
            } catch (r) {
              t.push({
                row: r.line - 1,
                column: null,
                text:
                  r.message.charAt(0).toUpperCase() + r.message.substring(1),
                type: 'error',
              });
            }
            this.sender.emit('annotate', t);
          });
      }.call(o.prototype);
  });
