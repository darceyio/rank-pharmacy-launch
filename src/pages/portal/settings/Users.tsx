import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePharmacist } from '@/hooks/usePharmacist';
import PortalLayoutNew from '@/components/portal/PortalLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users as UsersIcon, UserPlus, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Users() {
  const { pharmacist } = usePharmacist();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pharmacist?.pharmacy_id) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('pharmacists')
        .select('*')
        .eq('pharmacy_id', pharmacist.pharmacy_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [pharmacist?.pharmacy_id]);

  const toggleUserActive = async (userId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('pharmacists')
      .update({ is_active: !currentValue })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user status');
    } else {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentValue } : u
      ));
      toast.success(currentValue ? 'User deactivated' : 'User activated');
    }
  };

  if (loading) {
    return (
      <PortalLayoutNew>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </PortalLayoutNew>
    );
  }

  const isOwner = pharmacist?.role === 'pharmacy_owner' || pharmacist?.role === 'super_admin';

  return (
    <PortalLayoutNew>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage pharmacy staff accounts
            </p>
          </div>
          {isOwner && (
            <Button className="gap-2" disabled>
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          )}
        </div>

        {!isOwner && (
          <Card className="border-muted-foreground/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Only pharmacy owners can manage user accounts
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Staff Members
            </CardTitle>
            <CardDescription>
              {users.length} {users.length === 1 ? 'user' : 'users'} in your pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        {user.first_name} {user.last_name}
                      </h3>
                      <Badge variant={user.role === 'pharmacy_owner' ? 'default' : 'secondary'}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="text-sm text-muted-foreground">
                        {user.phone}
                      </div>
                    )}
                  </div>

                  {isOwner && user.id !== pharmacist.id && (
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`active-${user.id}`} className="cursor-pointer text-sm">
                        Active
                      </Label>
                      <Switch
                        id={`active-${user.id}`}
                        checked={user.is_active}
                        onCheckedChange={() => toggleUserActive(user.id, user.is_active)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Invite New User</CardTitle>
              <CardDescription>
                User invitation feature coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                To add a new user, contact support or manually create the user in Supabase Auth.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayoutNew>
  );
}
