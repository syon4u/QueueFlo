
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import CustomerSearchBox from '@/components/customer/CustomerSearchBox';
import { Customer } from '@/components/customer/CustomerSearchBox';

const CustomerSearchTab: React.FC = () => {
  const { t } = useTranslation();
  
  const handleSelectCustomer = (customer: Customer) => {
    // This is handled in the CustomerSearchBox component
  };
  
  const handleCreateNew = () => {
    // No need to implement this for staff view
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('customer.viewHistory')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('customer.search')}</CardTitle>
          <CardDescription>
            {t('staff.viewHistory')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerSearchBox 
            onSelectCustomer={handleSelectCustomer} 
            onCreateNew={handleCreateNew}
            showHistory={true} // Enable history viewing
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSearchTab;
