package id.zulfahmifjr.zombierush.leaderboard;

import id.zulfahmifjr.zombierush.game.MatchResult;

import java.util.List;
import java.util.UUID;

public interface LeaderboardService {
    RecordOutcome record(MatchResult result);
    List<LeaderboardEntry> topBest(int limit);
    void reset(UUID uuid);
    boolean isRedisEnabled();
    boolean isRedisConnected();
    String statusText();
}
