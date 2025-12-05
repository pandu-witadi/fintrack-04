// Function to sort events with income first, then expense
const sortRow = (rows: any[]) => {
    return [...rows].sort((a, b) => {
        // If types are different, prioritize income over expense
        if (a.typ !== b.typ) {
            if (a.typ === 'income') return -1;  // income comes first
            if (b.typ === 'income') return 1;   // income comes first
            if (a.typ === 'expense') return 1;  // expense comes after income
            if (b.typ === 'expense') return -1; // expense comes after income
        }
        
        // If groups are the same, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export default sortRow;
