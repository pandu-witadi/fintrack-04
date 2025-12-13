import { SquareCheck, ChevronsRight } from 'lucide-react';

export const IconDone = (done: boolean) => {
    return done ? (
        <SquareCheck className="text-pink-600" size={16} />
      ) : (
        <ChevronsRight className="text-cyan-600" size={16} />
    );
};