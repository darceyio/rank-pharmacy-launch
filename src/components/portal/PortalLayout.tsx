import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePharmacist } from '@/hooks/usePharmacist';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Briefcase, Calendar, Settings } from 'lucide-react';
import logoLight from '@/assets/logo-light.png';

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { pharmacist, loading: pharmacistLoading } = usePharmacist();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/portal/login');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal/login');
  };

  if (authLoading || pharmacistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !pharmacist) {
    return null;
  }

  const navItems = [
    { path: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/portal/services', label: 'Services', icon: Briefcase },
    { path: '/portal/bookings', label: 'Bookings', icon: Calendar },
    { path: '/portal/settings/pharmacy', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal/dashboard" className="flex items-center gap-3">
              <img src={logoLight} alt="Rank Pharmacy" className="h-8" />
              <span className="text-sm font-medium text-muted-foreground">Portal</span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                    (item.path === '/portal/settings/pharmacy' && location.pathname.startsWith('/portal/settings'));
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">
                    {pharmacist.first_name} {pharmacist.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {pharmacist.role.replace('_', ' ')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/portal/settings/pharmacy' && location.pathname.startsWith('/portal/settings'));
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
