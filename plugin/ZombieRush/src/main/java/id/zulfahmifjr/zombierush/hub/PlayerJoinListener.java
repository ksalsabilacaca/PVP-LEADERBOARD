package id.zulfahmifjr.zombierush.hub;

import id.zulfahmifjr.zombierush.util.Msg;
import org.bukkit.GameMode;
import org.bukkit.Material;
import org.bukkit.World;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.inventory.ItemStack;

public class PlayerJoinListener implements Listener {
    private final HubManager hubManager;

    public PlayerJoinListener(HubManager hubManager) {
        this.hubManager = hubManager;
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        event.setJoinMessage(Msg.color("&aSelamat datang, &f" + player.getName()
                + "&a! Selamat bermain di ZombieRush."));
        if (!hubManager.isTeleportOnJoinEnabled())
            return;
        World hub = hubManager.getHubWorld();
        if (hub == null)
            return;

        player.teleport(hub.getSpawnLocation());
        player.setGameMode(GameMode.ADVENTURE);
        player.getInventory().clear();
        player.getInventory().setArmorContents(null);
        player.getInventory().setItemInOffHand(new ItemStack(Material.AIR));
        double maxHealth = player.getAttribute(Attribute.GENERIC_MAX_HEALTH) == null
                ? 20.0D
                : player.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue();
        player.setHealth(maxHealth);
        player.setFoodLevel(20);
        player.setSaturation(20f);
        player.setFireTicks(0);

        if (hubManager.isJoinTitleEnabled()) {
            String title = Msg.color(hubManager.getJoinTitle());
            String subtitle = Msg.color(hubManager.getJoinSubtitle());
            player.sendTitle(title, subtitle, hubManager.getTitleFadeIn(), hubManager.getTitleStay(),
                    hubManager.getTitleFadeOut());
        }
    }
}
