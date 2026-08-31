"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
  type State,
} from "./actions";

const initial: State = {};

export function ProfileForm({
  name,
  email,
  verified,
}: {
  name: string;
  email: string;
  verified: boolean;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="auth-form">
      <h2>Profile</h2>
      {state.ok && <p className="auth-ok">{state.ok}</p>}
      {state.error && <p className="auth-error">{state.error}</p>}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="field">
        <label htmlFor="email">
          Email {verified ? "(verified)" : "(unverified)"}
        </label>
        <input id="email" name="email" type="email" defaultValue={email} required />
      </div>
      <button type="submit" className="go-btn" disabled={pending}>
        {pending ? "..." : "Save"}
      </button>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  if (!hasPassword) {
    return (
      <div className="auth-form">
        <h2>Password</h2>
        <p className="auth-hint">
          This account was created with Google sign-in — no password is set here.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="auth-form">
      <h2>Password change</h2>
      {state.ok && <p className="auth-ok">{state.ok}</p>}
      {state.error && <p className="auth-error">{state.error}</p>}
      <div className="field">
        <label htmlFor="currentPassword">Current password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="newPassword">New password (min 8)</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <button type="submit" className="go-btn" disabled={pending}>
        {pending ? "…" : "Change password"}
      </button>
    </form>
  );
}

export function DeleteAccount() {
  return (
    <form
      action={deleteAccountAction}
      className="auth-form"
      onSubmit={(e) => {
        if (
          !confirm(
            "Are you sure? Your account and all data (saved searches, watches) will be deleted.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <h2>Danger zone</h2>
      <p className="auth-hint">
        Permanently delete your account. This cannot be undone.
      </p>
      <button type="submit" className="danger-btn">
        Delete my account
      </button>
    </form>
  );
}
