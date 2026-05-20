package id.zulfahmifjr.zombierush.listener;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class PlacementManager {
    private final Map<UUID, PlacementMode> modes = new HashMap<>();

    public void set(UUID uuid, PlacementMode mode) {
        modes.put(uuid, mode);
    }

    public PlacementMode get(UUID uuid) {
        return modes.get(uuid);
    }

    public void remove(UUID uuid) {
        modes.remove(uuid);
    }

    public boolean has(UUID uuid) {
        return modes.containsKey(uuid);
    }
}
