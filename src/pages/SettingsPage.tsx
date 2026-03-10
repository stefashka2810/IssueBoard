import SettingForm from "../features/settings/ui/SettingForm.tsx";
import {Link} from "react-router-dom";
import {ArrowLeft} from "lucide-react";

function SettingsPage() {

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Board
                </Link>
                <SettingForm></SettingForm>
            </div>
        </div>
    );
}

export default SettingsPage;
