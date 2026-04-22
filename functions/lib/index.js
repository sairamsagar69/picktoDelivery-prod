"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocumentsDriver = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const v2_1 = require("firebase-functions/v2");
(0, v2_1.setGlobalOptions)({ region: "asia-southeast1" });
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
exports.uploadDocumentsDriver = (0, https_1.onCall)(async (request) => {
    const { riderId, files } = request.data;
    if (!riderId || !files) {
        throw new https_1.HttpsError("invalid-argument", "Missing riderId or files");
    }
    const bucket = storage.bucket();
    const uploadPromises = files.map(async (file) => {
        const { name, content } = file;
        const path = `riders/${riderId}/documents/${name}`;
        const fileRef = bucket.file(path);
        await fileRef.save(Buffer.from(content, "base64"));
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });
        return { name, url };
    });
    const uploadedFiles = await Promise.all(uploadPromises);
    const docRef = db.collection("riders").doc(riderId);
    const documentUrls = uploadedFiles.reduce((acc, file) => {
        acc[file.name] = file.url;
        return acc;
    }, {});
    await docRef.set({
        documents: documentUrls,
    }, { merge: true });
    return { success: true, fileUrls: uploadedFiles };
});
//# sourceMappingURL=index.js.map