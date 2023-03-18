enum Inst {
    NOP,
    PUSH,
    DUP,
    SWAP,
    READ_CHAR,
    READ_UINT5,
    ADD,
    DUMP_STACK,
    LED_ON,
    LED_OFF,
    INC,
    DEC,
    JMP_NZ,
    JMP,
    EXEC
}
type Bit = 0 | 1
type uint5 = number
enum Char {
    A = 1,
    B,
    AB
}

let buf: Char[] = []
input.onButtonPressed(Button.A, function () {
    buf.push(Char.A)
})
input.onButtonPressed(Button.B, function () {
    buf.push(Char.B)
})
input.onButtonPressed(Button.AB, function () {
    buf.push(Char.AB)
})

// main program
exec([
    Inst.PUSH, 2,
    Inst.DUP,
    Inst.LED_ON,
    Inst.DUP,
    Inst.READ_CHAR,
    Inst.SWAP,
    Inst.LED_OFF,
    Inst.ADD,
    Inst.JMP, 2
])
// exec([
//     Inst.READ_UINT5,
//     Inst.DUP,
//     Inst.JMP_NZ,
//     0,
//     Inst.EXEC
// ])

function exec (program: (Inst | string)[]) {
    const instructions:Inst[] = expandLabels(program);
    let ip = 0
    let stack: uint5[] = []
    let value:any;
    const push = (value:uint5) => stack.push(value & 0x1f);
    const pop = () => stack.pop();
    while (ip < instructions.length) {
        switch (instructions[ip++]) {
            case Inst.PUSH:
                push(instructions[ip++]);
                break;
            case Inst.DUMP_STACK:
                basic.clearScreen();
                for (let i = 0; i < stack.length; i++) {
                    print(stack[i], i);
                }
                basic.pause(1000)
                break;
            case Inst.ADD:
                push(pop() + pop());
                break;
            case Inst.JMP:
                ip = instructions[ip++]
                break;
            case Inst.JMP_NZ:
                value = instructions[ip++]
                if (pop() != 0) {
                    ip = value;
                }
                break;
            case Inst.DUP:
                value = pop();
                push(value);
                push(value);
                break;
            case Inst.SWAP:
                value = [pop(), pop()];
                push(value[0]);
                push(value[1]);
                break;
            case Inst.INC:
                push(pop() + 1);
                break;
            case Inst.DEC:
                push(pop() - 1);
                break;
            case Inst.READ_CHAR:
                buf = [];
                while(buf.length == 0) {
                    basic.pause(5);
                }
                push(buf.pop());
                break;
            case Inst.READ_UINT5:
                push(prompt());
                break;
            case Inst.LED_ON:
                value = pop();
                led.plot(value % 5, value / 5);
                break;
            case Inst.LED_OFF:
                value = pop();
                led.unplot(value % 5, value / 5);
                break;
            case Inst.EXEC:
                //stack = [exec(stack)];
                break;
        }
    }
    return pop()
}

function expandLabels(program:(Inst | string)[]):Inst[] {
    const labels:{ [label:string]:number } = {}
    return program.filter((mne, addr) => {
        if(typeof mne == 'string' && mne[0] != '@') {
            labels[mne] = addr;
            return false;
        }
        return true;
    })
    .map(instOrLabel => {
        if(typeof instOrLabel == 'string') {
            const addr = labels[instOrLabel.slice(1)];
            if(addr === undefined) throw `Unknown label: ${instOrLabel}`;
            return addr;
        }
        return instOrLabel;
    })
}

function prompt(y = 0):uint5 {
    buf = []
    let value = 0
    let blink = true
    while(buf.length < 5) {
        basic.pause(100)
        if(buf.indexOf(Char.AB) != -1) {
            buf = [];
            continue;
        }
        value = buf
            .map(char => char - 1)
            .reduce((value, bit, pos) => value | bit << pos, 0)
        print(value, y);
        if(blink) led.plot(4 - buf.length, y);
        blink = !blink;
    }
    return value;
}

function print(value: uint5, y = 0) {
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

