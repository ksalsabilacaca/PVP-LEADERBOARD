package id.zulfahmifjr.zombierush.game;

public enum EndReason {
    TIME_UP("Waktu Habis"),
    DEATH("Pemain Kalah"),
    QUIT("Pemain Keluar"),
    ADMIN_STOP("Dihentikan Admin"),
    PLUGIN_DISABLE("Plugin Dinonaktifkan");

    private final String displayName;

    EndReason(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }
}
