import { useDroppable } from "@dnd-kit/core";
import { type ReactNode, useMemo } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActiveItem, OverItem } from "@/shared/types.ts";
import { KanbanColumn, KanbanColumnContent, KanbanColumnHeader } from "@/components/Kanban";
import {SortableCard} from "./SortableCard.tsx";

type SortableColumnProps = {
  children?: ReactNode;
  id: string;
  items: string[];
  activeItem?: ActiveItem | null;
  overItem?: OverItem | null;
};

export const SortableColumn = ({
  children,
  id,
  items,
  activeItem,
  overItem,
}: SortableColumnProps) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "column",
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? "0.5" : "1",
  };

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `droppable-column-${id}`,
  });

  const sortedItems = useMemo(() => {
    let itemsClone = structuredClone(items);

    if (activeItem && activeItem.type === "card") {
      // Add item if it's from other column
      if (overItem && activeItem.columnId !== id && overItem.columnId === id) {
        itemsClone.push(activeItem.cardId);
      }

      //  Or mercilessly remove item from original column
      if (
        activeItem.columnId === id &&
        (!overItem || overItem.columnId !== id)
      ) {
        itemsClone = itemsClone.filter((item) => item !== activeItem.cardId);
      }
    }

    return itemsClone;
  }, [items, activeItem, overItem, id]);

  return (
    <KanbanColumn style={style} ref={setSortableNodeRef}>
      <KanbanColumnHeader {...attributes} {...listeners} id={id} />

      <KanbanColumnContent ref={setDroppableNodeRef}>
        <SortableContext
          id={`column-${id}`}
          items={sortedItems}
          strategy={verticalListSortingStrategy}
        >
          {sortedItems.map((item) => (
            <SortableCard key={item} id={item} columnId={id} />
          ))}
        </SortableContext>

        {children}
      </KanbanColumnContent>
    </KanbanColumn>
  );
};
