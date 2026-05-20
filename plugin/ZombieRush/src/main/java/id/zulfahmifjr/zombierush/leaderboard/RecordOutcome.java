package id.zulfahmifjr.zombierush.leaderboard;

public record RecordOutcome(
        boolean success,
        boolean redisUsed,
        boolean newBestScore,
        long elapsedNanos,
        String message
) {
    public double elapsedMillis() {
        return elapsedNanos / 1_000_000.0;
    }
}
