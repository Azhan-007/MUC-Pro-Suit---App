import { CommandCenterService } from "@/services/domain";
import { CommandCenterClient } from "./CommandCenterClient";

export default async function MasterAdminCommandCenter() {
  const overview = await CommandCenterService.getCommandCenterOverview();
  return <CommandCenterClient overview={overview} />;
}
