import styles from "./App.module.scss";
import { useMemo, useState } from "react";
import {
  KanbanCard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
} from "@/components/Kanban";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
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
import type { ActiveItem, OverItem } from "@/shared/types.ts";
import {SortableColumn} from "@/components/Sortable";

type Column = {
  id: string;
  cards: string[];
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

                const newIndex = newColumn.cards.indexOf(overItem.cardId);
                newColumn.cards.splice(newIndex + 1, 0, activeItem.cardId);
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
