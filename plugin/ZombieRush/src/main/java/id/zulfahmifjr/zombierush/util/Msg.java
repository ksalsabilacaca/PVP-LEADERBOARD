package id.zulfahmifjr.zombierush.util;

import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.file.FileConfiguration;

public final class Msg {
    private Msg() {}

    public static String color(String text) {
        return ChatColor.translateAlternateColorCodes('&', text == null ? "" : text);
    }

    public static String prefix(FileConfiguration config) {
        return color(config.getString("settings.prefix", "&8[&cZombieRush&8] &r"));
    }

    public static void send(CommandSender sender, FileConfiguration config, String message) {
        sender.sendMessage(prefix(config) + color(message));
    }

    public static void success(CommandSender sender, FileConfiguration config, String message) {
        send(sender, config, "&a" + message);
    }

    public static void error(CommandSender sender, FileConfiguration config, String message) {
        send(sender, config, "&c" + message);
    }

    public static void warn(CommandSender sender, FileConfiguration config, String message) {
        send(sender, config, "&e" + message);
    }

    public static void info(CommandSender sender, FileConfiguration config, String message) {
        send(sender, config, "&b" + message);
    }
}
