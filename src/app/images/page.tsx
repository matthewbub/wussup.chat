import { list } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Download,
  Trash,
  Pencil,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
export const runtime = "edge";

export default async function ImagesPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const uniqueFolder = `generated-images/${userId}`;

  // Upload to Vercel Blob
  const blobs = await list({
    limit: 1000,
    prefix: uniqueFolder,
  });

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Your Generated Images ({blobs.blobs.length})
        </h2>
        <p className="text-muted-foreground text-lg">
          Images are stored for 30 days. Upgrade to a paid plan to store images
          indefinitely. (Sorry, storage is expensive)
        </p>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {blobs.blobs.map((blob: any) => (
            <div key={blob.url} className="relative">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                <img
                  src={blob.url}
                  alt="Generated Image"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm text-foreground">Generated Image</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(blob.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <a
                        href={blob.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex items-center w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Rename</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <div className="flex items-center w-full">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
