define(
  'ace/mode/fsharp_highlight_rules',
  [
    'require',
    'exports',
    'module',
    'ace/lib/oop',
    'ace/mode/text_highlight_rules',
  ],
  function (e, t, n) {
    'use strict';
    var r = e('../lib/oop'),
      i = e('./text_highlight_rules').TextHighlightRules,
      s = function () {
        var e = this.createKeywordMapper(
            {
              variable: 'this',
              keyword:
                'abstract|assert|base|begin|class|default|delegate|done|downcast|downto|elif|else|exception|extern|false|finally|function|global|inherit|inline|interface|internal|lazy|match|member|module|mutable|namespace|open|or|override|private|public|rec|return|return!|select|static|struct|then|to|true|try|typeof|upcast|use|use!|val|void|when|while|with|yield|yield!|__SOURCE_DIRECTORY__|as|asr|land|lor|lsl|lsr|lxor|mod|sig|atomic|break|checked|component|const|constraint|constructor|continue|eager|event|external|fixed|functor|include|method|mixin|object|parallel|process|protected|pure|sealed|tailcall|trait|virtual|volatile|and|do|end|for|fun|if|in|let|let!|new|not|null|of|endif',
              constant: 'true|false',
            },
            'identifier'
          ),
          t =
            '(?:(?:(?:(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.))|(?:\\d+))(?:[eE][+-]?\\d+))|(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.)))';
        (this.$rules = {
          start: [
            { token: 'variable.classes', regex: '\\[\\<[.]*\\>\\]' },
            { token: 'comment', regex: '//.*$' },
            {
              token: 'comment.start',
              regex: /\(\*(?!\))/,
              push: 'blockComment',
            },
            { token: 'string', regex: "'.'" },
            {
              token: 'string',
              regex: '"""',
              next: [
                {
                  token: 'constant.language.escape',
                  regex: /\\./,
                  next: 'qqstring',
                },
                { token: 'string', regex: '"""', next: 'start' },
                { defaultToken: 'string' },
              ],
            },
            {
              token: 'string',
              regex: '"',
              next: [
                {
                  token: 'constant.language.escape',
                  regex: /\\./,
                  next: 'qqstring',
                },
                { token: 'string', regex: '"', next: 'start' },
                { defaultToken: 'string' },
              ],
            },
            {
              token: ['verbatim.string', 'string'],
              regex: '(@?)(")',
              stateName: 'qqstring',
              next: [
                { token: 'constant.language.escape', regex: '""' },
                { token: 'string', regex: '"', next: 'start' },
                { defaultToken: 'string' },
              ],
            },
            { token: 'constant.float', regex: '(?:' + t + '|\\d+)[jJ]\\b' },
            { token: 'constant.float', regex: t },
            {
              token: 'constant.integer',
              regex:
                '(?:(?:(?:[1-9]\\d*)|(?:0))|(?:0[oO]?[0-7]+)|(?:0[xX][\\dA-Fa-f]+)|(?:0[bB][01]+))\\b',
            },
            {
              token: ['keyword.type', 'variable'],
              regex: '(type\\s)([a-zA-Z0-9_$-]*\\b)',
            },
            { token: e, regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b' },
            {
              token: 'keyword.operator',
              regex:
                '\\+\\.|\\-\\.|\\*\\.|\\/\\.|#|;;|\\+|\\-|\\*|\\*\\*\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|<-|=|\\(\\*\\)',
            },
            { token: 'paren.lparen', regex: '[[({]' },
            { token: 'paren.rparen', regex: '[\\])}]' },
          ],
          blockComment: [
            { regex: /\(\*\)/, token: 'comment' },
            {
              regex: /\(\*(?!\))/,
              token: 'comment.start',
              push: 'blockComment',
            },
            { regex: /\*\)/, token: 'comment.end', next: 'pop' },
            { defaultToken: 'comment' },
          ],
        }),
          this.normalizeRules();
      };
    r.inherits(s, i), (t.FSharpHighlightRules = s);
  }
),
  define(
    'ace/mode/folding/cstyle',
    [
      'require',
      'exports',
      'module',
      'ace/lib/oop',
      'ace/range',
      'ace/mode/folding/fold_mode',
    ],
    function (e, t, n) {
      'use strict';
      var r = e('../../lib/oop'),
        i = e('../../range').Range,
        s = e('./fold_mode').FoldMode,
        o = (t.FoldMode = function (e) {
          e &&
            ((this.foldingStartMarker = new RegExp(
              this.foldingStartMarker.source.replace(/\|[^|]*?$/, '|' + e.start)
            )),
            (this.foldingStopMarker = new RegExp(
              this.foldingStopMarker.source.replace(/\|[^|]*?$/, '|' + e.end)
            )));
        });
      r.inherits(o, s),
        function () {
          (this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/),
            (this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/),
            (this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/),
            (this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/),
            (this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/),
            (this._getFoldWidgetBase = this.getFoldWidget),
            (this.getFoldWidget = function (e, t, n) {
              var r = e.getLine(n);
              if (
                this.singleLineBlockCommentRe.test(r) &&
                !this.startRegionRe.test(r) &&
                !this.tripleStarBlockCommentRe.test(r)
              )
                return '';
              var i = this._getFoldWidgetBase(e, t, n);
              return !i && this.startRegionRe.test(r) ? 'start' : i;
            }),
            (this.getFoldWidgetRange = function (e, t, n, r) {
              var i = e.getLine(n);
              if (this.startRegionRe.test(i))
                return this.getCommentRegionBlock(e, i, n);
              var s = i.match(this.foldingStartMarker);
              if (s) {
                var o = s.index;
                if (s[1]) return this.openingBracketBlock(e, s[1], n, o);
                var u = e.getCommentFoldRange(n, o + s[0].length, 1);
                return (
                  u &&
                    !u.isMultiLine() &&
                    (r
                      ? (u = this.getSectionRange(e, n))
                      : t != 'all' && (u = null)),
                  u
                );
              }
              if (t === 'markbegin') return;
              var s = i.match(this.foldingStopMarker);
              if (s) {
                var o = s.index + s[0].length;
                return s[1]
                  ? this.closingBracketBlock(e, s[1], n, o)
                  : e.getCommentFoldRange(n, o, -1);
              }
            }),
            (this.getSectionRange = function (e, t) {
              var n = e.getLine(t),
                r = n.search(/\S/),
                s = t,
                o = n.length;
              t += 1;
              var u = t,
                a = e.getLength();
              while (++t < a) {
                n = e.getLine(t);
                var f = n.search(/\S/);
                if (f === -1) continue;
                if (r > f) break;
                var l = this.getFoldWidgetRange(e, 'all', t);
                if (l) {
                  if (l.start.row <= s) break;
                  if (l.isMultiLine()) t = l.end.row;
                  else if (r == f) break;
                }
                u = t;
              }
              return new i(s, o, u, e.getLine(u).length);
            }),
            (this.getCommentRegionBlock = function (e, t, n) {
              var r = t.search(/\s*$/),
                s = e.getLength(),
                o = n,
                u = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,
                a = 1;
              while (++n < s) {
                t = e.getLine(n);
                var f = u.exec(t);
                if (!f) continue;
                f[1] ? a-- : a++;
                if (!a) break;
              }
              var l = n;
              if (l > o) return new i(o, r, l, t.length);
            });
        }.call(o.prototype);
    }
  ),
  define(
    'ace/mode/fsharp',
    [
      'require',
      'exports',
      'module',
      'ace/lib/oop',
      'ace/mode/text',
      'ace/mode/fsharp_highlight_rules',
      'ace/mode/folding/cstyle',
    ],
    function (e, t, n) {
      'use strict';
      var r = e('../lib/oop'),
        i = e('./text').Mode,
        s = e('./fsharp_highlight_rules').FSharpHighlightRules,
        o = e('./folding/cstyle').FoldMode,
        u = function () {
          i.call(this),
            (this.HighlightRules = s),
            (this.foldingRules = new o());
        };
      r.inherits(u, i),
        function () {
          (this.lineCommentStart = '//'),
            (this.blockComment = { start: '(*', end: '*)', nestable: !0 }),
            (this.$id = 'ace/mode/fsharp');
        }.call(u.prototype),
        (t.Mode = u);
    }
  );
(function () {
  window.require(['ace/mode/fsharp'], function (m) {
    if (typeof module == 'object' && typeof exports == 'object' && module) {
      module.exports = m;
    }
  });
})();
