package id.zulfahmifjr.zombierush.npc;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.util.LocationUtil;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.World;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.ArmorStand;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.entity.Zombie;
import org.bukkit.inventory.ItemStack;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.scheduler.BukkitTask;

import java.util.Comparator;

public class JoinNpcManager {
    private final ZombieRushPlugin plugin;
    private Zombie npc;
    private ArmorStand hologramLine1;
    private ArmorStand hologramLine2;
    private ArmorStand hologramLine3;
    private BukkitTask faceTask;
    private static final double NPC_SCALE = 2.0;
    private static final double FACE_RADIUS = 16.0;

    public JoinNpcManager(ZombieRushPlugin plugin) {
        this.plugin = plugin;
    }

    public void spawnFromConfig() {
        if (!plugin.getConfig().getBoolean("npc.enabled", false))
            return;
        Location location = LocationUtil.load(plugin.getConfig(), "npc", true);
        if (location == null) {
            plugin.getLogger().warning("Lokasi NPC tidak valid. Silakan atur ulang dengan /zr npc set.");
            return;
        }
        spawn(location);
    }

    public void spawn(Location location) {
        remove();
        World world = location.getWorld();
        if (world == null)
            return;

        npc = world.spawn(location, Zombie.class, zombie -> {
            zombie.setAI(false);
            zombie.setInvulnerable(true);
            zombie.setSilent(true);
            zombie.setGravity(false);
            zombie.setCanPickupItems(false);
            zombie.setRemoveWhenFarAway(false);
            zombie.setPersistent(true);
            zombie.setAdult();
            zombie.setCustomName(ChatColor.RED + "Zombie Rush");
            zombie.setCustomNameVisible(true);
            zombie.getEquipment().setHelmet(new ItemStack(Material.NETHERITE_HELMET));
            zombie.getPersistentDataContainer().set(plugin.getJoinNpcKey(), PersistentDataType.STRING, "true");
            if (zombie.getAttribute(Attribute.GENERIC_SCALE) != null) {
                zombie.getAttribute(Attribute.GENERIC_SCALE).setBaseValue(NPC_SCALE);
            }
        });

        spawnHologram(location);
        startFacingTask(location);
    }

    private void spawnHologram(Location base) {
        hologramLine1 = spawnLine(base.clone().add(0, 2.85, 0),
                ChatColor.GREEN + "" + ChatColor.BOLD + "CLICK TO PLAY");
        hologramLine2 = spawnLine(base.clone().add(0, 2.55, 0), ChatColor.RED + "" + ChatColor.BOLD + "ZOMBIE RUSH");
        hologramLine3 = spawnLine(base.clone().add(0, 2.25, 0), ChatColor.GRAY + "Pukul atau klik zombie untuk mulai");
    }

    private ArmorStand spawnLine(Location loc, String text) {
        ArmorStand stand = loc.getWorld().spawn(loc, ArmorStand.class);
        stand.setInvisible(true);
        stand.setGravity(false);
        stand.setMarker(true);
        stand.setInvulnerable(true);
        stand.setCustomNameVisible(true);
        stand.setCustomName(text);
        stand.getPersistentDataContainer().set(plugin.getJoinNpcHologramKey(), PersistentDataType.STRING, "true");
        return stand;
    }

    private void startFacingTask(Location base) {
        if (faceTask != null)
            faceTask.cancel();
        faceTask = plugin.getServer().getScheduler().runTaskTimer(plugin, () -> {
            if (npc == null || npc.isDead())
                return;
            npc.setFireTicks(0);
            Player nearest = npc.getWorld().getNearbyPlayers(npc.getLocation(), FACE_RADIUS).stream()
                    .min(Comparator.comparingDouble(p -> p.getLocation().distanceSquared(npc.getLocation())))
                    .orElse(null);
            if (nearest == null)
                return;
            Location npcLoc = npc.getLocation();
            Location target = nearest.getLocation();
            npcLoc.setDirection(target.toVector().subtract(npcLoc.toVector()));
            npc.setRotation(npcLoc.getYaw(), npcLoc.getPitch());
        }, 20L, 20L);
    }

    public void remove() {
        if (faceTask != null) {
            faceTask.cancel();
            faceTask = null;
        }
        if (npc != null && !npc.isDead())
            npc.remove();
        npc = null;
        if (hologramLine1 != null && !hologramLine1.isDead())
            hologramLine1.remove();
        if (hologramLine2 != null && !hologramLine2.isDead())
            hologramLine2.remove();
        if (hologramLine3 != null && !hologramLine3.isDead())
            hologramLine3.remove();
        hologramLine1 = null;
        hologramLine2 = null;
        hologramLine3 = null;

        for (World world : plugin.getServer().getWorlds()) {
            for (Entity entity : world.getEntities()) {
                if (entity.getPersistentDataContainer().has(plugin.getJoinNpcKey(), PersistentDataType.STRING)
                        || entity.getPersistentDataContainer().has(plugin.getJoinNpcHologramKey(),
                                PersistentDataType.STRING)) {
                    entity.remove();
                }
            }
        }
    }

    public boolean isJoinNpc(Entity entity) {
        return entity != null
                && entity.getPersistentDataContainer().has(plugin.getJoinNpcKey(), PersistentDataType.STRING);
    }
}
