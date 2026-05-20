package id.zulfahmifjr.zombierush.util;

import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;

public final class LocationUtil {
    private LocationUtil() {}

    public static void save(FileConfiguration config, String path, Location location, boolean includeYawPitch) {
        config.set(path + ".world", location.getWorld().getName());
        config.set(path + ".x", location.getX());
        config.set(path + ".y", location.getY());
        config.set(path + ".z", location.getZ());
        if (includeYawPitch) {
            config.set(path + ".yaw", (double) location.getYaw());
            config.set(path + ".pitch", (double) location.getPitch());
        }
    }

    public static Location load(FileConfiguration config, String path, boolean includeYawPitch) {
        ConfigurationSection section = config.getConfigurationSection(path);
        if (section == null) return null;
        String worldName = section.getString("world");
        if (worldName == null || worldName.isBlank()) return null;
        World world = Bukkit.getWorld(worldName);
        if (world == null) return null;
        Location loc = new Location(
                world,
                section.getDouble("x"),
                section.getDouble("y"),
                section.getDouble("z")
        );
        if (includeYawPitch) {
            loc.setYaw((float) section.getDouble("yaw"));
            loc.setPitch((float) section.getDouble("pitch"));
        }
        return loc;
    }

    public static String shortString(Location loc) {
        if (loc == null || loc.getWorld() == null) return "belum diatur";
        return String.format("%s (x=%.1f, y=%.1f, z=%.1f)", loc.getWorld().getName(), loc.getX(), loc.getY(), loc.getZ());
    }
}
