/**
 * Example Firebase Usage Component
 * Demonstrates authentication, Firestore, and Storage integration
 */

import { useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirestore, where, orderBy } from '@/hooks/useFirestore';
import { useStorageFile } from '@/hooks/useStorageFile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlantDisease {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: any;
}

export function FirebaseExample() {
  const { user, loading: authLoading, error: authError, signIn, signOut, signUp } =
    useFirebaseAuth();
  const { queryDocuments, addDocument, deleteDocument, loading: firestoreLoading } =
    useFirestore('plant_diseases');
  const { uploadFile, loading: storageLoading } = useStorageFile('disease-photos');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diseases, setDiseases] = useState<PlantDisease[]>([]);
  const [diseaseName, setDiseaseName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Load user's diseases
  const loadDiseases = async () => {
    if (!user) return;
    try {
      const results = await queryDocuments([
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      ]);
      setDiseases(results as PlantDisease[]);
    } catch (error) {
      console.error('Failed to load diseases:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setEmail('');
      setPassword('');
      await loadDiseases();
    } catch (error) {
      console.error('Login failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      setEmail('');
      setPassword('');
      await loadDiseases();
    } catch (error) {
      console.error('Sign up failed');
    }
  };

  const handleAddDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !diseaseName) return;

    try {
      let photoUrl = '';

      // Upload photo if provided
      if (selectedImage) {
        const { url } = await uploadFile(
          selectedImage,
          `disease-${Date.now()}-${selectedImage.name}`
        );
        photoUrl = url;
      }

      // Save to Firestore
      await addDocument({
        userId: user.uid,
        name: diseaseName,
        description: 'Plant disease found',
        severity: 'medium',
        photoUrl,
      });

      setDiseaseName('');
      setSelectedImage(null);
      await loadDiseases();
    } catch (error) {
      console.error('Failed to add disease');
    }
  };

  const handleDeleteDisease = async (diseaseId: string) => {
    try {
      await deleteDocument(diseaseId);
      await loadDiseases();
    } catch (error) {
      console.error('Failed to delete disease');
    }
  };

  // Show loading state
  if (authLoading) {
    return <div className="p-4">Loading...</div>;
  }

  // Show login/signup form if not authenticated
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Firebase Example</h2>

        {authError && (
          <Alert variant="destructive">
            <AlertDescription>{authError.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm">or</div>

        <Button onClick={(e) => handleSignUp(e as any)} className="w-full" variant="outline">
          Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plant Diseases</h2>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p>Welcome, {user.email}</p>
      </div>

      {/* Add Disease Form */}
      <form onSubmit={handleAddDisease} className="space-y-4 border p-4 rounded-lg">
        <h3 className="font-semibold">Add New Disease Report</h3>

        <Input
          placeholder="Disease name"
          value={diseaseName}
          onChange={(e) => setDiseaseName(e.target.value)}
          required
        />

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
        />

        <Button type="submit" disabled={firestoreLoading || storageLoading}>
          {storageLoading ? 'Uploading...' : 'Add Disease'}
        </Button>
      </form>

      {/* Diseases List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your Disease Reports</h3>

        {firestoreLoading ? (
          <p>Loading...</p>
        ) : diseases.length === 0 ? (
          <p className="text-gray-500">No disease reports yet</p>
        ) : (
          diseases.map((disease) => (
            <div key={disease.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{disease.name}</h4>
                  <p className="text-sm text-gray-600">{disease.description}</p>
                  <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                    Severity: {disease.severity}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDisease(disease.id)}
                >
                  Delete
                </Button>
              </div>

              {disease.photoUrl && (
                <img
                  src={disease.photoUrl}
                  alt={disease.name}
                  className="w-full max-h-48 object-cover rounded"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FirebaseExample;
