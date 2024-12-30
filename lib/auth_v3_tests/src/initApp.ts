import constants from "./constants.js";
import { createAdminUser } from "./getAdminUser.js";
import { faker } from "@faker-js/faker";

const initApp = async () => {
  const API_URL = constants.API_URL;

  const { accessToken: adminAccessToken, userData: adminUserData } =
    await createAdminUser();

  const appData = {
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    domain: faker.internet.domainName(),
    userId: adminUserData.id,
  };

  const createAppResponse = await fetch(`${API_URL}/v3/admin/create-app`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appData),
  });

  const createAppData = await createAppResponse.json();

  if (!createAppData.success) {
    throw new Error(createAppData.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const listAppsOwnedByUserResponse = await fetch(
    `${API_URL}/v3/admin/apps/${adminUserData.id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
    }
  );

  const listAppsOwnedByUserResponseData =
    await listAppsOwnedByUserResponse.json();

  return {
    appId: listAppsOwnedByUserResponseData.data.results[0].id,
    adminUserId: adminUserData.id,
    adminAccessToken,
    appData,
  };
};

export default initApp;
