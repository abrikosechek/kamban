import styles from "./App.module.scss";
import { type ReactNode, useMemo, useState } from "react";
import {
  KanbanCard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
} from "@/components/Kanban";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { produce } from "immer";

type Column = {
  id: string;
  cards: string[];
};

type ActiveItem =
  | {
      type: "card";
      cardId: string;
      columnId: string;
    }
  | {
      type: "column";
      columnId: string;
    };

type OverItem =
  | {
      type: "card";
      cardId: string;
      columnId: string;
    }
  | {
      type: "column";
      columnId: string;
    };

type SortableCardProps = {
  id: string;
  columnId: string;
};

const SortableCard = ({ id, columnId }: SortableCardProps) => {
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
      <KanbanCard id={id} />
    </div>
  );
};

type SortableColumnProps = {
  children?: ReactNode;
  id: string;
  items: string[];
  activeItem?: ActiveItem | null;
  overItem?: OverItem | null;
};

const SortableColumn = ({
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

export const App = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const { setNodeRef } = useDroppable({
    id: "columns-droppable",
  });

  const [columns, setColumns] = useState<Column[]>([
    {
      id: "Planned",
      cards: ["Eat soup", "Write a book", "asd1", "asd2", "asd3"],
    },
    {
      id: "In Work",
      cards: ["Cook", "Cook 1", "Cook 2"],
    },
    {
      id: "Complete",
      cards: [],
    },
  ]);

  const columnsOrdering = useMemo(
    () => columns.map((column) => column.id),
    [columns],
  );

  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [overItem, setOverItem] = useState<OverItem | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const active = event.active;
    const activeData = active.data.current;

    if (!activeData) {
      console.error("Sortable item data isn't provided");
      return;
    }

    if (activeData.type === "card") {
      setActiveItem({
        type: "card",
        cardId: active.id.toString(),
        columnId: activeData.columnId,
      });
    } else if (activeData.type === "column") {
      setActiveItem({
        type: "column",
        columnId: active.id.toString(),
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const active = event.active;
    const activeData = active.data.current;
    const over = event.over;
    const overData = over?.data.current;

    if (!over) {
      setOverItem(null);
      return;
    }

    if (!activeData || !overData) {
      console.error("Sortable active or item data isn't provided!");
      return;
    }

    if (overData.type === "card") {
      setOverItem({
        type: "card",
        cardId: over.id.toString(),
        columnId: overData.columnId,
      });
    } else if (overData.type === "column") {
      setOverItem({
        type: "column",
        columnId: over.id.toString(),
      });
    }
  };

  const handleDragEnd = () => {
    if (!overItem || !activeItem) return;

    console.log(activeItem);
    console.log(overItem);

    // Move column to column
    if (
      activeItem.type === "column" &&
      overItem.type === "column" &&
      activeItem.columnId !== overItem.columnId
    ) {
      setColumns((columns) => {
        const oldIndex = columns.findIndex(
          (column) => column.id === activeItem.columnId,
        );
        const newIndex = columns.findIndex(
          (column) => column.id === overItem.columnId,
        );

        return arrayMove(columns, oldIndex, newIndex);
      });
    }
    // Move card
    else if (activeItem.type === "card") {
      setColumns(
        produce((draft) => {
          const oldColumn = draft.find(
            (column) => column.id === activeItem.columnId,
          );
          const newColumn = draft.find(
            (column) => column.id === overItem.columnId,
          );

          // To column (not over card)
          if (oldColumn && newColumn) {
            if (
              overItem.type === "column" &&
              activeItem.columnId !== overItem.columnId
            ) {
              oldColumn.cards = oldColumn.cards.filter(
                (card) => card !== activeItem.cardId,
              );
              newColumn.cards.push(activeItem.cardId);
            }
            // To card
            else if (overItem.type === "card") {
              // In the same column
              if (activeItem.columnId === overItem.columnId) {
                const oldIndex = oldColumn.cards.indexOf(activeItem.cardId);
                const newIndex = oldColumn.cards.indexOf(overItem.cardId);

                oldColumn.cards = arrayMove(
                  oldColumn.cards,
                  oldIndex,
                  newIndex,
                );
              } else {
                oldColumn.cards = oldColumn.cards.filter(
                  (card) => card !== activeItem.cardId,
                );

                const newIndex = newColumn.cards.indexOf(overItem.cardId)
                newColumn.cards.splice(newIndex + 1, 0, activeItem.cardId)
              }
            }
          }
        }),
      );
    }

    setActiveItem(null);
    setOverItem(null);
  };
  const handleDragCancel = () => {
    setActiveItem(null);
    setOverItem(null);
  };

  return (
    <div className={styles.layout}>
      <div className={styles["layout-header"]}>
        <p className={styles["layout-header__logo"]}>Kamban</p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main ref={setNodeRef} className={styles.layout__content}>
          <SortableContext items={columnsOrdering}>
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                id={column.id}
                items={column.cards}
                activeItem={activeItem}
                overItem={overItem}
              />
            ))}
          </SortableContext>
        </main>

        <DragOverlay>
          {activeItem?.type === "card" && <KanbanCard id={activeItem.cardId} />}
          {activeItem?.type === "column" && (
            <KanbanColumn>
              <KanbanColumnHeader id={activeItem.columnId} />

              <KanbanColumnContent>
                {columns
                  .find((column) => column.id === activeItem.columnId)
                  ?.cards.map((card) => (
                    <KanbanCard key={card} id={card} />
                  ))}
              </KanbanColumnContent>
            </KanbanColumn>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
