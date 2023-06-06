class Scouter {
    constructor(
        public readonly name:string,
        public readonly color:string) {
    }
}

const colors:string[] = [
    "#00ff00",
    "#c0c0c0",
    "#8a2be2",
    "#5f9ea0",
    "#90ee90",
    "#6495ed",
    "#008b8b",
    "#006400",
    "#8fbc8f",
    "#00ced1",
    "#00bfff",
    "#adff2f",
    "#add8e6"
]

class Schedule {

    public scouters:Scouter[] = []

    constructor(
        public readonly matches:string[],
        scouterNames:string[],
        public shifts:Shift[]
    ) {
        this.addScouters(scouterNames)
    }

    public getLongestBreak(scouter:Scouter) {
        let scouterMatches = this.shifts.filter(e => e.scouter === scouter).reduce((acc, ele) => acc.concat(ele.matches), [-1])

        scouterMatches = scouterMatches.filter(e => e >= 0);

        let longestBreak = 0
        let lastMatch = -1

        scouterMatches = scouterMatches.sort((a, b) => a-b)

        scouterMatches.forEach(e => {

            if(e-lastMatch > 1 && e-lastMatch > longestBreak) {
                longestBreak = e-lastMatch-1
            }

            lastMatch = e
        })

        return longestBreak
    }

    public getMostConsecutiveMatches(scouter:Scouter) {
        let scouterMatches = this.shifts.filter(e => e.scouter === scouter).reduce((acc, ele) => acc.concat(ele.matches), [-1])

        scouterMatches = scouterMatches.filter(e => e >= 0);

        let mostConsecutive = 0
        let currentConsecutive = 0
        let lastMatch = -1

        scouterMatches = scouterMatches.sort((a, b) => a-b)

        scouterMatches.forEach(e => {

            if(e-lastMatch === 1) {
                if(currentConsecutive === 0) currentConsecutive++
                currentConsecutive++
            } else currentConsecutive = 0

            if(currentConsecutive > mostConsecutive) mostConsecutive = currentConsecutive

            lastMatch = e
        })

        return mostConsecutive
    }

    public generateScouterCode(scouter:Scouter) {
        if(scouter) {

            let code = "sch:" + scouter.name + ":"

            //Generate the code for the user
            return this.shifts.filter(e => e.scouter === scouter)
                .sort((a, b) => a.matches[0]-b.matches[0])
                .reduce((acc, ele) =>
                    acc+
                    `s${ele.station}m${ele.matches.length > 1 ? ele.matches[0] + "-" + ele.matches[ele.matches.length-1] : ele.matches[0]},`, code)
        } else return ""
    }

    public generateSchedule(targetContinuousLength:number):Schedule {

        this.shifts = []

        let numMatchesPerScout = this.totalMatchesToScout() / this.scouters.length;

        if(targetContinuousLength > numMatchesPerScout) targetContinuousLength=numMatchesPerScout

        let currentScoutPool = this.scouters;

       for(let match = 0; match<this.matches.length; match ++) {

            for(let station = 0; station<6; station++) {

                //Generate 0 to 5 for stations
                let thisScout = Math.floor(Math.random() * currentScoutPool.length)

                while(this.isDoubleScouted(currentScoutPool[thisScout].name, match, station)) {
                    //Regen the scout if the current match would have a person double scout
                    thisScout = Math.floor(Math.random() * currentScoutPool.length)
                }

                this.createShift(currentScoutPool[thisScout].name, station, match)

                currentScoutPool = currentScoutPool.filter(e => e !== currentScoutPool[thisScout])

                if(currentScoutPool.length === 0) currentScoutPool = this.scouters

            }
        }


        return Object.create(this)
    }

    public isDoubleScouted(scouterName:any, match:number, station:number):boolean {
        let scouter = this.getScouterFromName(scouterName)

        return this.shifts.filter(e => e.scouter === scouter && e.station !== station && e.matches.indexOf(match) !== -1).length>0

    }

    public getTargetMatchesPerScout():number {
        return Math.round(this.totalMatchesToScout()/this.scouters.length)
    }

    public getScoutsOverScouting():number {
        let target = this.getTargetMatchesPerScout()

        return this.scouters.filter(e => this.getNumMatchesForScout(e) > target).length
    }

    public totalMatchesToScout():number {
        return this.matches.length * 6
    }

    public totalMatchesInShifts():number {
        return this.shifts.map(e => e.matches).reduce((acc, val) => acc + val.length, 0)
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

    public createScouter(name:string, color:string):Schedule {
        this.scouters.push(new Scouter(name, color))

        return Object.create(this)
    }

    public addScouter(name:string):Schedule {

        if(this.scouters.length > 0) {
            this.scouters.push(
                new Scouter(
                    name,
                    this.getNextColor()
                )
            )
        } else {
            this.scouters.push(
                new Scouter(
                    name,
                    colors[0]
                )
            )

        }

        return Object.create(this)

    }

    public getNextColor():string {

        return colors[(this.scouters.length)%colors.length]
    }

}

class Shift {
    constructor(
        public matches:number[], //Indices of matches
        public station:number, //Index of the alliance station (red 1 = 0, up to blue 3 = 5)
        public scouter:Scouter

    ) {
    }

    public swapStation(other:Shift) {
        let temp = this.station
        this.station = other.station
        other.station = temp
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

class DropDownOptionsAltText {

    public readonly key:string
    public readonly text:string
    public readonly value:string

    constructor(
        value:string,
        display:string
    ) {
        this.key = value
        this.text = display
        this.value = value
    }
}

export {
    Scouter,
    Schedule,
    Shift,
    DropDownOptions,
    DropDownOptionsAltText,
    colors
}