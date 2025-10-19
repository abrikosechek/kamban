import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
} from "@/components/Kanban";
import { SortableCard } from "@/components/Sortable/SortableCard.tsx";
import { memo } from "react";

type SortableColumnProps = {
  id: string;
  items: string[];
};

export const SortableColumn = memo(({ id, items }: SortableColumnProps) => {
  const {
    listeners,
    attributes,
    setNodeRef: setSortableNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "column",
      columnId: id,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? "0" : "1",
  };

  return (
    <div ref={setSortableNodeRef} style={style}>
      <KanbanColumn>
        <KanbanColumnHeader
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          id={id}
        />

        <KanbanColumnContent>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableCard key={item} id={item} columnId={id} />
            ))}
          </SortableContext>
        </KanbanColumnContent>
      </KanbanColumn>
    </div>
  );
});
