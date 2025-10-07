import styles from "./KanbanCard.module.scss";
import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type KanbanCardProps = {
  id: string;
  columnId: string;
  children?: ReactNode;
};

export const KanbanCard = ({ id, columnId, children }: KanbanCardProps) => {
  const { listeners, attributes, setNodeRef, transform, transition } =
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
    <div
      ref={setNodeRef}
      className={styles.card}
      style={style}
      {...listeners}
      {...attributes}
    >
      <p>{id}</p>
      {children}
    </div>
  );
};
