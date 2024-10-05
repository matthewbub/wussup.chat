class TestLogger {
  private passedTests: number = 0;
  private failedTests: number = 0;

  log(message: string): void {
    console.log(`  ${message}`);
  }

  logError(message: string): void {
    console.error(`    ❌ ${message}`);
    this.failedTests++;
  }

  logSuccess(message: string): void {
    console.log(`    ✅ ${message}`);
    this.passedTests++;
  }

  getTestResults(): { passed: number; failed: number; total: number } {
    return {
      passed: this.passedTests,
      failed: this.failedTests,
      total: this.passedTests + this.failedTests,
    };
  }

  resetTestCounters(): void {
    this.passedTests = 0;
    this.failedTests = 0;
  }
}

export const testLogger = new TestLogger();
export const log = testLogger.log.bind(testLogger);
export const logError = testLogger.logError.bind(testLogger);
export const logSuccess = testLogger.logSuccess.bind(testLogger);
export const getTestResults = testLogger.getTestResults.bind(testLogger);
export const resetTestCounters = testLogger.resetTestCounters.bind(testLogger);
