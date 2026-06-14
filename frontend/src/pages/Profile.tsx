import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../shared/ui/Card';
import { Button } from '../shared/ui/Button';
import { MainLayout } from '../routes/MainLayout';
import { useAuth } from '../providers/AuthProvider';
import { profileApi } from '../features/profile/services';
import { Loader2 } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        setProfile(data.profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="text-lg font-medium">{user?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-lg font-medium">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="text-lg font-medium">{user?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="text-lg font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>
          {profile && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Role Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-lg font-medium capitalize">{profile.profile_status}</p>
                </div>
                {profile.profile_data && Object.keys(profile.profile_data).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Profile Data</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(profile.profile_data).map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{key}</p>
                          <p className="text-md font-medium">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
          <div className="mt-6 flex gap-4">
            <Button onClick={() => navigate('/dashboard')}>Back</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
