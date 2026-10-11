import React from 'react';
import { LogOut } from 'lucide-react-native';
import { ConfirmDialog } from './ConfirmDialog';

/** The logout confirmation. */
export const LogoutDialog = ({
  isBusy = false,
  onCancel,
  onConfirm,
}: {
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ConfirmDialog
    icon={LogOut}
    title="Log out of your account?"
    message="You'll need to sign in again with your phone number to place your next order."
    cancelLabel="Stay logged in"
    confirmLabel="Log out"
    isBusy={isBusy}
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);
