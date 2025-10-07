import styles from "./App.module.scss";
import { useMemo, useState } from "react";
import { KanbanCard, KanbanColumn } from "@/shared/ui";
import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type Column = {
  id: string;
  cards: string[];
};

export const App = () => {
  // Columns and Cards
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "Planned",
      cards: ["Eat soup", "Write a book"],
    },
    {
      id: "In Work",
      cards: ["Cook"],
    },
    {
      id: "Complete",
      cards: [],
    },
  ]);

  const columnsIds = useMemo(
    () => columns.map((column) => column.id),
    [columns],
  );

  // Drag
  const { setNodeRef } = useDroppable({
    id: "ColumnsDroppable",
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(pointerSensor);

  const [draggingItem, setDraggingItem] = useState<{
    type: "card" | "column";
    id: string | number;
  } | null>(null);

  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const eventData = event.active.data.current;

    if (!eventData) {
      console.error("No draggable data provided");
      return;
    }

    setDraggingItem({
      type: eventData.type,
      id: event.active.id,
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const currentOver = event.over?.data.current;

    if (!currentOver) {
      setDragOverItem(null);
      return;
    }

    switch (currentOver.type) {
      case "column":
        setDragOverItem(currentOver.id);
        break;
      case "card":
        setDragOverItem(currentOver.columnId);
        break;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!dragOverItem) {
      return;
    }

    const activeCurrent = event.active.data.current;
    const overCurrent = event.over?.data.current;

    if (!activeCurrent || !overCurrent) {
      console.error("No data provided");
      return;
    }

    let overColumnId: string | null = null;

    // check itemOver is column or card
    switch (overCurrent.type) {
      case "column":
        overColumnId = overCurrent.id;
        break;
      case "card":
        overColumnId = overCurrent.columnId;
        break;
    }

    if (!overColumnId) {
      console.error("Such column isn't found");
    }

    if (activeCurrent.columnId === overColumnId) {
      console.log("same");
    }

    console.log(event);
    // console.log(draggingItem)
    // console.log(dragOverItem)

    setDraggingItem(null);
    setDragOverItem(null);
  };

  return (
    <div className={styles.layout}>
      <div className={styles["layout-header"]}>
        <p className={styles["layout-header__logo"]}>Kamban</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <main ref={setNodeRef} className={styles.layout__content}>
          <SortableContext
            items={columnsIds}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                isOver={!!dragOverItem && dragOverItem === column.id}
              >
                <SortableContext
                  items={column.cards}
                  strategy={verticalListSortingStrategy}
                >
                  {column.cards.map((card) => (
                    <KanbanCard key={card} id={card} columnId={column.id} />
                  ))}
                </SortableContext>
              </KanbanColumn>
            ))}
          </SortableContext>

          <DragOverlay>
            {draggingItem && (
              <div className={styles["overlay-card"]}>
                <div className={styles["overlay-card__container"]}>
                  <p>
                    {draggingItem.type} "{draggingItem.id}"
                  </p>
                </div>

                {dragOverItem && (
                  <>
                    <p>to</p>
                    <div className={styles["overlay-card__container"]}>
                      <p>Column "{dragOverItem}"</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </DragOverlay>
        </main>
      </DndContext>
    </div>
  );
};
