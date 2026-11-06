import { sendMagicLink } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <h1>Sign in</h1>
      {sent ? (
        <p>Check your inbox for a sign-in link.</p>
      ) : (
        <form action={sendMagicLink}>
          <label>
            Email
            <input type="email" name="email" required placeholder="you@example.com" />
          </label>
          <button type="submit">Send sign-in link</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </>
  );
}
