/**
 * AI Engine Scheduler
 * 
 * Runs AI engine background jobs on a schedule:
 * - Weekly (every 7 days): CQI computation, fraud detection, audience profiles, embeddings
 * - Monthly (every 30 days): Model retraining + weight optimization
 * 
 * Uses native setInterval (same approach as frictionScheduler — no extra dependency)
 */

const AIEngine = require('./aiEngine');

let weeklyInterval = null;
let monthlyInterval = null;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;   // 7 days
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days

/**
 * Run weekly AI jobs
 */
async function runWeeklyAIJobs() {
    const startedAt = new Date().toISOString();
    console.log(`[AIScheduler] Weekly jobs started at ${startedAt}`);
    try {
        const results = await AIEngine.runWeeklyJobs();
        console.log(`[AIScheduler] Weekly jobs completed:`, JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('[AIScheduler] Weekly jobs failed:', err.message);
    }
}

/**
 * Run monthly retraining
 */
async function runMonthlyRetrain() {
    const startedAt = new Date().toISOString();
    console.log(`[AIScheduler] Monthly retrain started at ${startedAt}`);
    try {
        const result = await AIEngine.runMonthlyRetrain();
        console.log(`[AIScheduler] Monthly retrain completed:`, JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('[AIScheduler] Monthly retrain failed:', err.message);
    }
}

/**
 * Start the AI scheduler
 * Weekly jobs run after 60s delay, monthly after 120s delay
 */
function startAIScheduler() {
    if (weeklyInterval) return; // Prevent duplicates

    console.log('[AIScheduler] Starting AI engine scheduler...');

    // Weekly: delay 60s then every 7 days
    setTimeout(runWeeklyAIJobs, 60 * 1000);
    weeklyInterval = setInterval(runWeeklyAIJobs, WEEK_MS);

    // Monthly: delay 120s then every 30 days
    setTimeout(runMonthlyRetrain, 120 * 1000);
    monthlyInterval = setInterval(runMonthlyRetrain, MONTH_MS);

    // Don't keep process alive for intervals
    if (weeklyInterval.unref) weeklyInterval.unref();
    if (monthlyInterval.unref) monthlyInterval.unref();

    console.log('[AIScheduler] Scheduled: weekly (7d), monthly retrain (30d)');
}

/**
 * Stop the AI scheduler (graceful shutdown)
 */
function stopAIScheduler() {
    if (weeklyInterval) {
        clearInterval(weeklyInterval);
        weeklyInterval = null;
    }
    if (monthlyInterval) {
        clearInterval(monthlyInterval);
        monthlyInterval = null;
    }
    console.log('[AIScheduler] Stopped');
}

module.exports = { startAIScheduler, stopAIScheduler };
