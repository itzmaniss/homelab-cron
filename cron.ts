import { Baker } from "cronbake";
import { checkIP } from "./ddns";

const baker = new Baker();
console.log("cron jobs starting up!");
const ipCheckJob = baker.add({
  name: "ip-check",
  cron: "@every_5_minutes",
  callback: async () => {
    console.log("checking ip");
    try {
      const updated = await checkIP();
      if (updated) {
        console.log("IP address updated successfully.");
      } else {
        console.log("No IP address change detected.");
      }
    } catch (error) {
      console.error("Error checking or updating IP address:", error);
    }
  },
});

baker.bakeAll();
