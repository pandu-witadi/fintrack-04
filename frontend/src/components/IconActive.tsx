import { Check, X } from 'lucide-react';

export const IconActive = (active: boolean) => {
    return active ? (
        <Check className="text-green-500" size={16} />
      ) : (
        <X className="text-red-500" size={16} />
  );
};