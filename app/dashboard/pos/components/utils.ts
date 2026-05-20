import { toast } from "react-hot-toast"

export const calculateCRC16 = (str: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        let x = ((crc >> 8) ^ str.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export const isDrinkItem = (item: any) => {
    const name = (item.product_name || "").toLowerCase()
    const catName = (item.category_name || "").toLowerCase()
    const drinkKeywords = [
        "coffee", "drink", "beverage", "tea", "juice", "soda", "milk", "water", 
        "beer", "wine", "smoothie", "latte", "espresso", "cappuccino", "macchiato", 
        "mocha", "matcha", "shake", "late", "កាហ្វេ", "តែ", "ទឹក"
    ]
    return drinkKeywords.some(keyword => name.includes(keyword) || catName.includes(keyword))
}

export const printReceipt = (order: any, change: number = 0, slipType: 'cashier' | 'kitchen' | 'bar' = 'cashier') => {
    // Filter items based on slipType
    let filteredItems = order.items;
    if (slipType === 'kitchen') {
        filteredItems = order.items.filter((item: any) => !isDrinkItem(item));
        if (filteredItems.length === 0) return;
    } else if (slipType === 'bar') {
        filteredItems = order.items.filter((item: any) => isDrinkItem(item));
        if (filteredItems.length === 0) return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        toast.error(`Failed to open print window for ${slipType}`);
        return;
    }
    
    const logoUrl = typeof window !== 'undefined' ? window.location.origin + "/logo.png" : "";

    const itemsHtml = filteredItems.map((item: any) => `
        <tr>
            <td style="padding: 3px 0; font-size: 11px; font-family: monospace; line-height: 1.3;">
                <strong>${item.quantity}x</strong> ${item.product_name}
                ${item.size_name ? `<br/><span style="color: #444; font-size: 9px;">(${item.size_name})</span>` : ""}
            </td>
            ${slipType === 'cashier' ? `
            <td style="text-align: right; padding: 3px 0; font-size: 11px; font-family: monospace; vertical-align: top;">
                $${(item.quantity * item.price).toFixed(2)}
            </td>
            ` : ''}
        </tr>
    `).join("");

    const isFinancial = slipType === 'cashier';

    const receiptHtml = `
        <html>
        <head>
            <title>Receipt #${order.id}</title>
            <style>
                @page {
                    size: auto;
                    margin: 0mm;
                }
                @media print {
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: #fff;
                    }
                    body {
                        width: 80mm;
                        padding: 8mm 6mm;
                        box-sizing: border-box;
                    }
                }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    color: #000;
                    margin: 0 auto;
                    padding: 15px 12px;
                    max-width: 290px;
                    background: #fff;
                    font-size: 11px;
                    line-height: 1.4;
                }
                .text-center { text-align: center; }
                .header { margin-bottom: 10px; }
                .logo-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .logo-text { font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-top: 5px; }
                .divider { border-top: 1px dashed #000; margin: 8px 0; height: 0; }
                table { width: 100%; border-collapse: collapse; }
                .total-row { font-weight: bold; }
                .footer { margin-top: 20px; font-size: 9.5px; color: #333; line-height: 1.4; }
            </style>
        </head>
        <body>
            <div class="text-center header">
                <div class="logo-container">
                    ${isFinancial ? `
                    <!-- Brand PNG Logo -->
                    <img src="${logoUrl}" style="width: 75px; height: 75px; object-fit: contain; display: block; margin: 0 auto;" alt="Live Cafe Logo" />
                    <div class="logo-text">LIVE CAFE</div>
                    ` : `
                    <div style="font-size: 15px; font-weight: bold; border: 2px solid #000; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">
                        ${slipType === 'kitchen' ? 'KITCHEN ORDER' : 'BAR ORDER'}
                    </div>
                    `}
                </div>
                <div style="font-size: 10px; margin-top: 2px; font-weight: bold; letter-spacing: 1.5px;">*** ${isFinancial ? 'RECEIPT' : 'PREP SLIP'} ***</div>
                ${isFinancial ? `<div style="font-size: 9px; color: #222; margin-top: 4px;">123 Café Street, Phnom Penh</div>` : ''}
            </div>
            
            <div style="font-size: 10.5px; line-height: 1.4; font-family: monospace;">
                <strong>Order ID:</strong> #${order.id}<br/>
                <strong>Date:</strong> ${new Date().toLocaleString()}<br/>
                <strong>Type:</strong> ${order.type === 'dine_in' ? 'DINE IN' : 'TAKEAWAY'}<br/>
                ${order.table_number ? `<strong>Table:</strong> ${order.table_number}<br/>` : ''}
            </div>
            
            <div class="divider"></div>
            
            <table>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            ${isFinancial ? `
            <div class="divider"></div>
            
            <table style="font-size: 10.5px; line-height: 1.45; font-family: monospace;">
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tax:</td>
                    <td style="text-align: right;">$${order.tax.toFixed(2)}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                    <td>Discount:</td>
                    <td style="text-align: right;">-$${order.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row" style="font-size: 12.5px;">
                    <td>TOTAL USD:</td>
                    <td style="text-align: right;">$${order.total.toFixed(2)}</td>
                </tr>
                <tr class="total-row" style="font-size: 11.5px; color: #222;">
                    <td>TOTAL KHR:</td>
                    <td style="text-align: right;">${(order.total * 4000).toLocaleString()} ៛</td>
                </tr>
            </table>
            
            <div class="divider"></div>
            
            <table style="font-size: 10.5px; line-height: 1.45; font-family: monospace;">
                <tr>
                    <td>Payment:</td>
                    <td style="text-align: right; text-transform: uppercase;">${order.payment_method}</td>
                </tr>
                <tr>
                    <td>Paid Amount:</td>
                    <td style="text-align: right;">$${order.paid_amount.toFixed(2)}</td>
                </tr>
                ${change > 0 ? `
                <tr>
                    <td>Change USD:</td>
                    <td style="text-align: right;">$${change.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Change KHR:</td>
                    <td style="text-align: right;">${(change * 4000).toLocaleString()} ៛</td>
                </tr>
                ` : ''}
            </table>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="text-center footer">
                ${isFinancial ? `
                ${order.qr_code_url ? `
                <div style="margin: 12px auto 8px; width: 125px; height: 125px; position: relative;">
                    <img src="${order.qr_code_url}" style="width: 100%; height: 100%; object-fit: contain;" />
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; background: white; border-radius: 50%; padding: 1.5px; box-shadow: 0 1.5px 3px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;">
                        <div style="width: 100%; height: 100%; background-color: #d32f2f; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 7px; font-family: sans-serif; letter-spacing: 0.5px;">ABA</div>
                    </div>
                </div>
                <div style="font-size: 8.5px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; color: #222; text-align: center; font-family: sans-serif;">
                    Scan to Pay with KHQR
                </div>
                ` : ''}
                Thank you for dining with us!<br/>
                Please come again soon.
                ` : `
                * FOR PREPARATION ONLY *<br/>
                Ensure prompt prep & served time.
                `}
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                }
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
}
