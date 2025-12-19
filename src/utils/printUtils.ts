// src/utils/printUtils.ts

import { Order } from '@/types/pos';

/**
 * Gera o conteúdo formatado do recibo de venda.
 */
export function generateReceiptContent(order: Order, changeAmount: number, receivedAmount: number): string {
    let content = `--- RECIBO DE VENDA ---\n`;
    content += `Pedido #${order.id.toUpperCase()}\n`;
    content += `Data: ${order.createdAt.toLocaleDateString()} ${order.createdAt.toLocaleTimeString()}\n`;
    content += `------------------------\n`;
    
    order.items.forEach(item => {
        content += `${item.quantity}x ${item.productName} - R$ ${item.productPrice.toFixed(2).replace('.', ',')}\n`;
        if (item.notes) {
            content += `  - Obs: ${item.notes}\n`;
        }
    });
    
    content += `------------------------\n`;
    content += `Total: R$ ${order.total.toFixed(2).replace('.', ',')}\n`;
    content += `Pagamento: ${order.paymentMethod}\n`;
    
    if (order.paymentMethod === 'DINHEIRO') {
        content += `Recebido: R$ ${receivedAmount.toFixed(2).replace('.', ',')}\n`;
        content += `Troco: R$ ${changeAmount.toFixed(2).replace('.', ',')}\n`;
    }
    
    content += `------------------------\n`;
    content += `Obrigado!`;
    
    return content;
}

/**
 * Simula o envio de conteúdo para impressão (Recibo ou Cozinha).
 */
export function sendPrintRequest(content: string, type: 'receipt' | 'kitchen'): void {
    if (type === 'receipt') {
        console.log("Simulando envio de Recibo para Impressora:\n", content);
    } else if (type === 'kitchen') {
        // A lógica de Cozinha está atualmente no Caixa.tsx, mas a função é exportada
        console.log("Simulando envio de Pedido para Cozinha:\n", content);
    }
}