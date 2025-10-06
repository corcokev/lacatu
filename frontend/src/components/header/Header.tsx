import type { AuthUser } from "aws-amplify/auth";
import LacatuLogo from "../../assets/LacatuLogo.png";
import type { AuthEventData } from "@aws-amplify/ui";
import Button from "../ui/Button";

export default function Header({
  user,
  signOut,
}: {
  user: AuthUser | undefined;
  signOut: ((data?: AuthEventData | undefined) => void) | undefined;
}) {
  return (
    <header className="gap- flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="m-0 text-2xl font-semibold">Lacatu App</h1>
        <img className="max-w-15" src={LacatuLogo}></img>
      </div>
      <div className="flex items-center">
        <div className="text-sm opacity-80">Signed in as </div>
        <div className="px-2 font-mono text-sm">
          {user?.signInDetails?.loginId}
        </div>
        <Button onClick={signOut}>Sign out</Button>
      </div>
    </header>
  );
}
