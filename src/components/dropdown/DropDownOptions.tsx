
class DropDownOptions {
    constructor(public options:KeyValuePair[]) {
    }
}

class KeyValuePair {
    constructor(public key:string, public value:string) {
    }

    getDisplayName():string {
        return this.key + " | " + this.value
    }
}


export {
    DropDownOptions,
    KeyValuePair
};