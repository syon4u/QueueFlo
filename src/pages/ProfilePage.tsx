
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: ''
  });
  
  // Load user profile data
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || user.email || '',
            phone: data.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: t('common.error'),
          description: t('profile.errorFetching'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user?.id, toast, t, user?.email]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('customers')
        .upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone
        });
        
      if (error) throw error;
      
      toast({
        title: t('profile.success'),
        description: t('profile.profileUpdated')
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.errorUpdating'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t('profile.firstNamePlaceholder')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t('profile.lastNamePlaceholder')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('profile.emailPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('profile.phonePlaceholder')}
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.accountInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('profile.userRole')}</p>
              <p className="font-medium capitalize">{role}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('profile.userId')}</p>
              <p className="font-mono text-xs">{user?.id}</p>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/">{t('common.backToHome')}</Link>
              </Button>
              
              {role === 'customer' && (
                <Button asChild className="w-full">
                  <Link to="/customer">{t('common.customerDashboard')}</Link>
                </Button>
              )}
              
              {(role === 'staff' || role === 'admin') && (
                <Button asChild className="w-full">
                  <Link to="/staff">{t('common.staffDashboard')}</Link>
                </Button>
              )}
              
              {role === 'admin' && (
                <Button asChild className="w-full">
                  <Link to="/admin">{t('admin.dashboard')}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
