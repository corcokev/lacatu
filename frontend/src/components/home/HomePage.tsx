import { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import type { AuthUser } from "aws-amplify/auth";
import type { AuthEventData } from "@aws-amplify/ui";
import Button from "../ui/Button";

type AuthRenderProp = (props: {
  user?: AuthUser | undefined;
  signOut?: ((data?: AuthEventData | undefined) => void) | undefined;
}) => React.ReactElement;

export default function HomePage({ children }: { children: AuthRenderProp }) {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <Authenticator>{children}</Authenticator>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Lacatu</h1>
        <p className="mb-8 text-lg text-gray-600">
          Your serverless item management app
        </p>
      </div>
      <Button onClick={() => setShowAuth(true)}>Login / Sign Up</Button>
    </main>
  );
}
