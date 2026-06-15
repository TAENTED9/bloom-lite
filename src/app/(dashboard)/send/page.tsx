import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SendForm } from "@/components/send/SendForm";

export default async function SendPage() {
  const auth = await getAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { currency: true },
  });
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Send Money</h1>
        <p className="text-sm text-text-muted">
          Send to family and friends in seconds.
        </p>
      </div>

      <SendForm senderCurrency={user.currency} />
    </div>
  );
}
