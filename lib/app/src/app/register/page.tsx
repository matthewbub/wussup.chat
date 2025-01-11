import { Registration, PublicHeader } from "@ninembs-studio/auth-ui";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <div>
      <PublicHeader />
      <Registration history={router} />
    </div>
  );
}
