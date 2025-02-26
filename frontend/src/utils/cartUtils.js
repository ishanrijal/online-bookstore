export const formatPrice = (price) => {
    // Handle null, undefined, or empty string
    if (!price && price !== 0) {
        console.log('formatPrice: null/undefined price', price);
        return '0';
    }

    // Remove any currency symbols and convert to number
    const numPrice = typeof price === 'string' ? 
        Number(price.replace(/[^0-9.-]+/g, '')) : 
        Number(price);
    
    // Return '0' if NaN
    if (isNaN(numPrice)) {
        console.log('formatPrice: NaN price', price);
        return '0';
    }
    
    // Format to 2 decimal places and remove trailing .00
    const formatted = numPrice.toFixed(2).replace(/\.00$/, '');
    console.log('formatPrice:', { input: price, output: formatted });
    return formatted;
};

export const calculateItemSubtotal = (item) => {
    if (!item) {
        console.log('calculateItemSubtotal: null item');
        return 0;
    }
    const price = Number(item.book_price) || 0;
    const quantity = Number(item.quantity) || 0;
    const subtotal = price * quantity;
    console.log('calculateItemSubtotal:', {
        item_title: item.book_title,
        price,
        quantity,
        subtotal
    });
    return subtotal;
};

export const calculateCartTotal = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        console.log('calculateCartTotal: no items', items);
        return 0;
    }
    
    const total = items.reduce((sum, item) => {
        const itemTotal = calculateItemSubtotal(item);
        console.log('calculateCartTotal: adding item', {
            item_title: item.book_title,
            itemTotal,
            runningSum: sum + itemTotal
        });
        return sum + itemTotal;
    }, 0);

    console.log('calculateCartTotal: final total', total);
    return total;
}; 