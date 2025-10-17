import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard } from "@/components/Kanban";

type SortableCardProps = {
  id: string;
  columnId: string;
};

export const SortableCard = ({ id, columnId }: SortableCardProps) => {
  const {
    listeners,
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "card",
      columnId,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div {...listeners} {...attributes} ref={setNodeRef} style={style}>
      <KanbanCard style={{ opacity: isDragging ? "0" : "1" }} id={id} />
    </div>
  );
};