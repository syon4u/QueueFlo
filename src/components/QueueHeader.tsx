
import React from 'react';
import { useQueue } from '@/context/QueueContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const QueueHeader: React.FC = () => {
  const { stats, resetQueue } = useQueue();
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl sm:text-3xl font-bold text-gradient">
          QueueFlow
          <span className="text-teal-500">.</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Managing <span className="font-medium">{stats.totalCustomers}</span> customer{stats.totalCustomers !== 1 ? 's' : ''}
          {stats.waitingCustomers > 0 && <span> • <span className="text-primary font-medium">{stats.waitingCustomers}</span> waiting</span>}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
              aria-label="Reset Queue"
            >
              <RefreshCcw size={14} />
              <span>Reset Queue</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Reset Queue</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This will remove all customers from the queue. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsResetDialogOpen(false)}
                className="border-gray-200 hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  resetQueue();
                  setIsResetDialogOpen(false);
                }}
                className="shadow-sm"
              >
                Reset Queue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default QueueHeader;
