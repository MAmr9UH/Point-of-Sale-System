import { 
    getOrdersByStatus, 
    acceptOrder, 
    completeOrder, 
    cancelOrder,
    updateOrderItemStatus 
} from '../model/Order.js';

/**
 * Handle employee order management routes
 */
export const handleOrderRoutes = async (req, res) => {
    const { method, url } = req;
    const urlParts = url.split('?');
    const path = urlParts[0];
    const queryString = urlParts[1];

    try {
        // GET /api/orders/live - Get pending and in-progress orders
        if (method === 'GET' && path === '/api/orders/live') {
            const orders = await getOrdersByStatus(['pending', 'in_progress']);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(orders));
            return;
        }

        // GET /api/orders/past - Get completed, cancelled, and refunded orders
        // Supports optional query parameters: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
        if (method === 'GET' && path === '/api/orders/past') {
            let startDate = null;
            let endDate = null;

            if (queryString) {
                const params = new URLSearchParams(queryString);
                if (params.has('startDate')) {
                    startDate = new Date(params.get('startDate'));
                }
                if (params.has('endDate')) {
                    endDate = new Date(params.get('endDate'));
                    // Set to end of day
                    endDate.setHours(23, 59, 59, 999);
                }
            }

            const orders = await getOrdersByStatus(
                ['completed', 'cancelled', 'refunded'],
                startDate,
                endDate
            );
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(orders));
            return;
        }

        // PUT /api/orders/:id/accept - Accept a pending order
        if (method === 'PUT' && path.match(/^\/api\/orders\/\d+\/accept$/)) {
            const orderId = parseInt(path.split('/')[3]);
            
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const { staffId } = JSON.parse(body);
                    await acceptOrder(orderId, staffId);
                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Order accepted successfully' 
                    }));
                } catch (error) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
            return;
        }

        // PUT /api/orders/:id/complete - Complete an order
        if (method === 'PUT' && path.match(/^\/api\/orders\/\d+\/complete$/)) {
            const orderId = parseInt(path.split('/')[3]);
            
            await completeOrder(orderId);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Order completed successfully' 
            }));
            return;
        }

        // PUT /api/orders/:id/cancel - Cancel an order
        if (method === 'PUT' && path.match(/^\/api\/orders\/\d+\/cancel$/)) {
            const orderId = parseInt(path.split('/')[3]);
            
            await cancelOrder(orderId);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Order cancelled successfully' 
            }));
            return;
        }

        // PUT /api/order-items/:id/status - Update order item status
        if (method === 'PUT' && path.match(/^\/api\/order-items\/\d+\/status$/)) {
            const orderItemId = parseInt(path.split('/')[3]);
            
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const { status } = JSON.parse(body);
                    
                    if (!status) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ 
                            error: 'Status is required' 
                        }));
                        return;
                    }
                    
                    await updateOrderItemStatus(orderItemId, status);
                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Order item status updated successfully' 
                    }));
                } catch (error) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                        error: 'Failed to update order item status', 
                        details: error.message 
                    }));
                }
            });
            return;
        }

        // Route not found
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            error: 'Route not found' 
        }));

    } catch (error) {
        console.error('Order routes error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            error: 'Internal server error', 
            details: error.message 
        }));
    }
};
