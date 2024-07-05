import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Bookings from "@/components/Bookings";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-screen-lg flex justify-between items-center py-3 text-sm">
            <h1 className="text-lg">
              Connected Coworking
            </h1>
            <AuthButton />
          </div>
        </nav>
      </div>

      <div className="w-full max-w-screen-lg mx-auto">
        <Bookings />
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-3 flex justify-center text-center text-xs">
        <p>
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="text-3xl"
            rel="noreferrer"
          >
            ✞
          </a>
        </p>
      </footer>
    </div>
  );
}
