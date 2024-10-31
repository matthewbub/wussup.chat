import { createFileRoute } from '@tanstack/react-router'
import {
  AuthenticatedResetPasswordForm
} from "@/components/authenticated-reset-password-form";

export const Route = createFileRoute('/account/reset-password')({
  component: ResetPasswordForAuthenticatedUsers,
})

function ResetPasswordForAuthenticatedUsers(){
  return (
    <div>
      <AuthenticatedResetPasswordForm />
    </div>
  )
}
