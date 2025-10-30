import { AdverticeUpload } from "~~/server/utils/advertise";
import { capabilityAdvertisement  } from "$/git";
import { repoKey } from "$/keys";

export default defineEventHandler(async (event) => {
  const owner = getRouterParam(event,'owner');
  const repo = getRouterParam(event,'repo');
  const query = getQuery(event);

  //Mode of the server, to upload a packfile to the client for clone/pull or to allow to recieve a packfile for push
  if (query.service != "git-upload-pack" && query.service != "git-receive-pack"){
    throw createError({
      statusCode: 400,
      statusMessage: 'Not supported service',
    })
  }

  if (query.service == "git-upload-pack"){
    return await capabilityAdvertisement(env, service, repoKey(owner, repo));
  }

})
