package id.zulfahmifjr.zombierush.arena;

import org.bukkit.Location;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Arena {
    private final int id;
    private final Location center;
    private final Location playerSpawn;
    private final List<Location> zombieSpawns;
    private ArenaStatus status = ArenaStatus.AVAILABLE;
    private UUID currentPlayer;

    public Arena(int id, Location center, Location playerSpawn, List<Location> zombieSpawns) {
        this.id = id;
        this.center = center;
        this.playerSpawn = playerSpawn;
        this.zombieSpawns = new ArrayList<>(zombieSpawns);
    }

    public int id() {
        return id;
    }

    public Location center() {
        return center.clone();
    }

    public Location playerSpawn() {
        return playerSpawn.clone();
    }

    public List<Location> zombieSpawns() {
        return zombieSpawns.stream().map(Location::clone).toList();
    }

    public ArenaStatus status() {
        return status;
    }

    public void status(ArenaStatus status) {
        this.status = status;
    }

    public UUID currentPlayer() {
        return currentPlayer;
    }

    public void currentPlayer(UUID currentPlayer) {
        this.currentPlayer = currentPlayer;
    }
}
