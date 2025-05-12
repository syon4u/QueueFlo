
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import CustomerHistoryDialog from '@/components/staff/CustomerHistoryDialog';

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

type CustomerSearchBoxProps = {
  onSelectCustomer: (customer: Customer) => void;
  onCreateNew: () => void;
  showHistory?: boolean; // Add option to show history button
};

const CustomerSearchBox: React.FC<CustomerSearchBoxProps> = ({ 
  onSelectCustomer, 
  onCreateNew,
  showHistory = false // Default to false if not provided
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Search for customers by phone or email
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, phone, email')
        .or(`phone.ilike.%${searchTerm}%, email.ilike.%${searchTerm}%, first_name.ilike.%${searchTerm}%, last_name.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      
      setSearchResults(data || []);
      if ((data || []).length === 0) {
        toast({
          description: t('customer.noResults')
        });
      }
    } catch (error) {
      console.error('Error searching for customers:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('customer.searchError')
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowHistoryDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input 
          placeholder={t('customer.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {t('common.search')}
        </Button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted px-4 py-2 font-medium">
            {t('customer.searchResults', { count: searchResults.length })}
          </div>
          <div className="divide-y">
            {searchResults.map((customer) => (
              <div 
                key={customer.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <button
                  className="text-left flex-1"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.phone && <div>{customer.phone}</div>}
                    {customer.email && <div>{customer.email}</div>}
                  </div>
                </button>
                
                {showHistory && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewHistory(customer)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    {t('customer.viewHistory')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t('customer.searchInstructions')}
        </div>
        <Button variant="outline" onClick={onCreateNew}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('customer.createNew')}
        </Button>
      </div>
      
      {/* Customer History Dialog */}
      <CustomerHistoryDialog
        customer={selectedCustomer}
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
      />
    </div>
  );
};

export default CustomerSearchBox;
