import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div>
        <h1 className="text-3xl">Welcome to Connected Coworking</h1>
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
