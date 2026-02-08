"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

type BroadcastStatus = "SENT" | "FAILED" | "SKIPPED";

type BroadcastItem = {
    id: string;
    status: BroadcastStatus;
    channel: string;
    errorMessage: string | null;
    sentAt: string | null;
    createdAt: string;
    opportunity: {
        title: string;
        company: string;
    } | null;
};

export default function TelegramBroadcastPanel() {
    const [statusFilter, setStatusFilter] = useState<"ALL" | BroadcastStatus>("FAILED");
    const [loading, setLoading] = useState(true);
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [items, setItems] = useState<BroadcastItem[]>([]);

    const load = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getTelegramBroadcasts(
                statusFilter === "ALL" ? undefined : statusFilter,
                50
            );
            setItems(response.broadcasts || []);
        } catch {
            toast.error("Failed to load Telegram broadcast logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const onRetry = async (id: string) => {
        setRetryingId(id);
        try {
            await adminApi.retryTelegramBroadcast(id);
            toast.success("Retry request sent");
            await load();
        } catch {
            toast.error("Retry failed");
        } finally {
            setRetryingId(null);
        }
    };

    return (
        <Card className="max-w-4xl">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <CardTitle>Telegram broadcasts</CardTitle>
                        <CardDescription>
                            Track channel post status and retry failures.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={statusFilter === "FAILED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("FAILED")}
                        >
                            Failed
                        </Button>
                        <Button
                            variant={statusFilter === "SKIPPED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("SKIPPED")}
                        >
                            Skipped
                        </Button>
                        <Button
                            variant={statusFilter === "SENT" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("SENT")}
                        >
                            Sent
                        </Button>
                        <Button
                            variant={statusFilter === "ALL" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("ALL")}
                        >
                            All
                        </Button>
                        <Button variant="outline" size="icon" onClick={load} aria-label="Refresh logs">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="py-6 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No broadcast logs found for this filter.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">
                                        {item.opportunity?.title || "Unknown opportunity"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.opportunity?.company || "Unknown company"} | {item.channel}
                                    </p>
                                </div>
                                <Badge variant="outline">{item.status}</Badge>
                            </div>
                            {item.errorMessage ? (
                                <p className="text-xs text-red-600 dark:text-red-400">{item.errorMessage}</p>
                            ) : null}
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground">
                                    {item.sentAt
                                        ? `Sent: ${new Date(item.sentAt).toLocaleString()}`
                                        : `Created: ${new Date(item.createdAt).toLocaleString()}`}
                                </p>
                                {(item.status === "FAILED" || item.status === "SKIPPED") ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onRetry(item.id)}
                                        disabled={retryingId === item.id}
                                    >
                                        {retryingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry"}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
