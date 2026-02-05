const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Payment & Escrow Service
 * Handles customer creation, connect account management, and escrow sessions.
 */

class StripeService {
    /**
     * Create or retrieve Stripe Customer
     */
    async getOrCreateCustomer(user) {
        if (user.stripeCustomerId) {
            return user.stripeCustomerId;
        }

        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: user.id }
        });

        // Update user in DB (Caller should handle this or we inject prisma)
        return customer.id;
    }

    /**
     * Create Stripe Connect Account for Creator
     */
    async createConnectAccount(user) {
        if (user.stripeAccountId) {
            return user.stripeAccountId;
        }

        const account = await stripe.accounts.create({
            type: 'express', // Express is easier for onboarding
            country: 'IN', // Defaulting to India as per previous INR context
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            metadata: { userId: user.id }
        });

        return account.id;
    }

    /**
     * Generate Account Onboarding Link
     */
    async createAccountLink(accountId) {
        const link = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.FRONTEND_URL}/payment/onboarding-refresh`,
            return_url: `${process.env.FRONTEND_URL}/payment/onboarding-complete`,
            type: 'account_onboarding',
        });
        return link.url;
    }

    /**
     * Create Escrow Checkout Session
     * Seller pays, funds are held by platform until transfer
     */
    async createEscrowSession(amount, sellerId, creatorAccountId, metadata) {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: metadata.campaignTitle || 'Campaign Collaboration',
                        description: `Secure transaction for ${metadata.campaignTitle}`,
                    },
                    unit_amount: amount * 100, // Stripe uses cents/paise
                },
                quantity: 1,
            }],
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            metadata: {
                ...metadata,
                sellerId,
                creatorAccountId
            }
        });

        return session;
    }

    /**
     * Transfer funds to Creator (Escrow Release)
     */
    async releaseEscrow(paymentIntentId, creatorAccountId, amount) {
        // In Stripe Connect "Separate Charges and Transfers" or "Destination Charges"
        // This initiates the transfer of funds held by the platform
        const transfer = await stripe.transfers.create({
            amount: amount * 100,
            currency: 'inr',
            destination: creatorAccountId,
            source_transaction: paymentIntentId,
        });

        return transfer;
    }
}

module.exports = new StripeService();
