const webpush = require('web-push');
const prisma = require('../config/prisma');

// Configure web-push with VAPID keys
// Generate new keys using: npx web-push generate-vapid-keys
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.warn('⚠️ VAPID keys are missing! Push notifications will not work in production.');
}

webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:thecollabify1108@gmail.com',
    vapidKeys.publicKey || 'placeholder_public_key',
    vapidKeys.privateKey || 'placeholder_private_key'
);

class PushNotificationService {
    /**
     * Send push notification to a specific user
     */
    async sendToUser(userId, notification) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user || !user.pushSubscription) {
                console.log(`User ${userId} has no push subscription`);
                return { success: false, reason: 'no_subscription' };
            }

            const subscription = user.pushSubscription;

            const payload = JSON.stringify({
                title: notification.title,
                body: notification.body,
                icon: notification.icon || '/favicon.png',
                badge: notification.badge || '/favicon.png',
                data: notification.data || {},
                tag: notification.tag || 'thecollabify',
                requireInteraction: notification.requireInteraction || false
            });

            await webpush.sendNotification(subscription, payload);

            console.log(`✅ Push notification sent to user ${userId}`);
            return { success: true };

        } catch (error) {
            console.error(`Failed to send push notification to user ${userId}:`, error);

            // If subscription is no longer valid, remove it
            if (error.statusCode === 410 || error.statusCode === 404) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { pushSubscription: null }
                });
                console.log(`Removed invalid subscription for user ${userId}`);
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Send notification to multiple users
     */
    async sendToMultiple(userIds, notification) {
        const results = await Promise.allSettled(
            userIds.map(userId => this.sendToUser(userId, notification))
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        console.log(`Sent ${successful}/${results.length} push notifications (${failed} failed)`);

        return { successful, failed, total: results.length };
    }

    /**
     * Helper: Create notification for campaign application accepted
     */
    notifyCampaignAccepted(campaignTitle, campaignId) {
        return {
            title: '🎉 Application Accepted!',
            body: `Your application for "${campaignTitle}" was accepted!`,
            data: {
                type: 'campaign_accepted',
                campaignId,
                url: `/creator/dashboard?tab=applications`
            },
            requireInteraction: true
        };
    }

    /**
     * Helper: Create notification for campaign application rejected
     */
    notifyCampaignRejected(campaignTitle) {
        return {
            title: 'Application Update',
            body: `Your application for "${campaignTitle}" was not selected this time.`,
            data: {
                type: 'campaign_rejected',
                url: `/creator/dashboard?tab=opportunities`
            }
        };
    }

    /**
     * Helper: Create notification for new campaign match
     */
    notifyNewCampaign(campaignTitle, campaignId) {
        return {
            title: '🔥 New Campaign Match!',
            body: `New campaign "${campaignTitle}" matches your profile!`,
            data: {
                type: 'new_campaign',
                campaignId,
                url: `/creator/dashboard?tab=opportunities`
            },
            requireInteraction: true
        };
    }

    /**
     * Helper: Create notification for new application (seller)
     */
    notifyNewApplication(creatorName, campaignTitle, campaignId) {
        return {
            title: '📝 New Application',
            body: `${creatorName} applied to "${campaignTitle}"`,
            data: {
                type: 'new_application',
                campaignId,
                url: `/seller/dashboard?tab=requests`
            },
            requireInteraction: true
        };
    }

    /**
     * Helper: Create notification for new message
     */
    notifyNewMessage(senderName, conversationId) {
        return {
            title: '💬 New Message',
            body: `${senderName} sent you a message`,
            data: {
                type: 'new_message',
                conversationId,
                url: `/messages`
            }
        };
    }

    /**
     * Helper: Create notification for payment received
     */
    notifyPaymentReceived(amount, campaignTitle) {
        return {
            title: '💰 Payment Received',
            body: `₹${amount} received for "${campaignTitle}"`,
            data: {
                type: 'payment_received',
                url: `/creator/dashboard`
            },
            requireInteraction: true
        };
    }
}

module.exports = new PushNotificationService();
