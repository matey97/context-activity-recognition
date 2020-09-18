import { contextApis } from "nativescript-context-apis";
import { Subscription, of } from "rxjs";
import { getCSVWriter } from "~/utils/csv-writer";
import {
    GeolocationProvider,
    Geolocation,
} from "nativescript-context-apis/geolocation";

export class LocationManager {
    private locationSubscription: Subscription;

    public async startLocationUpdates() {
        const provider = contextApis.geolocationProvider;
        const ok = await this.prepareGeolocationProvider(provider);

        const stream = ok
            ? provider.locationStream({
                  highAccuracy: true,
                  stdInterval: 30000,
                  maxAge: 60000,
              })
            : of<Geolocation>(null);

        this.locationSubscription = stream.subscribe(
            (location) => {
                console.log(`Location acquired!: ${JSON.stringify(location)}`);
                getCSVWriter().write({
                    type: "LOCATION",
                    record: `${location.latitude}#${location.longitude}`,
                    confidence: -1,
                    timestamp: location.timestamp.getTime(),
                });
            },
            (error) =>
                console.error(
                    `Location updates could not be acquired: ${error}`
                )
        );
    }

    private _preparing: Promise<any>;
    private async prepareGeolocationProvider(
        provider: GeolocationProvider
    ): Promise<boolean> {
        const isReady = await provider.isReady();
        if (isReady) {
            return true;
        }

        try {
            if (!this._preparing) {
                this._preparing = provider.prepare();
            }
            await this._preparing;
            return true;
        } catch (e) {
            console.error(`GeolocationProvider couldn't be prepared: ${e}`);
            return false;
        } finally {
            this._preparing = null;
        }
    }

    public stopLocationUpdates() {
        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
            console.log("Unsuscribed from GeolocationProvider");
        }
    }
}

let _instance: LocationManager;
export function getLocationManager() {
    if (!_instance) {
        _instance = new LocationManager();
    }

    return _instance;
}
