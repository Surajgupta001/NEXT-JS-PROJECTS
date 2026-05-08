import { SignOutButton, SignUpButton, Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <Show when="signed-out">
        <SignUpButton />
      </Show>

      <Show when="signed-in">
        <SignOutButton />
      </Show>
    </div>
  );
}
