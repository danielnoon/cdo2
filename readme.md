# Computer.DO

Computer.DO is a very simple programming language that started as a joke. After a first attempt, I have decided to flesh it out and see if I can make it more useful. Education, maybe? I dunno, but if you think it's cool, play around with it, see what you can do, and maybe contribute! I'm not a language designer by any means, so I'm sure there's a lot I could be doing better.

## Syntax

### Primitives

```
"Hello, world!"              | string
15, 3.14                     | number
true, false                  | boolean
fn x {x + 1}                 | function with expression body
fn x {
  Computer.DO.print x
  Computer.DO.return x + 1
}                            | function with block body
```

### Compounds

```
[2, 3, 4]                 | list
{"name": "Luke"}          | dictionary

x := arr[2]               | selecting from array (zero-indexed)
y := dict["name"]         | selecting from dictionary
arr[2] := x + 1           | assigning to array
dict["name"] := y + "!"   | assigning to dictionary
```

### Calling

```
DO addOne x                       | call addOne function
DO addOne (2 + 3)                 | call addOne with expression
y := DO addOne 2                  | assign result of call

Computer.DO.print y               | call an action belonging to an actor
Math.DO.log y -> z                | assign the result of an action

Math.DO.round (DO Math.log y)     | call an action as an expression
```

### Assignment

```
x := 15                     | assignment
y := x + 1                  | assignment with expression
x <- 20                     | reassignment
String.DO.concat x y -> z   | output
```

### Math

```
1 + 2            | addition
1 - 2            | subtraction
1 * 2            | multiplication
1 / 2            | division
1 % 2            | modulo
1 ^ 2            | exponentiation
```

### Comparison

```
1 = 2            | equality
1 != 2           | inequality
1 < 2            | less than
1 <= 2           | less than or equal to
1 > 2            | greater than
1 >= 2           | greater than or equal to
```

### Logic

```
true and false   | logical and
true or false    | logical or
not true         | logical not
```

### Conditionals

```
if x > y DO {
  Computer.DO.print "x is greater than y"
} else if x < y DO {
  Computer.DO.print "x is less than y"
} else DO {
  Computer.DO.print "x is equal to y"
}
```

### Loops

```
Computer.DO.loop (10 times) (fn i {
  Computer.DO.print i
})                                   | loop 10 times

Computer.DO.loop ["a", "b", "c"] (fn x {
  Computer.DO.print x
})                                   | loop over a list

done := false
Computer.DO.loop (fn { done }) (fn {
  Computer.DO.getRandomInt 0 10 -> x
  done <- x > 5
})                                   | loop until a condition is met
```

### Custom Actors

```
actor Alice {
  sayHello := fn name {
    String.DO.concat "Hello, " name "!" -> phrase
    Computer.DO.print phrase
  }
}                                     | define an actor

Alice.DO.sayHello "Bob"               | call the actor's action
```

## Built-In Actors

### Computer

- **print** ...values: Prints a series of values to the console.
- **getRandomInt** min max: Returns a random integer between two values.
- **loop** iteratorOrCondition body: Loops over an iterator, calling the body for each iteration, or until the condition is met.
- **return** value: Returns a value from a function, and immediately exits the function.

### Math

- **log** x: Returns the natural logarithm of a number.
- **round** x [precision]: Returns a number rounded to a specified precision.

### String

- **concat** x y: Concatenates two strings.
- **getLength** str: Returns the length of a string.
- **getSlice** str start end: Returns a slice of a string.
- **toLowerCase** str: Converts a string to lowercase.
- **getChar** str index: Returns the character at a specified index.
- **getIndex** str char: Returns the index of a character in a string.

### List

- **getLength** list: Returns the length of a list.
- **copy** list [start] [end]: Returns a copy of a list, optionally a slice from start to end.
- **join** separator list: Joins a list of strings with a separator.
- **map** list fn: Applies a function to each element of a list.

### Dict

- **has** dict key: Returns true if a dictionary has a key.
