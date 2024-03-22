import {ZebraTable} from "@david.kucsai/react-pdf-table/lib/stories/components/story/ZebraTable";

/// <reference types="react-scripts" />
declare module 'list-files'
declare module 'react-qr-scanner'
declare module 'react-csv'
declare module 'react-pdf-table' {
    interface ZebraTable {
        // ZebraTable: any
    }
}