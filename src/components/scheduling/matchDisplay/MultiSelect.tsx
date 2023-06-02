class RowCol {
    constructor(
        public row: number,
        public col: number
    ) {
    }

    public updateRow(row: number): RowCol {
        this.row = row;

        return Object.create(this)
    }

    public updateCol(col: number): RowCol {
        this.col = col;

        return Object.create(this)
    }

}

class Rectangle {

    constructor(
        public anchor:RowCol,
        public width:number,
        public height:number
    ) {
    }

    public update(current:RowCol):Rectangle {
        this.width = current.col-this.anchor.col

        this.height = current.row-this.anchor.row

        return Object.create(this)
    }

    public setAnchor(anchor:RowCol):Rectangle {
        this.anchor = anchor

        return Object.create(this)
    }

    public getTopLeft():RowCol {
        return new RowCol(
            this.height > 0 ? this.anchor.row : this.anchor.row + this.height,
            this.width > 0 ? this.anchor.col : this.anchor.col + this.width
        )
    }

    public getBottomRight():RowCol {
        return new RowCol(
            this.height > 0 ? this.anchor.row + this.height : this.anchor.row,
            this.width > 0 ? this.anchor.col + this.width : this.anchor.col
        )
    }


}

export {RowCol, Rectangle};