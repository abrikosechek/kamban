import { useSortable } from "@dnd-kit/sortable";
import { KanbanCard } from "@/components/Kanban";
import { CSS } from "@dnd-kit/utilities";

type SortableCardProps = {
  id: number;
  columnId: string;
};

export const SortableCard = ({ id, columnId }: SortableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "card",
      cardId: id,
      columnId: columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? "0.5" : "1",
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <KanbanCard taskId={id} />
    </div>
  );
};
