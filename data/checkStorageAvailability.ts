export default async function checkStorageAvailability() {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      if(!usage || !quota) throw new Error("Storage usage or quota not available");
      const availableSpace = quota - usage;
      return availableSpace;
    }
    return null;
  }