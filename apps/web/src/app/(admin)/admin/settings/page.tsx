import TwoFactorSetup from "@/components/admin/TwoFactorSetup";
import PasskeyManager from "@/components/admin/PasskeyManager";
import TelegramBroadcastPanel from "@/components/admin/TelegramBroadcastPanel";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
    title: "Admin Settings | FresherFlow",
    description: "Manage admin account settings and security."
};

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Admin settings</h1>
                <p className="text-muted-foreground">
                    Manage security, notifications, and account preferences.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Security Section */}
                <div className="space-y-6 md:col-span-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold">Security</h2>
                            <Badge variant="outline" className="border-green-500/50 text-green-500 text-[10px] tracking-wider font-bold">ACTIVE</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground w-full max-w-lg">
                            FresherFlow uses passkeys and TOTP for secure access.
                            Add multiple devices as backups.
                        </p>
                    </div>

                    <TwoFactorSetup />
                    <PasskeyManager />
                </div>
            </div>

            {/* Telegram Info Section (Read-only for now) */}
            <div className="bg-card border rounded-lg p-6 mt-8 max-w-xl">
                <h3 className="font-semibold mb-2">Telegram alerts</h3>
                <p className="text-sm text-muted-foreground">
                    System alerts and notifications are routed to the configured Telegram bot.
                    <br />
                    To update the connected chat, please change the <code>TELEGRAM_ADMIN_CHAT_ID</code> environment variable.
                </p>
            </div>

            <TelegramBroadcastPanel />
        </div>
    );
}
