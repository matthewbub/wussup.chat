import { list } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

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
    <div>
      <h1>Your Images</h1>
      <ul>
        {blobs.blobs.map((blob: any) => (
          <li key={blob.url}>
            <a href={blob.url} target="_blank" rel="noopener noreferrer">
              <img src={blob.url} alt="Generated Image" />
              {/* {blob.url} */}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
