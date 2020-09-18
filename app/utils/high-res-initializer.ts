import * as fs from "tns-core-modules/file-system";
import { android as androidApp } from "tns-core-modules/application/application";
import { RecognizerOptions } from "nativescript-context-apis/internal/activity-recognition/recognizers/high-res/recognition-engine/abstract-recognizer";

import FirebaseCustomRemoteModel = com.google.firebase.ml.custom.FirebaseCustomRemoteModel;
import FirebaseModelManager = com.google.firebase.ml.common.modeldownload.FirebaseModelManager;
import FirebaseModelDownloadConditions = com.google.firebase.ml.common.modeldownload.FirebaseModelDownloadConditions;
import FirebaseStorage = com.google.firebase.storage.FirebaseStorage;
import StorageReference = com.google.firebase.storage.StorageReference;
import OnSuccessListener = com.google.android.gms.tasks.OnSuccessListener;
import OnFailureListener = com.google.android.gms.tasks.OnFailureListener;
import OnCompleteListener = com.google.android.gms.tasks.OnCompleteListener;
import { ActivityRecognizer } from "nativescript-context-apis/activity-recognition";
import { AndroidHighResRecognizer } from "nativescript-context-apis/internal/activity-recognition/recognizers/high-res/android/recognizer.android";

export async function initializeHighResRecognizer(
    recognizer: ActivityRecognizer
) {
    if (androidApp) {
        const options: RecognizerOptions = await downloadModelResources();
        (recognizer as AndroidHighResRecognizer).initializeRecongnizer(options);
    } else {
    }
}

async function downloadModelResources(): Promise<RecognizerOptions> {
    const localModelFilePath = await downloadModelFile();
    const labelsFilePath = await downloadLabelsFile();

    return {
        localModelFilePath,
        labelsFilePath,
    };
}

async function downloadModelFile(): Promise<string> {
    const firebaseModelManager: FirebaseModelManager = FirebaseModelManager.getInstance();
    const remoteModel: FirebaseCustomRemoteModel = new FirebaseCustomRemoteModel.Builder(
        "activity-recognition"
    ).build();
    const conditions: FirebaseModelDownloadConditions = new FirebaseModelDownloadConditions.Builder().build();

    const downloadTask = firebaseModelManager.download(remoteModel, conditions);

    const downloadPromise = new Promise((resolve, reject) => {
        downloadTask
            .addOnSuccessListener(
                new OnSuccessListener({
                    onSuccess: () => resolve(),
                })
            )
            .addOnFailureListener(
                new OnFailureListener({
                    onFailure: (ex) => {
                        console.log(ex);
                        reject();
                    },
                })
            );
    });

    await downloadPromise;

    const modelFile = firebaseModelManager.getLatestModelFile(remoteModel);
    const modelFilePromise = new Promise<java.io.File>((resolve, reject) => {
        modelFile
            .addOnCompleteListener(
                new OnCompleteListener({
                    onComplete: (task) => {
                        resolve(task.getResult());
                    },
                })
            )
            .addOnFailureListener(
                new OnFailureListener({
                    onFailure: (ex) => {
                        console.log(ex);
                        reject(ex);
                    },
                })
            );
    });

    const model: java.io.File = await modelFilePromise;
    return model.getAbsolutePath();
}

async function downloadLabelsFile(): Promise<string> {
    const storage: FirebaseStorage = FirebaseStorage.getInstance();
    const reference: StorageReference = storage.getReference("labels.txt");

    const labelsPath =
        fs.knownFolders.currentApp().path + fs.path.separator + "labels.txt";
    const labelsFile = new java.io.File(labelsPath);

    if (!labelsFile.exists()) {
        const downloadTask = reference.getFile(labelsFile);
        const downloadPromise = new Promise((resolve, reject) => {
            downloadTask
                .addOnSuccessListener(
                    new OnSuccessListener({
                        onSuccess: (result) => {
                            resolve();
                        },
                    })
                )
                .addOnFailureListener(
                    new OnFailureListener({
                        onFailure: (ex) => {
                            reject(ex);
                        },
                    })
                );
        });

        await downloadPromise;
    }
    // TODO: Maybe check file metadata to download the file again if it has been changed.

    return labelsFile.getPath();
}
