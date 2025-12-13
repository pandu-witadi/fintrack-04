import { Check, X } from 'lucide-react';

export const IconActive = (active: boolean) => {
    return active ? (
        <Check className="text-green-600" size={16} />
      ) : (
        <X className="text-red-600" size={16} />
  );
};