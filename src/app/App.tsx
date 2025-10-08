import styles from "./App.module.scss";
import { type ReactNode, useMemo, useState } from "react";
import { KanbanCard, KanbanColumn } from "@/shared/ui";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanColumnContent, KanbanColumnHeader } from "@/shared/ui/Kanban";
import { produce } from "immer";

type Column = {
  id: string;
  cards: string[];
};

// SortableCard
type SortableCardProps = {
  id: string;
  columnId: string;
};

const SortableCard = ({ id, columnId }: SortableCardProps) => {
  const { listeners, attributes, setNodeRef, transform, transition, isDragging } =
    useSortable({
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
      <KanbanCard style={{ opacity: isDragging ? "0.6" : "1" }} id={id} />
    </div>
  );
};

// SortableColumn
type SortableColumnProps = {
  children?: ReactNode;
  id: string;
  items: string[];
};

const SortableColumn = ({ children, id, items }: SortableColumnProps) => {
  const {
    listeners,
    attributes,
    setNodeRef: setSortableNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: "column",
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setSortableNodeRef} style={style}>
      <KanbanColumn id={id}>
        <KanbanColumnHeader
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          id={id}
        />

        <KanbanColumnContent>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {children}
          </SortableContext>
        </KanbanColumnContent>
      </KanbanColumn>
    </div>
  );
};

// App
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

  const { setNodeRef } = useDroppable({
    id: "ColumnsDroppable",
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(pointerSensor);

  const [dragElement, setDragElement] = useState<{
    id: string;
  } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    // console.log(event);
    setDragElement({
      id: `${event.active.id}`,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const active = event.active;
    const activeData = active.data.current;
    const over = event.over;
    const overData = over?.data.current;

    console.log(over);

    if (!activeData || !overData) {
      console.error("No active or over item data provided");
      return;
    }
    // move card
    if (activeData.type == "card") {
      const moveToColumnId =
        overData.type == "column" ? over.id : overData.columnId;

      // to another column
      if (!(activeData.columnId === moveToColumnId)) {
        console.log(
          `Move card "${active.id}" from column "${activeData.columnId}" to column "${moveToColumnId}"`,
        );

        setColumns(
          produce((draft) => {
            const cardColumn = draft.find(
              (column) => column.id === activeData.columnId,
            );
            const columnToAdd = draft.find(
              (column) => column.id === moveToColumnId,
            );

            if (!cardColumn || !columnToAdd) {
              console.error("Immer: Column not found");
              return;
            }

            const cardIndex = cardColumn.cards.indexOf(`${active.id}`);

            if (cardIndex === -1) {
              console.error("Immer: Card not found in column");
              return;
            }

            cardColumn.cards.splice(cardIndex, 1);

            columnToAdd.cards.push(`${active.id}`);
          }),
        );
      }
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles["layout-header"]}>
        <p className={styles["layout-header__logo"]}>Kamban</p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main ref={setNodeRef} className={styles.layout__content}>
          <SortableContext
            items={columnsIds}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                id={column.id}
                items={column.cards}
              >
                {column.cards.map((card) => (
                  <SortableCard id={card} columnId={column.id} />
                ))}
              </SortableColumn>
            ))}
          </SortableContext>
        </main>

        <DragOverlay>
          {dragElement && (
            <div className={styles["overlay-card"]}>
              <div className={styles["overlay-card__container"]}>
                <p>{dragElement.id}</p>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
