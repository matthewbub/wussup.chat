import { Button } from "@/components/ui/button";
import { useNavigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: ErrorPage,
});

function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="text-center space-y-5">
        <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
        <p className="text-xl text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <div className="space-x-4">
          <Button
            onClick={() => navigate({ to: "/", search: { _replace: true } })}
            variant="outline"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate({ to: "/", search: { _replace: true } })}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
