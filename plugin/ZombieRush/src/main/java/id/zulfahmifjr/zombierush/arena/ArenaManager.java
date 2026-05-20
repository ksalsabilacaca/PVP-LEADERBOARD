package id.zulfahmifjr.zombierush.arena;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import org.bukkit.*;
import org.bukkit.block.Block;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Item;
import org.bukkit.entity.Projectile;
import org.bukkit.entity.Zombie;

import java.util.*;

public class ArenaManager {
    private final ZombieRushPlugin plugin;
    private final Map<Integer, Arena> arenas = new LinkedHashMap<>();

    public ArenaManager(ZombieRushPlugin plugin) {
        this.plugin = plugin;
    }

    public void setupWorldAndArenas(boolean rebuild) {
        World world = loadOrCreateWorld();
        if (world == null) {
            plugin.getLogger().warning("World arena tidak dapat dibuat atau dimuat.");
            return;
        }

        world.setGameRule(GameRule.DO_MOB_SPAWNING, false);
        world.setGameRule(GameRule.DO_DAYLIGHT_CYCLE, false);
        world.setGameRule(GameRule.DO_WEATHER_CYCLE, false);
        world.setGameRule(GameRule.MOB_GRIEFING, false);
        world.setTime(18000L);
        world.setStorm(false);
        world.setDifficulty(Difficulty.NORMAL);

        int count = plugin.getConfig().getInt("world.arena-count", 5);
        for (int i = 1; i <= count; i++) {
            int centerX = (i - 1) * plugin.getConfig().getInt("world.arena-spacing", 200);
            Arena arena = createArenaData(world, i, centerX);
            arenas.put(i, arena);
            if (rebuild || !plugin.getConfig().getBoolean("arenas." + i + ".built", false)) {
                buildArena(arena);
                plugin.getConfig().set("arenas." + i + ".built", true);
            }
        }
        plugin.saveConfig();
    }

    public World loadOrCreateWorld() {
        String worldName = plugin.getConfig().getString("world.name", "world_zombie_rush");
        World world = Bukkit.getWorld(worldName);
        if (world != null)
            return world;

        WorldCreator creator = new WorldCreator(worldName);
        creator.environment(World.Environment.NORMAL);
        creator.type(WorldType.FLAT);
        creator.generateStructures(false);
        return Bukkit.createWorld(creator);
    }

    private Arena createArenaData(World world, int id, int centerX) {
        int y = plugin.getConfig().getInt("world.arena-y", 80);
        Location center = new Location(world, centerX, y, 0, 0f, 0f);
        Location playerSpawn = new Location(world, centerX + 0.5, y + 1, 0.5, 0f, 0f);
        int spawnOffset = Math.max(8, plugin.getConfig().getInt("world.arena-radius", 25) - 5);
        List<Location> zombieSpawns = List.of(
                new Location(world, centerX + spawnOffset + 0.5, y + 1, 0.5),
                new Location(world, centerX - spawnOffset + 0.5, y + 1, 0.5),
                new Location(world, centerX + 0.5, y + 1, spawnOffset + 0.5),
                new Location(world, centerX + 0.5, y + 1, -spawnOffset + 0.5));
        return new Arena(id, center, playerSpawn, zombieSpawns);
    }

    public void rebuildArena(int arenaId) {
        Arena arena = arenas.get(arenaId);
        if (arena == null) {
            World world = loadOrCreateWorld();
            if (world == null)
                return;
            int centerX = (arenaId - 1) * plugin.getConfig().getInt("world.arena-spacing", 200);
            arena = createArenaData(world, arenaId, centerX);
            arenas.put(arenaId, arena);
        }
        buildArena(arena);
        plugin.getConfig().set("arenas." + arenaId + ".built", true);
        plugin.saveConfig();
    }

