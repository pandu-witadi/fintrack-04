import { SquareCheck, ChevronsRight } from 'lucide-react';

export const IconDone = (done: boolean) => {
    return done ? (
        <SquareCheck className="text-green-700" size={16} />
      ) : (
        <ChevronsRight className="text-orange-600" size={16} />
    );
};