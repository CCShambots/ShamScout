import {useMatches} from "react-router-dom";

class Scouter {
    constructor(
        public readonly name:string,
        public readonly color:string) {
    }
}

class Schedule {

    constructor(
        public readonly matches:string[],
        public readonly scouters:Scouter[],
        public readonly shifts:Shift[]
    ) {
    }

    public addScouters(names:string[]) {
        names.forEach(
            e => this.addScouter(e)
        )
    }

    public addScouter(name:string) {

        console.log(this.scouters)
        console.log(this.scouters.length > 0)

        if(this.scouters.length > 0) {
            this.scouters.push(
                new Scouter(
                    name,
                    this.getColor(this.scouters[this.scouters.length-1].color)
                )
            )
        } else {
            this.scouters.push(
                new Scouter(
                    name,
                    "red"
                )
            )

        }


    }

    private getColor(previousColor:string):string {
        let colors:string[] = [
            "red",
            "lightgreen",
            "lightblue"
        ]

        let nextIndex = colors.indexOf(previousColor)+1
        return colors[nextIndex === colors.length ? 0 : nextIndex]
    }
}

class Shift {
    constructor(
        public readonly matches:number[], //Indices of matches
        public readonly station:number, //Index of the alliance station (red 1 = 0, up to blue 3 = 5)
        public readonly scouter:Scouter

    ) {
    }


    /**
     * Whether the current shift includes a given match
     * @param match match index
     * @param station alliance station index
     */
    public includes(match:number, station:number): { active:boolean, top:boolean, bottom:boolean, scouter:Scouter } {
        return {
            active: station===this.station && this.matches.includes(match),
            top: this.matches[0] === match,
            bottom: this.matches[this.matches.length-1] === match,
            scouter: this.scouter
        }
    }
}

export {
    Scouter,
    Schedule,
    Shift
}