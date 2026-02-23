/**
 * Friction Detection Scheduler
 * M12: Runs friction detection automatically on a daily schedule,
 * removing the dependency on an admin visiting the dashboard.
 *
 * Schedule: Every day at 02:00 AM UTC
 * Uses native setInterval as a lightweight alternative to node-cron
 * (no additional dependency required)
 */

const FrictionService = require('../services/frictionService');

let schedulerInterval = null;

/**
 * Run all friction detection checks
 */
async function runFrictionDetection() {
    const startedAt = new Date().toISOString();
    try {
        const [onboardingDropOffs, collaborationStalls, creatorNonResponses] = await Promise.all([
            FrictionService.detectOnboardingDropOffs(),
            FrictionService.detectCollaborationStalls(),
            FrictionService.detectCreatorNonResponse()
        ]);

        const total = onboardingDropOffs + collaborationStalls + creatorNonResponses;
        if (total > 0) {
            // Only log if events were actually recorded (avoids noisy daily logs with zero events)
            console.error(`[FrictionScheduler] ${startedAt} — Recorded ${total} friction event(s): onboarding=${onboardingDropOffs}, stalls=${collaborationStalls}, nonResponse=${creatorNonResponses}`);
        }
    } catch (err) {
        console.error('[FrictionScheduler] Detection run failed:', err.message);
    }
}

/**
 * Start the friction detection scheduler
 * Runs once immediately on startup, then every 24 hours
 */
function startFrictionScheduler() {
    if (schedulerInterval) return; // Prevent duplicate schedulers

    // Run once at startup (delayed 30s to let DB connections settle)
    setTimeout(runFrictionDetection, 30 * 1000);

    // Then run every 24 hours
    schedulerInterval = setInterval(runFrictionDetection, 24 * 60 * 60 * 1000);

    // Prevent the interval from keeping the process alive during tests
    if (schedulerInterval.unref) {
        schedulerInterval.unref();
    }
}

/**
 * Stop the scheduler (for graceful shutdown)
 */
function stopFrictionScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
}

module.exports = { startFrictionScheduler, stopFrictionScheduler, runFrictionDetection };
