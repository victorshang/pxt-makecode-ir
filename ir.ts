/**
 * MakeCode extension for IR 
 * 
 * update: 2020-11-28
 * version:1.00
 */
//% color=#4520ee icon="\uf1f2" block="IR"


enum DutyRatio {
    //% block="1/2"
    Half = 512,
    //% block="1/3"
    Tthird = 341,
    //% block="1/4"
    Quarter = 256,
    //% block="1/5"
    Fifth = 204
}

class IR_Bit{
    mark:number;
    space:number;
    constructor(mark:number,space:number){
        this.mark=mark;
        this.space=space;
    }
}

namespace ir{
    let waitCorrection=0;
    let irsend_Pin = AnalogPin.P1;
    let duty_ratio = DutyRatio.Tthird;
    let one  = new IR_Bit(560,1680);
    let zero = new IR_Bit(540,540);

    function transmitBit(ir_bit:IR_Bit): void {
      pins.analogWritePin(irsend_Pin, duty_ratio);
      control.waitMicros(ir_bit.mark);
      pins.analogWritePin(irsend_Pin, 0);
      control.waitMicros(ir_bit.space);
    }

    function initIRPin(ir_pin:AnalogPin,ir_duty_ratio:DutyRatio):void{
        irsend_Pin=ir_pin;
        pins.analogWritePin(irsend_Pin, 0);
        pins.analogSetPeriod(irsend_Pin, 26);
    }
    /**
    * 初始化IR
    */
    //% block="初始化IR发射器引脚:%ir_pin=AnalogPin,占空比:%ir_duty_ratio"
    export function initIR(ir_pin:AnalogPin,ir_duty_ratio:DutyRatio):void
    {
        initIRPin(ir_pin,ir_duty_ratio);
        let runs = 32;
        let start = input.runningTimeMicros();
        let test_bit=new IR_Bit(1,1)
        for (let i = 0; i < runs; i++) {
            transmitBit(test_bit);
        }
        let end = input.runningTimeMicros();
        waitCorrection = Math.idiv(end - start - runs * 2, runs * 2);

      }
    /**
    * 设置 1 与 0 的红外数据信号
    */
    //% block="设置数据信号：1%one，0%zero"
    export function initONE_ZERO(new_one:IR_Bit,new_zero:IR_Bit):void{
        one = new_one;
        zero = new_zero;
    }
   
    /**
    *  设置红外信号码
    */
    //% block="红外码：载波%mark毫秒,空%space毫秒"
    export function setBit(mark:number,space:number):IR_Bit{
        return new IR_Bit(mark-waitCorrection,space-waitCorrection)
    }

    /**
    *  发送红外信号码
    */
    //% block="发送红外信号码%code"
    export function sendBit(code:IR_Bit):void{
        transmitBit(code)
    }

    /**
    *  发送数据
    */
    //% block="发送红外数据:%len位数据%data"
    //% len.defl=8
    //% data.defl=0
    export function sendData(len:number,data:number):void{
        let mask=0x01 << (len-1)
        for(let i=0;i<len;i++){
            if ((data & mask)==0){
                transmitBit(zero)
            }else{
                transmitBit(one)
            }
            mask=mask >> 1
        }
    }
}