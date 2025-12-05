const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '-';
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '-';
    }
};

export default formatDate;
