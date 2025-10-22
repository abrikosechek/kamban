import styles from "./App.module.scss";
import { useMemo, useState } from "react";
import {
  DndContext,
  type DragMoveEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { SortableColumn } from "@/components/Sortable";
import {
  KanbanCard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
} from "@/components/Kanban";
import { produce } from "immer";

type Column = {
  id: string;
  cards: string[];
};

type OverItem = {
  columnId: string;
} & (
  | {
      type: "card";
      cardId: string;
    }
  | {
      type: "column";
    }
);

export const App = () => {
  const { setNodeRef } = useDroppable({
    id: "ColumnsDroppable",
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

  const [activeItem, setActiveItem] = useState<{
    type: "card" | "column";
    id: string;
    columnId: string;
  } | null>(null);

  const [overItem, setOverItem] = useState<OverItem | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const active = event.active;
    const activeData = active.data.current;

    if (!activeData) {
      console.error("Draggable data isn't provided");
      return;
    }

    setActiveItem({
      type: activeData.type,
      id: `${active.id}`,
      columnId: activeData.columnId,
    });
    setOverItem({
      type: activeData.type,
      cardId: `${active.id}`,
      columnId: activeData.columnId,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    const overData = over?.data.current;

    if (!event.over || !overData) {
      setOverItem(null);
      return;
    }

    switch (overData.type) {
      case "card":
        setOverItem({
          type: overData.type,
          columnId: overData.columnId,
          cardId: `${over.id}`,
        });
        break;
      case "column":
        setOverItem({
          type: overData.type,
          columnId: overData.columnId,
        });
        break;
    }
  };

  const handleDragEnd = () => {
    if (overItem === null || activeItem === null) {
      setActiveItem(null);
      setOverItem(null);
      return;
    }

    if (activeItem.type === "column") {
      setColumns((columns) => {
        const oldIndex = columns.findIndex(
          (column) => column.id === activeItem.columnId,
        );
        const newIndex = columns.findIndex(
          (column) => column.id === overItem.columnId,
        );

        return arrayMove(columns, oldIndex, newIndex);
      });
    } else if (activeItem.type === "card") {
      setColumns(
        produce((draft) => {
          const activeColumnId = draft.findIndex(
            (column) => column.id === activeItem.columnId,
          );
          const overColumnId = draft.findIndex(
            (column) => column.id === overItem.columnId,
          );

          if (activeColumnId === -1 || overColumnId === -1) return;

          // Move card over column
          if (overItem.type === "column") {
            draft[activeColumnId].cards = draft[activeColumnId].cards.filter(
              (card) => card !== activeItem.id,
            );
            draft[overColumnId].cards.unshift(activeItem.id);
          }
          // Move card over another card
          else if (overItem.type === "card") {
            if (activeItem.id === overItem.cardId) return;

            // Move inside same column
            // if (activeItem.columnId === overItem.columnId) {
            //   const oldIndex = draft[activeColumnId].cards.indexOf(
            //     activeItem.id,
            //   );
            //   const newIndex = draft[activeColumnId].cards.indexOf(
            //     overItem.cardId,
            //   );
            //   draft[activeColumnId].cards = arrayMove(
            //     draft[activeColumnId].cards,
            //     oldIndex,
            //     newIndex,
            //   );
            //   return;
            // }

            // Move into another column
            const newItemKey = draft[overColumnId].cards.indexOf(
              overItem.cardId,
            );
            if (newItemKey === -1) return;

            draft[activeColumnId].cards = draft[activeColumnId].cards.filter(
              (card) => card !== activeItem.id,
            );
            draft[overColumnId].cards.splice(newItemKey, 0, activeItem.id);
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
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main ref={setNodeRef} className={styles.layout__content}>
          <SortableContext
            items={columnsOrdering}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                id={column.id}
                items={column.cards}
              />
            ))}
          </SortableContext>
        </main>

        <DragOverlay>
          {activeItem &&
            (activeItem.type === "card" ? (
              <KanbanCard id={activeItem.id} lifted />
            ) : (
              <KanbanColumn>
                <KanbanColumnHeader id={activeItem.columnId} />
                <KanbanColumnContent>
                  {columns
                    .find((column) => column.id === activeItem.id)
                    ?.cards.map((card) => (
                      <KanbanCard id={card} />
                    ))}
                </KanbanColumnContent>
              </KanbanColumn>
            ))}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
