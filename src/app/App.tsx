import styles from "./App.module.scss";
import { type ReactNode, useMemo, useState } from "react";
import { KanbanCard, KanbanColumn } from "@/shared/ui";
import {
  DndContext,
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

type Column = {
  id: string;
  cards: string[];
};

// SortableCard
type SortableCardProps = {
  id: string;
};

const SortableCard = ({ id }: SortableCardProps) => {
  const { listeners, attributes, setNodeRef, transform, transition } =
    useSortable({
      id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div {...listeners} {...attributes} ref={setNodeRef} style={style}>
      <KanbanCard id={id} />
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
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `column-droppable-${id}`,
  });

  const {
    listeners,
    attributes,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setSortableNodeRef} style={style}>
      <KanbanColumn id={id}>
        <KanbanColumnHeader {...listeners} {...attributes} id={id} />

        <KanbanColumnContent ref={setDroppableNodeRef}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>{children}</SortableContext>
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

  return (
    <div className={styles.layout}>
      <div className={styles["layout-header"]}>
        <p className={styles["layout-header__logo"]}>Kamban</p>
      </div>

      <DndContext sensors={sensors}>
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
                  <SortableCard id={card} />
                ))}
              </SortableColumn>
            ))}
          </SortableContext>
        </main>
      </DndContext>
    </div>
  );
};