    public void buildArena(Arena arena) {
        World world = arena.center().getWorld();
        if (world == null)
            return;

        int radius = plugin.getConfig().getInt("world.arena-radius", 25);
        int wallHeight = plugin.getConfig().getInt("world.wall-height", 5);
        int y = arena.center().getBlockY();
        int centerX = arena.center().getBlockX();
        int centerZ = arena.center().getBlockZ();

        // Clear area
        for (int x = centerX - radius - 2; x <= centerX + radius + 2; x++) {
            for (int z = centerZ - radius - 2; z <= centerZ + radius + 2; z++) {
                for (int yy = y + 1; yy <= y + wallHeight + 7; yy++) {
                    world.getBlockAt(x, yy, z).setType(Material.AIR, false);
                }
            }
        }

        // Floor and boundary
        for (int x = centerX - radius; x <= centerX + radius; x++) {
            for (int z = centerZ - radius; z <= centerZ + radius; z++) {
                boolean border = x == centerX - radius || x == centerX + radius || z == centerZ - radius
                        || z == centerZ + radius;
                Block floor = world.getBlockAt(x, y, z);
                floor.setType(border ? Material.POLISHED_BLACKSTONE_BRICKS : Material.POLISHED_DEEPSLATE, false);

                if (border) {
                    for (int yy = y + 1; yy <= y + wallHeight; yy++) {
                        world.getBlockAt(x, yy, z).setType(Material.POLISHED_BLACKSTONE_BRICKS, false);
                    }
                }
            }
        }

        // Lighting and markers
        int[][] lampOffsets = new int[][] { { 0, 0 }, { radius - 4, radius - 4 }, { -(radius - 4), radius - 4 },
                { radius - 4, -(radius - 4) }, { -(radius - 4), -(radius - 4) } };
        for (int[] offset : lampOffsets) {
            int x = centerX + offset[0];
            int z = centerZ + offset[1];
            world.getBlockAt(x, y + 1, z).setType(Material.SEA_LANTERN, false);
        }

        world.getBlockAt(centerX, y + 1, centerZ).setType(Material.AIR, false);
        world.getBlockAt(centerX, y + 2, centerZ).setType(Material.AIR, false);
        world.getBlockAt(centerX, y + 3, centerZ).setType(Material.AIR, false);

        // Label arena number using simple blocks near entrance.
        for (int x = centerX - 2; x <= centerX + 2; x++) {
            world.getBlockAt(x, y + 1, centerZ - radius).setType(Material.GOLD_BLOCK, false);
        }

        cleanupArena(arena, false);
        arena.status(ArenaStatus.AVAILABLE);
        arena.currentPlayer(null);
    }

    public Optional<Arena> findAvailableArena() {
        return arenas.values().stream()
                .filter(arena -> arena.status() == ArenaStatus.AVAILABLE)
                .findFirst();
    }

    public Arena getArena(int id) {
        return arenas.get(id);
    }

    public Collection<Arena> arenas() {
        return Collections.unmodifiableCollection(arenas.values());
    }

    public void markInUse(Arena arena, UUID playerId) {
        arena.status(ArenaStatus.IN_USE);
        arena.currentPlayer(playerId);
    }

    public void release(Arena arena) {
        arena.status(ArenaStatus.CLEANING);
        cleanupArena(arena, true);
        arena.currentPlayer(null);
        arena.status(ArenaStatus.AVAILABLE);
    }

    public void cleanupArena(Arena arena, boolean removeDrops) {
        Location center = arena.center();
        World world = center.getWorld();
        if (world == null)
            return;
        int radius = plugin.getConfig().getInt("world.arena-radius", 25) + 6;

        for (Entity entity : world.getNearbyEntities(center, radius, 20, radius)) {
            if (entity instanceof Zombie zombie) {
                if (plugin.isArenaZombie(zombie)) {
                    zombie.remove();
                }
                continue;
            }
            if (removeDrops && (entity instanceof Item || entity instanceof Projectile)) {
                entity.remove();
            }
        }
    }
}
