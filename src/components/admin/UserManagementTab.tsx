
import React, { useState } from 'react';
import { Shield, Users, Plus, Cog } from 'lucide-react';
import { useUserManagement } from '@/hooks/admin/use-user-management';
import { UsersTable } from './users/UsersTable';
import { UserSearchBox } from './users/UserSearchBox';
import { LoadingSpinner } from './users/LoadingSpinner';
import { ErrorAlert } from './users/ErrorAlert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionsManager } from './users/PermissionsManager';

export const UserManagementTab = () => {
  const {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleRoleChange,
    addTemporaryData,
    staffMembers
  } = useUserManagement();

  const [activeTab, setActiveTab] = useState('users');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                User & Staff Management
              </CardTitle>
              <CardDescription>
                Manage users, staff and their access permissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm">{users.length} users</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addTemporaryData}
                className="ml-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Test Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="users">Users & Staff</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <div className="mb-6">
                <UserSearchBox 
                  value={searchQuery} 
                  onChange={setSearchQuery}
                />
              </div>

              <UsersTable 
                users={users} 
                onRoleChange={handleRoleChange} 
              />
            </TabsContent>
            
            <TabsContent value="permissions">
              <PermissionsManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementTab;
