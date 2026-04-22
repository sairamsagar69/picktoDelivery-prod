
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "asia-southeast1" });

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const uploadDocumentsDriver = onCall(async (request) => {
  const { riderId, files } = request.data;

  if (!riderId || !files) {
    throw new HttpsError(
      "invalid-argument",
      "Missing riderId or files"
    );
  }

  const bucket = storage.bucket();

  const uploadPromises = files.map(async (file: any) => {
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

  const documentUrls = uploadedFiles.reduce((acc: any, file: any) => {
    acc[file.name] = file.url;
    return acc;
  }, {});

  await docRef.set({
    documents: documentUrls,
  }, { merge: true });

  return { success: true, fileUrls: uploadedFiles };
});
