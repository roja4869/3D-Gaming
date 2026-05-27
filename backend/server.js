const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory (one level up)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Ensure data folder exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON file or return empty array
function readDataFile(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content || '[]');
    } catch (e) {
        console.error(`Error reading ${filename}:`, e);
        return [];
    }
}

// Helper to write JSON file safely
function writeDataFile(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filename}:`, e);
        return false;
    }
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

/**
 * POST /api/contact
 * Handles Operative signature transmissions/messages
 */
app.post('/api/contact', (req, res) => {
    const { username, email, message } = req.body;

    // Validation checks
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid signature. Operative name must be at least 3 characters.' 
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid email address syntax for neural mail link.' 
        });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
        return res.status(400).json({ 
            success: false, 
            error: 'Transmission body is too short. Minimum 10 characters required.' 
        });
    }

    // Persist to transmissions.json
    const transmissions = readDataFile('transmissions.json');
    const newTransmission = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        username: username.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString()
    };

    transmissions.push(newTransmission);
    if (writeDataFile('transmissions.json', transmissions)) {
        console.log(`[SYS] Transmission received from Operative ${username.toUpperCase()} (${newTransmission.id})`);
        return res.json({ 
            success: true, 
            message: `Transmission securely sent to core node nexus-hq from operative ${username.toUpperCase()}.` 
        });
    } else {
        return res.status(500).json({ 
            success: false, 
            error: 'Core database write failure. Please retry transmission sequence.' 
        });
    }
});

/**
 * POST /api/checkout
 * Handles checkout payment transaction mapping
 */
app.post('/api/checkout', (req, res) => {
    const { items, subtotal, tax, total, paymentMethod, paymentDetails } = req.body;

    // Validation checks
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            success: false, 
            error: 'Transaction aborted. Shopping cart is vacant.' 
        });
    }

    if (!total || typeof total !== 'number' || total <= 0) {
        return res.status(400).json({ 
            success: false, 
            error: 'Transaction aborted. Pricing matrix sum validation failed.' 
        });
    }

    const validMethods = ['card', 'paypal', 'crypto'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Transaction aborted. Unsupported neural link payment method.' 
        });
    }

    // Additional payment detail validation based on method
    if (paymentMethod === 'card') {
        const { number, name, expiry, cvv } = paymentDetails || {};
        if (!number || number.replace(/\s/g, '').length < 13 || !name || !expiry || !cvv || cvv.length < 3) {
            return res.status(400).json({ 
                success: false, 
                error: 'Billing credentials validation failed. Re-enter authorization sequence.' 
            });
        }
    }

    // Persist to orders.json
    const orders = readDataFile('orders.json');
    const newOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
        timestamp: new Date().toISOString()
    };

    // Mask card details before saving if method is credit card
    if (paymentMethod === 'card') {
        const cleanNum = paymentDetails.number.replace(/\s/g, '');
        newOrder.maskedCard = `•••• •••• •••• ${cleanNum.slice(-4)}`;
        newOrder.cardHolderName = paymentDetails.name;
    }

    orders.push(newOrder);
    if (writeDataFile('orders.json', orders)) {
        console.log(`[SYS] Transaction completed (${newOrder.id}) total $${total.toFixed(2)} via ${paymentMethod.toUpperCase()}`);
        
        let successMessage = "Neural link authorized. Your cart has been verified and items assigned to your network ID.";
        if (paymentMethod === 'paypal') {
            successMessage = "Verification tokens generated. Check your background terminal layers for payment confirmation.";
        } else if (paymentMethod === 'crypto') {
            successMessage = "Awaiting confirmation of SOL/BTC block transfer on the Solana/Bitcoin blockchain ledger nodes.";
        }

        return res.json({ 
            success: true, 
            message: successMessage,
            orderId: newOrder.id
        });
    } else {
        return res.status(500).json({ 
            success: false, 
            error: 'Order logging write failure. Please retry transaction sequence.' 
        });
    }
});

// Default route redirect to home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log('   _  _  ____  _____     _  _  ____  _  _  _  _  ___  ');
    console.log('  ( \\( )(  __)(  _  )___( \\( )(  __)( \\/ )( )( )(  __) ');
    console.log('   )  (  ) _)  )(_)((___))  (  ) _)  )  (  )()(  \\ _   ');
    console.log('  (_)\\_)(____)(_____)   (_)\\_)(____)(_/\\_)\\____)(___/  ');
    console.log('======================================================');
    console.log(`>> MATRIX SERVER INITIALIZED AND SECURED`);
    console.log(`>> PORT: ${PORT}`);
    console.log(`>> LOCAL HOST: http://localhost:${PORT}`);
    console.log('======================================================\n');
});
