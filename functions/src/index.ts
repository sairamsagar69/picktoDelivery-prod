
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "asia-southeast1" });

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const uploadDocumentsDriver = onCall(async (request) => {
  // --- DIAGNOSTIC LOGS START ---
  console.log("Executing v3 of uploadDocumentsDriver: Now with diagnostic logs.");
  console.log("Received data:", JSON.stringify(request.data, null, 2));
  // --- DIAGNOSTIC LOGS END ---

  const { 
    riderId, 
    files, 
    fullName, 
    city, 
    vehicleType, 
    licenseNo, 
    rcNo, 
    insuranceNo, 
    aadhaarNo 
  } = request.data;

  if (!riderId || !files || !fullName || !city || !vehicleType) {
    console.error("Validation failed. Missing fields.", { riderId, hasFiles: !!files, fullName, city, vehicleType });
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields for driver onboarding."
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

  const riderData = {
    fullName,
    city,
    vehicleType,
    licenseNo,
    rcNo,
    insuranceNo,
    aadhaarNo,
    documents: documentUrls,
    status: "pending_approval",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  console.log("Preparing to write to Firestore with this data:", JSON.stringify(riderData, null, 2));

  await docRef.set(riderData, { merge: true });

  console.log("Firestore write successful!");

  return { success: true, message: "Driver profile created successfully." };
});
