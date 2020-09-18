import { knownFolders, Folder, File } from "tns-core-modules/file-system";

export class CSVWriter {
    private folder: Folder;
    private textToWrite = "";

    constructor(folderName: string, private fileName: string) {
        const documents = knownFolders.documents();
        this.folder = documents.getFolder(folderName);
    }

    async write(dict: Record) {
        if (!this.folder.contains(this.fileName)) {
            this.writeHeaders(dict);
        }
        this.writeRow(dict);
        await this.flush();
    }

    private writeHeaders(dict: Record) {
        const headers = this.getSortedDictKeys(dict);
        this.writeLine(headers.join(","));
    }

    private writeRow(dict: Record) {
        const headers = this.getSortedDictKeys(dict);
        const row = headers.reduce((prev, curr) => {
            const formatted = this.formatValue(dict[curr]);
            if (prev === "") {
                return formatted;
            }

            return `${prev},${formatted}`;
        }, "");
        this.writeLine(row);
    }

    private formatValue(value: any): string {
        switch (typeof value) {
            case "string":
                return `"${value.replace('"', '\\"')}"`;
            case "number":
                return `${value}`;
        }
    }

    private writeLine(line: string) {
        if (this.textToWrite === "") {
            this.textToWrite = line;
        } else {
            this.textToWrite = this.textToWrite + "\n" + line;
        }
    }

    private async flush(): Promise<void> {
        let fileContent = this.textToWrite;
        const { exists, file } = this.getFile();
        if (exists) {
            const existingContent = await file.readText();
            fileContent = existingContent + "\n" + fileContent;
        }
        await file.writeText(fileContent);
        this.textToWrite = "";
    }

    private getFile() {
        return {
            exists: this.folder.contains(this.fileName),
            file: this.folder.getFile(this.fileName),
        };
    }

    private getSortedDictKeys(dict: Record) {
        return Object.keys(dict).sort();
    }
}

export type RecordType =
    | "LOCATION"
    | "HIGH_RES"
    | "MED_RES"
    | "LOW_RES"
    | "GEOFENCE";

export interface Record {
    type: RecordType;
    record: string;
    confidence: number;
    timestamp: number;
}

let _instance: CSVWriter;
export function getCSVWriter(): CSVWriter {
    if (!_instance) {
        _instance = new CSVWriter(
            "ContextActivityRecognition",
            "experiment.csv"
        );
    }
    return _instance;
}
