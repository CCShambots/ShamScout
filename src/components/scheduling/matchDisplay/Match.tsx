export default class Match {
    public red1:number
    public red2:number
    public red3:number
    public blue1:number
    public blue2:number
    public blue3:number

    constructor(
        public match_number:number,
        redAlliance:number[],
        blueAlliance:number[]
    ) {
        this.red1 = redAlliance[0]
        this.red2 = redAlliance[1]
        this.red3 = redAlliance[2]

        this.blue1 = blueAlliance[0]
        this.blue2 = blueAlliance[1]
        this.blue3 = blueAlliance[2]
    }
}