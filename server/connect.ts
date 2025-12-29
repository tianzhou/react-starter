import { expressConnectMiddleware } from "@connectrpc/connect-express";
import { OrgService } from "../src/gen/org_connect";
import { orgServiceHandlers } from "./services/org-service";

/**
 * ConnectRPC router - registers all RPC services
 * Integrated into Express via middleware
 */
export const connectRouter = expressConnectMiddleware({
  routes: (router) => {
    router.service(OrgService, orgServiceHandlers);
  },
});
