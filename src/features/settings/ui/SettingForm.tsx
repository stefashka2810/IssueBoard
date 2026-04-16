import { useState } from "react";
import {GitBranch, Key, Save, CheckCircle2, Eye, EyeOff, ShieldQuestionMark} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {useSettingsStore} from "../model/settings.store.ts";
import {type Setting, SettingSchema} from "../model/schema.ts";

function SettingForm() {
    const repoFullName = useSettingsStore((s) => s.repoFullName);
    const token = useSettingsStore((s) => s.token);
    const setRepoFullName = useSettingsStore((s) => s.setRepoFullName);
    const setToken = useSettingsStore((s) => s.setToken);
    const [openInfo, setOpenInfo] = useState(false);

    const [showToken, setShowToken] = useState(false);
    const [saved, setSaved] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
    } = useForm<Setting>({
        resolver: zodResolver(SettingSchema),
        defaultValues: {
            repoFullName,
            token,
        },
        mode: "onChange",
    });

    function onSubmit(data: Setting) {
        setRepoFullName(data.repoFullName);
        setToken(data.token);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (<>

            <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Настройки
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
                Настройте подключение к вашему репозиторию GitHub.
            </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-teal-500" />

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="repoFullName"
                            className="flex items-center gap-2 text-sm font-semibold text-foreground"
                        >
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            Репозиторий
                        </label>
                        <p className="text-xs text-muted-foreground">
                            Полное название в формате <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">owner/repo</code>.
                        </p>
                        <input
                            id="repoFullName"
                            type="text"
                            placeholder="например, facebook/react"
                            {...register("repoFullName")}
                            className={`h-10 w-full rounded-lg border px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 ${
                                errors.repoFullName
                                    ? "border-destructive focus:border-destructive focus:ring-destructive/25"
                                    : "border-border bg-background focus:border-primary focus:ring-primary/25"
                            }`}
                        />
                        {errors.repoFullName && (
                            <p className="text-xs text-destructive">
                                {errors.repoFullName.message}
                            </p>
                        )}
                    </div>

                    <div className="border-t border-border" />

                    <div className="space-y-2">
                        <label
                            htmlFor="token"
                            className="flex items-center gap-2 text-sm font-semibold text-foreground"
                        >
                            <Key className="h-4 w-4 text-muted-foreground" />
                            Персональный токен доступа (PAT) <ShieldQuestionMark onClick={() => setOpenInfo(prev => !prev)} strokeWidth={'2'} className={'h-4 w-4 text-primary hover:text-primary/90 hover:cursor-pointer'}/>
                        </label>
                        {openInfo && (
                            <div className={'flex flex-row w-fit p-3 text-muted-foreground text-xs rounded-lg bg-muted/50 border border-muted'}>
                                Ваш токен хранится локально и никуда не отправляется. <br></br>
                                Вы можете создать его на GitHub в личных настройках пользователя в разделе "Developer settings" → "Personal access tokens" → "Tokens (classic)".
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Токен GitHub с областью доступа <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">repo</code>.
                        </p>
                        <div className="relative">
                            <input
                                id="token"
                                type={showToken ? "text" : "password"}
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                {...register("token")}
                                className={`h-10 w-full rounded-lg border bg-background px-3 pr-10 font-mono text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 ${
                                    errors.token
                                        ? "border-destructive focus:border-destructive focus:ring-destructive/25"
                                        : "border-border focus:border-primary focus:ring-primary/25"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition hover:text-foreground hover:cursor-pointer"
                            >
                                {showToken ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.token && (
                            <p className="text-xs text-destructive">
                                {errors.token.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/50 px-6 py-4">
                    <div className="text-xs text-muted-foreground">
                        {saved ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Сохранено
                                    </span>
                        ) : isDirty ? (
                            "Есть несохранённые изменения"
                        ) : (
                            "Все настройки сохранены"
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!isDirty || !isValid}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
                    >
                        <Save className="h-4 w-4" />
                        Сохранить
                    </button>
                </div>
            </div>
        </form>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Текущее подключение</h3>
            <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Репозиторий:</span>
                    {repoFullName ? (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-200">
                                    {repoFullName}
                                </span>
                    ) : (
                        <span className="text-xs italic text-muted-foreground">Не задан</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Токен:</span>
                    {token ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-200">
                                    ••••••{token.slice(-4)}
                                </span>
                    ) : (
                        <span className="text-xs italic text-muted-foreground">Не задан</span>
                    )}
                </div>
            </div>
        </div>
    </>
    );
}

export default SettingForm;
