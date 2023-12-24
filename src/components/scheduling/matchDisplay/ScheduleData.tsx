class Scouter {
    public unavailableMatches:number[] = []

    constructor(
        public readonly name:string,
        public readonly color:string) {
    }

    public getUnavailableString():string {
        this.unavailableMatches = this.unavailableMatches.sort((e1, e2) => e1-e2)

        this.unavailableMatches = Array.from(new Set(this.unavailableMatches))

        let message = ""

        //Negative 2 so that it's definitely not close to zero
        let lastNumber = -2
        let start = -2
        let end = -2

        for(let i = 0; i<this.unavailableMatches.length; i++) {
            let curVal = this.unavailableMatches[i]

            //Gap of more than one match
            if(curVal - lastNumber > 1) {
                if(end-start > 1) {
                    message += (start+1) + "-" + (end+1) + ", "
                    message += (curVal+1) + ", "
                } else if(this.unavailableMatches[i+1] - curVal > 1) {
                    message += (curVal+1) + ", "
                }

                start = curVal

            } else {
                end = curVal
            }

            lastNumber = curVal
        }

        if(end-start > 1) {
            message += (start+1) + "-" + (end+1) + ", "
        }

        return message.substring(0, message.length-2)

    }

    public parseUnavailableMatches(val:string) {
        let items:string[] = val.split(",")

        let unavailablilites:number[] = []

        items.forEach((e) => {
            if(e.indexOf("-") !== -1) {
                let start = e.substring(0, e.indexOf("-"))
                let end = e.substring(e.indexOf("-"))

                let startNum = parseInt(start)
                //The dash looks like a negative num to it
                let endNum = Math.abs(parseInt(end))

                for(let i = startNum; i<=endNum; i++) {
                    unavailablilites.push(i-1)
                }
            } else {
                unavailablilites.push(parseInt(e)-1)
            }
        })

        this.unavailableMatches = unavailablilites
    }
}

const colors:string[] = [
    "#3498db", // Dodger Blue
    "#2ecc71", // Emerald Green
    "#9b59b6", // Amethyst Purple
    "#1abc9c", // Turquoise
    "#34495e", // Midnight Blue
    "#27ae60", // Nephritis Green
    "#2980b9", // Royal Blue
    "#e74c3c", // Alizarin Red
    "#2c3e50", // Charcoal
    "#16a085", // Green Sea
    "#2980b9", // Steel Blue
    "#2ecc71"  // Chateau Green
];

class Schedule {

    public scouters:Scouter[] = []

    constructor(
        public matches:string[],
        scouterNames:string[],
        public shifts:Shift[]
    ) {
        this.addScouters(scouterNames)
    }

    public static fromJson(data:any, numQuals:number):Schedule {

        let scoutNames = new Set<string>();

        data.shifts.forEach((e:any) => {
            scoutNames.add(e.scouter);
        })

        let matchArray = Schedule.generateMatchLabels(numQuals)

        let schedule = new Schedule(matchArray, Array.from(scoutNames.values()), [])

        data.shifts.forEach((e:any) => {
            for(let i:number = e["match_start"]; i<=e["match_end"]; i++) {
                schedule.createShift(e.scouter, e.station, i)
            }
        })

        return schedule;
    }

    public generateJson(event:string):string {
        return `{
            "event":"${event}",
            "shifts":[${this.shifts.reduce((acc, e) => acc + e.toJson() + (this.shifts[this.shifts.length-1] === e ? "" : ","), "")}]
        }`
    }

    public setNumMatches(numberOfMatches:number) {

        this.matches = Schedule.generateMatchLabels(numberOfMatches)
    }

    public static generateMatchLabels(number:number):string[] {
        let arr:string[] = []

        for(let i = 1; i<=number; i++) {
            arr.push(`Quals ${i}`)
        }

        return arr;
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

    public generateSchedule():Schedule {

        this.shifts = []

        let currentScoutPool:Scouter[] = []

        for(let i= 0; i< this.getTargetMatchesPerScout(); i++) {
            currentScoutPool.push(...this.scouters)
        }

        console.log(currentScoutPool)

       for(let match = 0; match<this.matches.length; match ++) {

            for(let station = 0; station<6; station++) {

                //Generate 0 to 5 for stations
                let thisScoutIndex = Math.floor(Math.random() * currentScoutPool.length)

                let thisRerolls = 0

                while(this.isDoubleScouted(currentScoutPool[thisScoutIndex].name, match, station)
                    || currentScoutPool[thisScoutIndex].unavailableMatches.includes(match)) {

                    thisRerolls++

                    if(thisRerolls > 10) {
                        currentScoutPool.push(...this.scouters)
                    }

                    //Regen the scout if the current match would have a person double scout or the person is unavailable
                    thisScoutIndex = Math.floor(Math.random() * currentScoutPool.length)
                }

                this.createShift(currentScoutPool[thisScoutIndex].name, station, match)

                // currentScoutPool = currentScoutPool.filter(e => e !== currentScoutPool[thisScoutIndex])
                currentScoutPool.splice(thisScoutIndex, 1)

                //If we run out of scout options for some reason, reschedule something
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

    public toJson():string {
        return `{"scouter":"${this.scouter.name}", "station":${this.station}, "match_start":${Math.min.apply(Math, this.matches)}, "match_end":${Math.max.apply(Math, this.matches)}}`
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