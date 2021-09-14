@{%
  const moo = require("moo")
  const lexer = moo.compile({
    string: { match: /"(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"/, value: x => x.slice(1, -1) },
    nl: { match: [/\n/,/\r\n/], lineBreaks: true },
    ws: /[ \t]+/,
    and: 'and',
    or: 'or',
    not: 'not',
    fn: 'fn',
    actor: 'actor',
    times: 'times',
    boolean: { match: /true|false/, value: x => Boolean(x) },
    number: {
      match: [/[-]?[0-9]+\.?[0-9]*/, "infinity", "-infinity"],
      value: x => ["infinity", "-infinity"].includes(x) ? x : parseFloat(x, 10)
    },
    id: /[A-Za-z_\$][\$A-Za-z0-9_]*/,
    dot: /\./,
    lparen:  '(',
    rparen:  ')',
    assignment: '->',
    define: ':=',
    reassign: '<-',
    add: '+',
    sub: '-',
    mul: '*',
    div: '/',
    pow: '^',
    mod: '%',
    lbrace: '{',
    rbrace: '}',
    call: '@',
    gte: '>=',
    lte: '<=',
    gt: '>',
    lt: '<',
    neq: '!=',
    eq: '=',
    lbrack: '[',
    rbrack: ']',
    comma: ',',
    colon: ':'
  });
%}

@lexer lexer

main -> scriptBody    {% id %}

__ -> %ws               {% id %}
_ -> __                 {% id %}
   | null               {% id %}
___ -> (__ | NL):*
ID -> %id               {% id %}
ASSIGN -> %assignment   {% id %}
NL -> %nl               {% id %}
DOT -> %dot             {% id %}
STRING -> %string       {% id %}
NUMBER -> %number       {% id %}
DEFINE -> %define       {% id %}
REASSIGN -> %reassign   {% id %}
ADD -> %add             {% id %}
SUB -> %sub             {% id %}
MUL -> %mul             {% id %}
DIV -> %div             {% id %}
POW -> %pow             {% id %}
MOD -> %mod             {% id %}
LPAREN -> %lparen       {% id %}
RPAREN -> %rparen       {% id %}
LBRACE -> %lbrace       {% id %}
RBRACE -> %rbrace       {% id %}
FN -> %fn               {% id %}
CALL -> %call           {% id %}
GTE -> %gte             {% id %}
LTE -> %lte             {% id %}
GT -> %gt               {% id %}
LT -> %lt               {% id %}
NEQ -> %neq             {% id %}
EQ -> %eq               {% id %}
ACTOR -> %actor         {% id %}
LBRACK -> %lbrack       {% id %}
RBRACK -> %rbrack       {% id %}
AND -> %and             {% id %}
OR -> %or               {% id %}
NOT -> %not             {% id %}
TIMES -> %times         {% id %}
COMMA -> %comma         {% id %}
BOOL -> %boolean        {% id %}
COLON -> %colon         {% id %}


# ----------------------------------------------------


body -> line ___ body {% ([i,, b]) => [i, ...b] %} 
      | line          {% ([i]) => [i] %}
    
scriptBody -> actor ___ scriptBody {% ([act,,body]) => [act, ...body] %}
            | line ___ scriptBody  {% ([line,,body]) => [line, ...body] %}
            | actor                {% ([act]) => [act] %}
            | line                 {% ([line]) => [line] %}
    
actor -> ACTOR __ ID __ LBRACE ___ actorBody ___ RBRACE {% ([,,name,,,,body]) => ({ type: 'ACTOR', name, body}) %}

actorBody -> assignment ___ actorBody {% ([a,,as]) => [a, ...as] %}
           | assignment               {% ([a]) => [a] %}

expression -> operand _ POW _ operand      {% ([left,, op,, right]) => ({ type: "ARITH", left, op: "POW", right }) %}
            | cmp                          {% ([exp]) => ({ type: "COMP", ...exp }) %}
            | logical                      {% ([exp]) => ({ type: "LOGICAL", ...exp }) %}
            | muldiv                       {% ([exp]) => ({ type: "ARITH", ...exp }) %}
            | addsub                       {% ([exp]) => ({ type: "ARITH", ...exp }) %}
            | LPAREN _ expression _ RPAREN {% ([,,exp]) => exp %}
            | expression __ TIMES          {% ([n]) => ({ type: "TIMES", number: n }) %}
            | func                         {% id %}
            | invoke                       {% id %}
            | getter                       {% id %}
            | literal                      {% id %}
            | ID                           {% id %}
            | selector                     {% id %}

invoke -> "DO" __ expression __ args {% ([,,expr,,args]) => ({ type: "CALL", expr, args }) %}
        | "DO" __ expression         {% ([,,expr]) =>       ({ type: "CALL", expr, args: null }) %}

addsub -> operand _ ADD _ operand {% ([left,, op,, right]) => ({ left, op: "ADD", right }) %}
        | operand _ SUB _ operand {% ([left,, op,, right]) => ({ left, op: "SUB", right }) %}

muldiv -> operand _ MUL _ operand {% ([left,, op,, right]) => ({ left, op: "MUL", right }) %}
        | operand _ DIV _ operand {% ([left,, op,, right]) => ({ left, op: "DIV", right }) %}
        | operand _ MOD _ operand {% ([left,, op,, right]) => ({ left, op: "MOD", right }) %}
    
