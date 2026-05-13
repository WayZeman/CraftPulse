import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddServerForm } from "./add-server-form";

export const metadata = { title: "Додати сервер" };

export default async function AddServerPage() {
  await requireUser();
  const tags = await db.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="heading-2 font-display">Додати сервер</h1>
          <p className="mt-2 text-muted-foreground">
            Заповни форму, і твій сервер пройде модерацію за 24 години.
          </p>
        </header>
        <Card>
          <CardHeader><CardTitle>Інформація</CardTitle></CardHeader>
          <CardContent>
            <AddServerForm tags={tags} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
