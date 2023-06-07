
export function splitString(code:string, splitLength:number = 750) {

    const numChunks = Math.ceil(code.length / splitLength)
    const chunks:string[] = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += splitLength) {
        chunks[i] = code.substring(o, o+splitLength)
    }

    let total = 0

    return chunks.map(e => {
        total++

        return `pt${chunks.indexOf(e) !== chunks.length - 1 ? total : "f"}:${e}`
    });


}