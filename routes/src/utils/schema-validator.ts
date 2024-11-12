import Ajv from "ajv/dist/2020";
import addFormats from "ajv-formats";

// Initialize Ajv with your preferred options
const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
});
// Add support for formats like email, date-time, etc.
addFormats(ajv);

const SCHEMA_PATH_PREFIX = "/api/v1/schema/";

function isValidSchemaPath(path: string): boolean {
  return (
    path.startsWith(SCHEMA_PATH_PREFIX) &&
    // Ensure there's an ID after the prefix and no additional slashes or dots
    /^\/api\/v1\/schema\/[\w-]+$/.test(path)
  );
}

export async function getSchema(schemaUrl: string): Promise<any> {
  if (!isValidSchemaPath(schemaUrl)) {
    throw new Error(
      `Invalid schema path. Must start with ${SCHEMA_PATH_PREFIX} and contain a valid ID`
    );
  }

  const response = await fetch(schemaUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch schema");
  }
  return response.json();
}

export async function validateResponse(response: Response): Promise<any> {
  const linkHeader = response.headers.get("Link");
  if (!linkHeader) {
    return response.json();
  }

  // Extract schema URL from Link header
  const schemaUrl = linkHeader.split(";")[0].slice(1, -1);
  const schema = await getSchema(schemaUrl);
  const data = await response.json();

  const validate = ajv.compile(schema);
  if (!validate(data)) {
    throw new Error("Response does not match schema");
  }

  return data;
}
