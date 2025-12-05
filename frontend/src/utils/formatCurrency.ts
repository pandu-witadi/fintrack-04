

// Format number as currency
const formatCurrency = (value: number): string => {
    // return new Intl.NumberFormat('id-ID', {
    //     style: 'currency',
    //     currency: 'IDR',
    //     minimumFractionDigits: 0,
    //     maximumFractionDigits: 0,
    // }).format(value);

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default formatCurrency;