cmp -> operand _ GTE _ operand {% ([left,, op,, right]) => ({ left, op: "GEQ", right }) %}
     | operand _ LTE _ operand {% ([left,, op,, right]) => ({ left, op: "LEQ", right }) %}
     | operand _ GT _ operand  {% ([left,, op,, right]) => ({ left, op: "GT", right }) %}
     | operand _ LT _ operand  {% ([left,, op,, right]) => ({ left, op: "LT", right }) %}
     | operand _ NEQ _ operand {% ([left,, op,, right]) => ({ left, op: "NEQ", right }) %}
     | operand _ EQ _ operand  {% ([left,, op,, right]) => ({ left, op: "EQ", right }) %}

logical -> operand _ AND _ operand {% ([left,, op,, right]) => ({ left, op: "AND", right }) %}
         | operand _ OR _ operand  {% ([left,, op,, right]) => ({ left, op: "OR", right }) %}
         | NOT _ operand           {% ([,,operand]) => ({ op: "NOT", operand }) %}

operand -> expression {% id %}

getter -> ID _ DOT _ ID {% ([actor,,,,action]) => ({ type: "GETTER", actor, action }) %}
     
func -> FN (__ parameter {% ([,p]) => p %}):* _ LBRACE fbody RBRACE {% ([,params,,,body]) => ({ type: 'FUNCTION', params, body }) %}

fbody -> ___ body ___       {% ([,body]) => ({ type: 'FUNCBODY', body }) %}
       | ___ expression ___ {% ([,body]) => ({ type: 'FUNCEXPR', body }) %}

parameter -> ID {% id %}

line -> instruction  {% id %}
      | assignment   {% id %}
      | reassignment {% id %}
      | invoke       {% id %}
      | ifStatement  {% id %}

assignment -> (ID | selector) _ DEFINE _ expression  {% ([dest,,,, expr]) => ({ type: "ASSIGNMENT", dest: dest[0], value: expr }) %}

reassignment -> (ID | selector) _ REASSIGN _ expression  {% ([dest,,,, expr]) => ({ type: "REASSIGNMENT", dest: dest[0], value: expr }) %}

instruction -> call _ ASSIGN _ ID {% ([call,,,, assign]) => ({ type: 'INSTRUCTION', ...call, assign}) %}
    | call                        {% ([call]) => ({ type: 'INSTRUCTION', ...call, assign: null}) %}

call -> command __ args {% ([command,, args]) => ({...command, args}) %}
    | command         {% ([command]) => ({...command, args: []}) %}

command -> ID _ DOT _ "DO" _  DOT _ ID {% ([actor,,,,,,,, action]) => ({actor, action}) %}

listLiteral -> LBRACK ___ listBody ___ RBRACK {% ([,,elements]) => ({ type: "LIST", elements }) %}
             | LBRACK _ RBRACK                {% () => ({ type: "LIST", elements: [] }) %}

listBody -> expression _ COMMA ___ listBody {% ([expr,,,,body]) => [expr, ...body] %}
          | expression                      {% ([expr]) => [expr] %}

dictLiteral -> LBRACE ___ dictBody ___ RBRACE {% ([,,entries]) => ({ type: "DICT", entries }) %}

dictBody -> dictEntry _ COMMA ___ dictBody {% ([entry,,,,body]) => [entry, ...body] %}
          | dictEntry                      {% ([e]) => [e] %}

dictEntry -> dictKey _ COLON _ expression {% ([key,,,,value]) => ({ key, value }) %}

dictKey -> LBRACK _ expression _ RBRACK  {% ([,,expr]) => expr %}
         | STRING                        {% id %}

@{%
  const escapes = {
    n: '\n',
    r: '\r',
    t: '\t',
    b: '\b',
    '"': '"',
    "'": "'",
    "\\": "\\"
  }
  function escapeString(str) {
    return str.replace(/\\(\\|n|b|"|'|t|r)/g, ([,char]) => escapes[char])
  }
%}

literal -> STRING      {% ([str]) => ({...str, value: escapeString(str.value)}) %}
         | NUMBER      {% id %}
         | listLiteral {% id %}
         | BOOL        {% id %}
         | dictLiteral {% id %}

ifStatement -> "if" __ expression __ "DO" ___ LBRACE ___ body ___ RBRACE __:? elseStatement:? {% ([,,test,,,,,,body,,,,els]) => ({ type: "CONDITIONAL", test, body, else: els }) %}
             | "if" __ expression __ "DO" __ expression __:? elseStatement:?                  {% ([,,test,,,,expr]) =>   ({ type: "CONDITIONAL", test, body: expr }) %}
                                      
elseStatement -> "else" __ ifStatement                         {% ([,,iff]) => iff %}
               | "else" __ "DO" ___ expression                 {% ([,,,,expr]) => ({ type: "ELSE", body: expr }) %}
               | "else" __ "DO" ___ LBRACE ___ body ___ RBRACE {% ([,,,,,,body]) => ({ type: "ELSE", body }) %}

selector -> expression LBRACK _ expression _ RBRACK {% ([base,,,expr]) => ({ type: "SELECTOR", base, expr }) %}

arg -> literal                       {% id %}
     | ID                            {% id %}
     | LPAREN _ expression _ RPAREN  {% ([,,expr]) => expr %}
     | selector                      {% id %}

args -> arg __ args  {% ([arg,, args]) => [arg, ...args] %}
      | arg          {% ([arg]) => [arg] %}
        