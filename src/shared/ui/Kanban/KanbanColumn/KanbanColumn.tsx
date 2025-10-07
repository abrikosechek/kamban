import styles from "./KanbanColumn.module.scss";
import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

type KanbanColumnProps = {
  id: string;
  children?: ReactNode;
  isOver: boolean
};

export const KanbanColumn = ({ id, isOver, children }: KanbanColumnProps) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: id,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: "column",
      id,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} className={`${styles.column} ${isOver ? styles.column_lifted : ""}`} style={style}>
      <div
        ref={setActivatorNodeRef}
        className={styles["column__header"]}
        {...attributes}
        {...listeners}
      >
        <p className={styles["column__title"]}>{id}</p>
      </div>

      <div ref={setDroppableNodeRef} className={styles["column__content"]}>
        {children}
      </div>
    </div>
  );
};
