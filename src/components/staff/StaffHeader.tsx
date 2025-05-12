
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Keyboard, Bell, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';

interface StaffHeaderProps {
  user: any;
  role: string;
  onToggleShortcuts: () => void;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ 
  user, 
  role,
  onToggleShortcuts
}) => {
  const { t } = useTranslation();
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  
  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <Link to="/" className="text-primary">
                Queue Manager
              </Link>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <Button variant="outline" size="icon" onClick={onToggleShortcuts}>
              <Keyboard className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.email}
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    {role === 'admin' ? t('admin.role') : t('staff.role')}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {t('profile.title')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/appointments" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    {t('appointments.title')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;
