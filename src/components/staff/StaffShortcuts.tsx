
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface StaffShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const StaffShortcuts: React.FC<StaffShortcutsProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  
  const shortcuts = [
    { key: 'N', description: t('staff.shortcuts.nextCustomer') },
    { key: 'S', description: t('staff.shortcuts.markServed') },
    { key: 'X', description: t('staff.shortcuts.markNoShow') },
    { key: 'A', description: t('staff.shortcuts.markAvailable') },
    { key: 'B', description: t('staff.shortcuts.markBusy') },
    { key: 'O', description: t('staff.shortcuts.markOffline') },
    { key: '?', description: t('staff.shortcuts.showHelp') },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('staff.keyboardShortcuts')}</DialogTitle>
          <DialogDescription>
            {t('staff.shortcutsDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center">
                <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                  {shortcut.key}
                </kbd>
                <span className="ml-2 text-sm">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffShortcuts;
