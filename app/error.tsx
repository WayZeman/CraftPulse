"use client";

import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="text-center">
        <h1 className="heading-3 font-display">Щось пішло не так</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{error.message}</p>
        <Button className="mt-6" onClick={reset}>
          <RotateCw className="h-4 w-4" /> Спробувати знову
        </Button>
      </div>
    </div>
  );
}
