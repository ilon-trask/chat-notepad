import { toast } from "sonner";

export default function confirmableDelete<T>({
  getEntity,
  onDelete,
  onReverseDelete,
  onStoreDelete,
  name,
}: {
  getEntity: () => T | undefined;
  onDelete: () => void;
  onStoreDelete: () => void;
  onReverseDelete: (entity: T) => void;
  name: string;
}) {
  const entity = getEntity();
  if (!entity) return null;
  onStoreDelete();
  const timeout = setTimeout(() => {
    onDelete();
  }, 4000);
  toast(name + " has been deleted", {
    action: {
      label: "Undo",
      onClick: () => {
        clearTimeout(timeout);
        onReverseDelete(entity);
      },
    },
  });
}
