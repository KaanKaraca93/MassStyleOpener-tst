// Processing Lock Service - Prevents duplicate style creation for same DocLibId
class ProcessingLockService {
    constructor() {
        // Track currently processing DocLibIds (for 30 second window)
        this.processingLocks = new Map(); // DocLibId -> { startTime }
        
        // Track successfully completed DocLibIds (永久 until dyno restart)
        this.completedCache = new Set(); // Set of DocLibIds
    }

    /**
     * Check if processing is allowed for this DocLibId
     * @param {string|number} docLibId - The DocLibId to check
     * @returns {Object} { allowed: boolean, reason?: string, elapsed?: number }
     */
    startProcessing(docLibId) {
        const docLibIdStr = String(docLibId);

        // 1. Check if already completed (永久 cache until dyno restart)
        if (this.completedCache.has(docLibIdStr)) {
            console.log(`🚫 DocLibId ${docLibId} already created (in completed cache)`);
            return { 
                allowed: false, 
                reason: 'already_created',
                message: `Style already created for DocLibId ${docLibId}`
            };
        }

        // 2. Check if currently processing (30 second window)
        const lock = this.processingLocks.get(docLibIdStr);
        if (lock) {
            const elapsed = Date.now() - lock.startTime;
            
            if (elapsed < 30000) { // 30 seconds
                console.log(`🚫 DocLibId ${docLibId} is currently being processed (${elapsed}ms ago)`);
                return { 
                    allowed: false, 
                    reason: 'currently_processing',
                    elapsed: elapsed,
                    message: `Another request is currently processing DocLibId ${docLibId}`
                };
            }
            
            // If > 30s, allow retry (previous request may have failed/timeout)
            console.log(`⚠️  DocLibId ${docLibId} was processing but >30s elapsed, allowing retry`);
            this.processingLocks.delete(docLibIdStr);
        }

        // 3. Allow processing and set lock
        this.processingLocks.set(docLibIdStr, { startTime: Date.now() });
        console.log(`✅ Processing lock acquired for DocLibId ${docLibId}`);
        
        return { allowed: true };
    }

    /**
     * Mark DocLibId as successfully completed
     * @param {string|number} docLibId - The DocLibId that was processed
     */
    markCompleted(docLibId) {
        const docLibIdStr = String(docLibId);
        
        // Remove from processing locks
        this.processingLocks.delete(docLibIdStr);
        
        // Add to completed cache (永久 until dyno restart)
        this.completedCache.add(docLibIdStr);
        
        console.log(`✅ DocLibId ${docLibId} marked as completed and cached`);
    }

    /**
     * Mark DocLibId processing as failed (remove lock, don't cache)
     * @param {string|number} docLibId - The DocLibId that failed
     */
    markFailed(docLibId) {
        const docLibIdStr = String(docLibId);
        
        // Remove from processing locks only
        this.processingLocks.delete(docLibIdStr);
        
        console.log(`❌ DocLibId ${docLibId} processing failed, lock removed`);
    }

    /**
     * Get cache statistics
     * @returns {Object} Stats about locks and cache
     */
    getStats() {
        return {
            currentlyProcessing: this.processingLocks.size,
            completedCacheSize: this.completedCache.size,
            processingList: Array.from(this.processingLocks.keys()),
            completedList: Array.from(this.completedCache)
        };
    }

    /**
     * Clear all locks and cache (for testing/debugging)
     */
    clearAll() {
        this.processingLocks.clear();
        this.completedCache.clear();
        console.log('🧹 All locks and cache cleared');
    }
}

// Export singleton instance
module.exports = new ProcessingLockService();
