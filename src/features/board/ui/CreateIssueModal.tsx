import { useState } from "react";
import { X } from "lucide-react";

interface CreateIssueModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (title: string, body: string, labels: string[]) => void;
}

export function CreateIssueModal({ open, onClose, onCreate }: CreateIssueModalProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [labelsInput, setLabelsInput] = useState("");

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const labels = labelsInput
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean);

        onCreate(title.trim(), body.trim(), labels);
        setTitle("");
        setBody("");
        setLabelsInput("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="mb-5 text-lg font-semibold text-foreground">Новый Issue</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Заголовок <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Кратко опишите задачу…"
                            autoFocus
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Описание
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Подробности (необязательно)…"
                            rows={4}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Метки
                        </label>
                        <input
                            type="text"
                            value={labelsInput}
                            onChange={(e) => setLabelsInput(e.target.value)}
                            placeholder="bug, enhancement, help wanted (через запятую)"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
