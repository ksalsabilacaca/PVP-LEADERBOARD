package id.zulfahmifjr.zombierush.integration;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.game.MatchResult;
import org.bukkit.Bukkit;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class ZombieRushApiClient {
    private final ZombieRushPlugin plugin;
    private final HttpClient httpClient;
    private boolean warnedMissingBaseUrl;

    public ZombieRushApiClient(ZombieRushPlugin plugin) {
        this.plugin = plugin;
        this.httpClient = HttpClient.newHttpClient();
        this.warnedMissingBaseUrl = false;
    }

    public void sendMatchResult(MatchResult result) {
        if (result == null)
            return;
        if (!isEnabled())
            return;

        String baseUrl = plugin.getConfig().getString("integration.zombierush-api.base-url", "");
        if (baseUrl == null || baseUrl.isBlank()) {
            if (!warnedMissingBaseUrl) {
                plugin.getLogger().warning("Base URL backend ZombieRush belum diatur di config.yml.");
                warnedMissingBaseUrl = true;
            }
            return;
        }

        String endpoint = normalizeBaseUrl(baseUrl) + "/api/zombierush/match-result";
        String apiKey = plugin.getConfig().getString("integration.zombierush-api.api-key", "");
        int timeoutMs = plugin.getConfig().getInt("integration.zombierush-api.timeout-ms", 5000);

        String payload = buildPayload(result);

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                HttpRequest.Builder builder = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .timeout(Duration.ofMillis(timeoutMs))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload));

                if (apiKey != null && !apiKey.isBlank()) {
                    builder.header("X-Api-Key", apiKey);
                }

                HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 300) {
                    plugin.getLogger().warning("Backend ZombieRush merespons status " + response.statusCode()
                            + " saat menyimpan match result.");
                }
            } catch (Exception e) {
                plugin.getLogger().warning("Gagal mengirim data match ke backend ZombieRush: " + e.getMessage());
            }
        });
    }

    private boolean isEnabled() {
        return plugin.getConfig().getBoolean("integration.zombierush-api.enabled", false);
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (baseUrl.endsWith("/")) {
            return baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }

    private String buildPayload(MatchResult result) {
        return "{" +
                "\"uuid\":\"" + escapeJson(result.playerId().toString()) + "\"," +
                "\"playerName\":\"" + escapeJson(result.username()) + "\"," +
                "\"score\":" + result.score() + "," +
                "\"kills\":" + result.kills() + "," +
                "\"durationSeconds\":" + result.durationSeconds() + "," +
                "\"endReason\":\"" + escapeJson(result.endReason().name()) + "\"," +
                "\"playedAt\":\"" + escapeJson(result.playedAt().toString()) + "\"" +
                "}";
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
