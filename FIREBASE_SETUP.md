# Firebase Integration Guide

This guide walks you through setting up Firebase for the Plant Doctor AI project.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter your project name (e.g., "Plant Doctor AI")
4. Configure Google Analytics (optional)
5. Click "Create project"
6. Wait for your project to be created

## 2. Add a Web App to Your Project

1. In the Firebase Console, click the Web icon (`</>`)</span> to create a new Web App
2. Enter your app name
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy your Firebase configuration

## 3. Get Your Firebase Credentials

After registering your app, you'll see a configuration object like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project-id",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  measurementId: "G-ABC123..."
};
```

## 4. Configure Environment Variables

1. Copy `.env.firebase` to `.env.local`
2. Fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-id
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123...
```

## 5. Enable Firebase Services

### Authentication
1. Go to **Authentication** in Firebase Console
2. Click "Get started"
3. Enable **Email/Password** authentication
4. (Optional) Enable other providers (Google, GitHub, etc.)

### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location (closest to your users)
5. Click "Create"

⚠️ **Security Note**: Test mode allows anyone to read/write. Before production, update your security rules.

### Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose a location
4. Keep the default rules for now (or customize as needed)

### Realtime Database (Optional)
1. Go to **Realtime Database**
2. Click "Create Database"
3. Start in test mode
4. Select a location

## 6. Setup Security Rules (Important!)

### Firestore Rules (in Firebase Console)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules (in Firebase Console)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Using Firebase in Your App

### 1. Setup Authentication Provider in App.tsx or main.tsx

```tsx
import { FirebaseAuthProvider } from './hooks/useFirebaseAuth';

function App() {
  return (
    <FirebaseAuthProvider>
      {/* Your app components */}
    </FirebaseAuthProvider>
  );
}
```

### 2. Use Authentication Hook

```tsx
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

function LoginComponent() {
  const { user, loading, error, signIn } = useFirebaseAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      console.log('Logged in successfully');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user && <p>Welcome, {user.email}</p>}
      {/* Login form */}
    </div>
  );
}
```

### 3. Use Firestore Hook

```tsx
import { useFirestore, where, orderBy } from '@/hooks/useFirestore';

function PlantDiseases() {
  const { addDocument, queryDocuments, deleteDocument, loading, error } = 
    useFirestore('plant_diseases');

  const fetchDiseases = async () => {
    const constraints = [
      where('userId', '==', currentUserId),
      orderBy('createdAt', 'desc')
    ];
    const results = await queryDocuments(constraints);
  };

  const addDisease = async (diseaseData: any) => {
    await addDocument({
      userId: currentUserId,
      ...diseaseData,
    });
  };

  return (
    // Your component JSX
  );
}
```

### 4. Use Storage Hook

```tsx
import { useStorageFile } from '@/hooks/useStorageFile';

function ImageUploader() {
  const { uploadFile, loading, uploadProgress } = 
    useStorageFile('disease-images');

  const handleImageUpload = async (file: File) => {
    try {
      const { url, path } = await uploadFile(file, `disease-${Date.now()}`);
      console.log('Image uploaded to:', url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {loading && <p>Upload Progress: {uploadProgress}%</p>}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files![0])}
      />
    </div>
  );
}
```

## Available Hooks

### useFirebaseAuth
```tsx
const {
  user,           // Current user object
  loading,        // Loading state
  error,          // Auth error
  signUp,         // Sign up with email/password
  signIn,         // Sign in with email/password
  signOut,        // Sign out
  resetPassword,  // Send password reset email
  updateProfile,  // Update user profile
} = useFirebaseAuth();
```

### useFirestore
```tsx
const {
  loading,      // Loading state
  error,        // Error object
  addDocument,      // Add a new document
  setDocument,      // Set/replace a document
  updateDocument,   // Update a document
  deleteDocument,   // Delete a document
  getDocument,      // Get a single document by ID
  queryDocuments,   // Query documents with constraints
  getAllDocuments,  // Get all documents in collection
} = useFirestore('collectionName');
```

### useStorageFile
```tsx
const {
  loading,        // Loading state
  error,          // Error object
  uploadProgress, // Upload progress (0-100)
  uploadFile,     // Upload a file
  downloadFile,   // Download file as bytes
  getFileUrl,     // Get download URL
  deleteFile,     // Delete a file
  listFiles,      // List all files in a path
} = useStorageFile('bucket/path');
```

## Common Use Cases

### Upload a photo and save metadata to Firestore

```tsx
async function savePlantPhoto(file: File, diseaseData: any) {
  try {
    // Upload image
    const { url } = await uploadFile(file);
    
    // Save metadata to Firestore
    await addDocument({
      userId: user!.uid,
      photoUrl: url,
      ...diseaseData,
    });
  } catch (error) {
    console.error('Failed to save plant:', error);
  }
}
```

### Fetch user's plant diseases

```tsx
async function loadUserDiseases() {
  const results = await queryDocuments([
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(10)
  ]);
  return results;
}
```

## Troubleshooting

### "Firebase configuration incomplete"
- Make sure all environment variables are set in `.env.local`
- Restart your dev server after adding new env variables

### "useFirebaseAuth must be used within a FirebaseAuthProvider"
- Wrap your app or component with `<FirebaseAuthProvider>`

### "Permission denied" errors
- Check your Firebase security rules
- Ensure the user is authenticated
- Verify the user has access to the data/storage

### Authentication not persisting
- Firebase Auth handles persistence automatically
- Check browser's local storage is enabled

## Next Steps

1. ✅ Install firebase package
2. ✅ Create environment variables
3. ✅ Set up authentication
4. ✅ Enable Firestore
5. ✅ Enable Storage
6. 📝 Update your pages to use Firebase hooks
7. 🧪 Test authentication flow
8. 🔒 Update security rules for production

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Database Guide](https://firebase.google.com/docs/firestore)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
