export const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'processing',
    'shipping',
    'delivered',
    'completed',
    'cancelled',
    'refunded',
];

export const getStatusLabel = (status) => {
    const labels = {
        pending:    'Chờ xác nhận',
        confirmed:  'Đã xác nhận',
        processing: 'Đang xử lý',
        shipping:   'Đang giao hàng',
        delivered:  'Đã giao hàng',
        completed:  'Hoàn thành',
        cancelled:  'Đã hủy',
        refunded:   'Hoàn tiền',
    };
    return labels[status] || status;
};

export const getStatusColor = (status) => {
    const colors = {
        pending:    'bg-yellow-100 text-yellow-700',
        confirmed:  'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        shipping:   'bg-purple-100 text-purple-700',
        delivered:  'bg-teal-100 text-teal-700',
        completed:  'bg-green-100 text-green-700',
        cancelled:  'bg-red-100 text-red-700',
        refunded:   'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
};

export const getPaymentStatusLabel = (status) => {
    return status === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán';
};

export const getPaymentStatusColor = (status) => {
    return status === 'paid'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700';
};