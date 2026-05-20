package id.zulfahmifjr.zombierush.game;

import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.potion.PotionEffect;

import java.util.Collection;

public class PlayerSnapshot {
    private final Location location;
    private final ItemStack[] contents;
    private final ItemStack[] armor;
    private final ItemStack offHand;
    private final GameMode gameMode;
    private final double health;
    private final int foodLevel;
    private final float saturation;
    private final float exp;
    private final int level;
    private final Collection<PotionEffect> effects;

    public PlayerSnapshot(Player player) {
        this.location = player.getLocation().clone();
        this.contents = player.getInventory().getContents();
        this.armor = player.getInventory().getArmorContents();
        this.offHand = player.getInventory().getItemInOffHand();
        this.gameMode = player.getGameMode();
        this.health = player.getHealth();
        this.foodLevel = player.getFoodLevel();
        this.saturation = player.getSaturation();
        this.exp = player.getExp();
        this.level = player.getLevel();
        this.effects = player.getActivePotionEffects();
    }

    public void restore(Player player, boolean restoreInventory) {
        if (restoreInventory) {
            player.getInventory().setContents(contents);
            player.getInventory().setArmorContents(armor);
            player.getInventory().setItemInOffHand(offHand);
        }
        player.setGameMode(gameMode);
        player.setFoodLevel(foodLevel);
        player.setSaturation(saturation);
        player.setExp(exp);
        player.setLevel(level);
        for (PotionEffect effect : player.getActivePotionEffects()) {
            player.removePotionEffect(effect.getType());
        }
        for (PotionEffect effect : effects) {
            player.addPotionEffect(effect);
        }
        double maxHealth = player.getAttribute(Attribute.GENERIC_MAX_HEALTH) == null ? 20.0D : player.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue();
        player.setHealth(Math.min(Math.max(1.0D, health), maxHealth));
    }

    public Location location() {
        return location.clone();
    }
}
