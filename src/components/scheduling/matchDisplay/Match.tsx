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


    public static toCode(matches:Match[]):string {
        return matches.reduce((acc, val: Match) => {
            return acc + `${val.red1},${val.red2},${val.red3},${val.blue1},${val.blue2},${val.blue3},`
        }, "mtc:");
    }
}

export function getTeamNumberFromStation(match:Match, allianceStation:number):number {
    switch(allianceStation) {
        case 0:
            return match.red1
        case 1:
            return match.red2
        case 2:
            return match.red3
        case 3:
            return match.blue1
        case 4:
            return match.blue2
        case 5:
            return match.blue3
        default:
            return -1
    }
}