import { MonopolySymbol } from './Symbols'

export class CrazyTimeStats {
    constructor(
        public timeFrame : number,
        public totalSpins : number,
        public stats : SymbolStats[]
    ){}
}

export class SymbolStats {
    constructor(
        public symbol : MonopolySymbol, 
        public percentage : number,
        public spinSince : number,
        public lands : number
    ){}
}