
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

export interface Column {
  key: string;
  header: string;
  cell?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onAddClick?: () => void;
  onEditClick?: (row: any) => void;
  onDeleteClick?: (row: any) => void;
  isLoading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isLoading = false
}) => {
  return (
    <div>
      {/* Header with add button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Manage Data</h2>
        {onAddClick && (
          <Button onClick={onAddClick} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      
      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
              {(onEditClick || onDeleteClick) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEditClick || onDeleteClick ? 1 : 0)} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEditClick || onDeleteClick ? 1 : 0)} className="h-24 text-center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id || index}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`}>
                      {column.cell ? column.cell(row) : row[column.key]}
                    </TableCell>
                  ))}
                  {(onEditClick || onDeleteClick) && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {onEditClick && (
                          <Button variant="outline" size="sm" onClick={() => onEditClick(row)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteClick && (
                          <Button variant="outline" size="sm" onClick={() => onDeleteClick(row)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
