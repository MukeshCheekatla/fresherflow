import TelegramBroadcastPanel from "@/components/admin/TelegramBroadcastPanel";

export const metadata = {
    title: "Telegram | FresherFlow Admin",
    description: "Monitor Telegram channel broadcasts and retry failed posts."
};

export default function AdminTelegramPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Telegram</h1>
                <p className="text-muted-foreground">
                    Channel posting status, failures, and retry controls.
                </p>
            </div>

            <div className="bg-card border rounded-lg p-5 max-w-3xl">
                <p className="text-sm text-muted-foreground">
                    Admin alerts use <code>TELEGRAM_ADMIN_CHAT_ID</code>. Public job posts use <code>TELEGRAM_PUBLIC_CHANNEL</code>.
                </p>
            </div>

            <TelegramBroadcastPanel />
        </div>
    );
}
