
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useQueue } from '@/context/QueueContext';

export const QueueManagementTab: React.FC = () => {
  const { customers, stats, callNextCustomer, markAsServed, markAsNoShow, resetQueue } = useQueue();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Queue Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitingCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Served</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.servedCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noShowCustomers}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={callNextCustomer}>Call Next</Button>
        <Button onClick={markAsServed} variant="secondary">Mark as Served</Button>
        <Button onClick={markAsNoShow} variant="outline">Mark as No-Show</Button>
        <Button onClick={resetQueue} variant="destructive">Reset Queue</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waited</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.serviceId || 'N/A'}</TableCell>
                    <TableCell>{customer.status}</TableCell>
                    <TableCell>
                      {Math.floor(
                        (new Date().getTime() - new Date(customer.joinedAt).getTime()) / 60000
                      )}{' '}
                      min
                    </TableCell>
                    <TableCell>
                      <span className={customer.priority === 'priority' ? 'text-red-500 font-bold' : ''}>
                        {customer.priority}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Queue is empty</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
