import styles from "./App.module.scss";
import { type ReactNode, useMemo, useState } from "react";
import {
  KanbanCard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
} from "@/components/Kanban";
import {
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

type Column = {
  id: string;
  cards: string[];
};

type ActiveItem = {
  type: "card";
  cardId: string;
  columnId: string;
};

type OverItem = {
  type: "card";
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
  const { setNodeRef } = useDroppable({
    id: `column-${id}`,
  });

  const sortedItems = useMemo(() => {
    let itemsClone = structuredClone(items);

    // Add item if it's from other column
    if (
      activeItem &&
      overItem &&
      activeItem.columnId !== id &&
      overItem.columnId === id
    ) {
      itemsClone.unshift(activeItem.cardId);
    }

    //  Or mercilessly remove item from original column
    if (
      activeItem &&
      activeItem.columnId === id &&
      (!overItem || overItem.columnId !== id)
    ) {
      itemsClone = itemsClone.filter((item) => item !== activeItem.cardId);
    }

    return itemsClone;
  }, [items, activeItem, overItem, id]);

  return (
    <KanbanColumn>
      <KanbanColumnHeader id={id} />

      <SortableContext
        id={`column-${id}`}
        items={sortedItems}
        strategy={verticalListSortingStrategy}
      >
        <KanbanColumnContent ref={setNodeRef}>
          {sortedItems.map((item) => (
            <SortableCard key={item} id={item} columnId={id} />
          ))}

          {children}
        </KanbanColumnContent>
      </SortableContext>
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
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const active = event.active;
    const activeData = active.data.current;
    const over = event.over;
    const overData = over?.data.current;

    if (!over) {
      setOverItem(null);
    }

    if (!activeData || !overData) {
      console.error("Sortable active or item data isn't provided!");
      return;
    }

    setOverItem({
      type: "card",
      columnId: overData.columnId,
    });

    console.log(overItem);
  };

  const handleDragEnd = () => {
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
        <main className={styles.layout__content}>
          {columns.map((column) => (
            <SortableColumn
              key={column.id}
              id={column.id}
              items={column.cards}
              activeItem={activeItem}
              overItem={overItem}
            />
          ))}
        </main>

        <DragOverlay>
          {activeItem && <KanbanCard id={activeItem.cardId} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
