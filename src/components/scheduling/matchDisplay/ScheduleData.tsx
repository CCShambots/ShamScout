class Scouter {
    constructor(
        public readonly name:string,
        public readonly color:string) {
    }
}

class Schedule {

    public scouters:Scouter[] = []

    constructor(
        public readonly matches:string[],
        scouterNames:string[],
        public shifts:Shift[]
    ) {
        this.addScouters(scouterNames)
    }

    public checkShiftCombinations() {
        this.shifts.forEach(e => {
            let solution = this.shifts.filter(check =>
                check.scouter === e.scouter &&
                check.station === e.station &&
                e.matches[e.matches.length-1] - check.matches[0] === -1 &&
                check !== e)[0]


            if(solution) {
                e.combine(solution)
                this.shifts = this.shifts.filter(removeCheck => removeCheck !== solution)
            }
        })
    }

    public createShift(scouter:any, station:number, match:number):Schedule {

        let thisStationShifts = this.shifts.filter(e => e.station === station && e.scouter.name === scouter)

        let added = false

        //Check if this match should be added to a shift instead of
        thisStationShifts.forEach(e => {


            //End the function early and append this match to an existing shift if it should be joined
            if(!added && (e.isAbove(match) || e.isBelow(match))) {
                e.add(match)
                this.checkShiftCombinations()
                added = true
            }
        })


        if(!added) {
            this.shifts.push(new Shift([match], station, this.scouters.filter(e => e.name === scouter)[0]))
        }

        return Object.create(this)
    }

    public removeScouter(scout:string):Schedule {
        this.scouters = this.scouters.filter(e => e.name !== scout)

        this.shifts = this.shifts.filter(e => e.scouter.name !== scout)

        return Object.create(this)
    }

    public addScouters(names:string[]):Schedule {
        names.forEach(
            e => this.addScouter(e)
        )

        return Object.create(this)
    }

    public addScouter(name:string):Schedule {

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

        return Object.create(this)

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
        public matches:number[], //Indices of matches
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

    public add(match:number) {

        this.matches.push(match)
        this.resort()
    }

    public isAbove(match:number) {
        //The match number is one above the last match in this shift
        return match - this.matches[this.matches.length-1] === 1
    }

    public isBelow(match:number) {
        //The match number is one below the last match in this shift
        return match - this.matches[0] === -1
    }

    public combine(other:Shift) {
        if(other.scouter === this.scouter && other.station === this.station) {

            this.matches = this.matches.concat(other.matches)

            this.resort()
        }
    }

    public resort() {
        this.matches = this.matches.sort((a, b) => a-b)
    }
}


class DropDownOptions {

    public readonly key:string
    public readonly text:string
    public readonly value:string
    constructor(
        value:string
    ) {
        this.key = value
        this.text = value
        this.value = value
    }
}

export {
    Scouter,
    Schedule,
    Shift,
    DropDownOptions
}