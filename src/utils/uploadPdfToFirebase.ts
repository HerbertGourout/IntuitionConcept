import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a PDF file to Firebase Storage under a purchase order folder.
 * @param file File object (must be PDF)
 * @param orderNumber Unique ID for the purchase order
 * @returns Promise<string> download URL
 */
export async function uploadPdfToFirebase(file: File, orderNumber: string): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Seuls les fichiers PDF sont autorisés.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Le fichier PDF ne doit pas dépasser 10 Mo.');
  }
  const fileRef = ref(storage, `purchaseOrders/${orderNumber}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

/**
 * Delete a PDF file from Firebase Storage.
 * @param pdfUrl Download URL of the file
 */
export async function deletePdfFromFirebase(pdfUrl: string): Promise<void> {
  const fileRef = ref(storage, pdfUrl.replace(/^https:\/\/[^/]+\//, ''));
  await deleteObject(fileRef);
}
