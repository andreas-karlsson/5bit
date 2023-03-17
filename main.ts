enum Inst {
    NOP,
    PUSH,
    DUP,
    READ,
    ADD,
    DUMP_STACK,
    DEC,
    JMP_NZ,
    EXEC
}
type Bit = 0 | 1
type Uint5 = number

let buf:Bit[] = []
input.onButtonPressed(Button.A, function () {
	buf.push(0)
})
input.onButtonPressed(Button.B, function () {
    buf.push(1)
})
input.onButtonPressed(Button.AB, function () {
    buf = []
})
exec([
    Inst.READ,
    Inst.DUP,
    Inst.JMP_NZ,
    0,
    // Inst.DUMP_STACK
    Inst.EXEC
]);

function exec(program:Inst[]):Uint5 {
    let stack: Uint5[] = []
    let ip = 0
    while (ip < program.length) {
        switch (program[ip++]) {
            case Inst.PUSH:
                stack.push(program[ip++]);
                break;
            case Inst.DUMP_STACK:
                basic.clearScreen();
                for (let i = 0; i < stack.length; i++) {
                    print(stack[i], i);
                }
                basic.pause(1000)
                break;
            case Inst.ADD:
                stack.push(stack.pop() + stack.pop());
                break;
            case Inst.JMP_NZ:
                const addr = program[ip++]
                if (stack.pop() != 0) {
                    ip = addr;
                }
                break;
            case Inst.DUP:
                const value = stack.pop();
                stack.push(value);
                stack.push(value);
                break;
            case Inst.DEC:
                stack.push(stack.pop() - 1);
                break;
            case Inst.READ:
                stack.push(prompt());
                break;
            case Inst.EXEC:
                stack = [exec(stack)];
                break;
        }
    }
    return stack.pop()
}

function prompt(y = 0):Uint5 {
    buf = []
    let value = 0
    let blink = true
    while(buf.length < 5) {
        basic.pause(100)
        value = valueOfBuf();
        print(value, y);
        if(blink) led.plot(4 - buf.length, y);
        blink = !blink;
    }
    return value;
}
function print(value: Uint5, y = 0) {
    if(y > 4 || y < 0) return;
    for(let x = 4; x >= 0; x--) {
        if(value & 1) {
            led.plot(x, y)
        } else {
            led.unplot(x, y)
        }
        value >>= 1
    }
}
function valueOfBuf():Uint5 {
    return buf.reduce((value, bit, pos) => value | bit << pos, 0)
}