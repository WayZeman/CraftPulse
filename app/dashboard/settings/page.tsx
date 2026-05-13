import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Налаштування" };

export default async function SettingsPage() {
  const session = await requireUser();
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, name: true, username: true, email: true, bio: true,
      website: true, twitter: true, youtube: true, image: true,
    },
  });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-3 font-display">Налаштування</h1>
        <p className="text-muted-foreground">Керуй своїм профілем та налаштуваннями.</p>
      </header>
      <Card>
        <CardHeader><CardTitle>Профіль</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
