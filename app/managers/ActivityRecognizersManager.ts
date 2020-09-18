import { contextApis } from "nativescript-context-apis";
import {
    Resolution,
    ActivityRecognizer,
} from "nativescript-context-apis/activity-recognition";
import { initializeHighResRecognizer } from "~/utils/high-res-initializer";
import { LocalNotifications } from "nativescript-local-notifications";

const recognizers = [Resolution.LOW, Resolution.MEDIUM, Resolution.HIGH];

export class ActivityRecognizersManager {
    public prepareAllRecognizers() {
        recognizers.forEach((type) => {
            this.prepareRecognizer(type);
        });
    }

    private async prepareRecognizer(type) {
        const rec = contextApis.getActivityRecognizer(type);

        if (type === Resolution.HIGH) {
            await initializeHighResRecognizer(rec);
        }

        const isReady = rec.isReady();
        console.log(`${type} res activity ready: ${isReady}`);

        if (!isReady) {
            console.log(`Up to prepare ${type} res activity recognizer...`);
            await rec.prepare();
        }
    }

    public async enableRecognizer(type: Resolution, callback) {
        const recognizer = contextApis.getActivityRecognizer(type);
        recognizer.listenActivityChanges(callback);
        await recognizer.startRecognizing();
        console.log(`${type} res recognizer enabled!`);
        LocalNotifications.schedule([
            {
                title: `${type} res started`,
            },
        ]);
    }

    public async disableRecognizer(type: Resolution) {
        const recognizer = contextApis.getActivityRecognizer(type);
        recognizer.stopListening();
        await recognizer.stopRecognizing();
        console.log(`${type} res recognizer disabled!`);
    }

    public stopRecognizers() {
        recognizers.forEach((type) => {
            const rec = contextApis.getActivityRecognizer(type);
            rec.stopRecognizing();
            console.log(`${type} res activity recognizer stoped`);
            rec.stopListening();
        });
    }
}

let _instance: ActivityRecognizersManager;
export function getRecognizersManager() {
    if (!_instance) {
        _instance = new ActivityRecognizersManager();
    }

    return _instance;
}
