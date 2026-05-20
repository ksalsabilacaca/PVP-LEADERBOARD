package id.zulfahmifjr.zombierush.game;

import java.time.Instant;
import java.util.UUID;

public record MatchResult(
        UUID playerId,
        String username,
        int score,
        int kills,
        int durationSeconds,
        EndReason endReason,
        Instant playedAt
) {
}
