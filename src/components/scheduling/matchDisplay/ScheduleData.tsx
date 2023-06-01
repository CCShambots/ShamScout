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

    public totalMatchesToScout():number {
        return this.matches.length * 6
    }

    public getNumMatchesForScout(scouter:Scouter):number {
        return this.shifts.filter(e => e.scouter === scouter).map(e => e.matches.length)
            .reduce((accumulator, current) => accumulator + current, 0)
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

    //Swap the scouter for a shift
    public swapShiftScouter(scouterName:any, station:number, match:number):Schedule {

        //Change the scouter for a shift
       this.shifts.filter(e => e.includes(match, station).active)[0].scouter
            = this.getScouterFromName(scouterName)

        return Object.create(this)
    }


    public modifyShift(scouterName:any, station:number, match:number):Schedule {

        let shiftToChange = this.shifts.filter(e => e.includes(match, station).active)[0]

        if(shiftToChange) {

            this.shifts = this.shifts.filter(e => e !== shiftToChange)

            this.shifts = this.shifts.concat(shiftToChange.splitShift(this.getScouterFromName(scouterName), match))

            this.checkShiftCombinations()

        }else this.createShift(scouterName, station, match)

        return Object.create(this)
    }

    public createShift(scouterName:any, station:number, match:number):Schedule {

        let thisStationShifts = this.shifts.filter(e => e.station === station && e.scouter.name === scouterName)

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
            if(this.shifts.filter(e => e.scouter.name === scouterName && e.station === station && e.matches.indexOf(match) !== -1).length === 0)
            this.shifts.push(new Shift([match], station, this.getScouterFromName(scouterName)))
        }

        return Object.create(this)
    }

    public getScouterFromName(name:any) {
        return this.scouters.filter(e => e.name === name)[0]
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
            "lightblue",
            "yellow",
            "cyan",
            "teal"
        ]

        let nextIndex = colors.indexOf(previousColor)+1
        return colors[nextIndex === colors.length ? 0 : nextIndex]
    }
}

class Shift {
    constructor(
        public matches:number[], //Indices of matches
        public readonly station:number, //Index of the alliance station (red 1 = 0, up to blue 3 = 5)
        public scouter:Scouter

    ) {
    }

    //Splice a new shift into an existing shift
    public splitShift(newScout:Scouter, match:number):Shift[] {

        let earlierMatches = this.matches.filter(e => e < match)
        let laterMatches = this.matches.filter(e => e > match)

        let newShifts: Shift[] = []

        if (earlierMatches.length > 0) newShifts.push(new Shift(earlierMatches, this.station, this.scouter))
        if (laterMatches.length > 0) newShifts.push(new Shift(laterMatches, this.station, this.scouter))

        newShifts.push(new Shift([match], this.station, newScout))

        return newShifts
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

class RowCol {
    constructor(
        public row:number,
        public col:number

    ) {
    }

    public updateRow(row:number):RowCol {
        this.row = row;

        return Object.create(this)
    }

    public updateCol(col:number):RowCol {
        this.col = col;

        return Object.create(this)
    }

}

export {
    Scouter,
    Schedule,
    Shift,
    DropDownOptions,
    RowCol
}