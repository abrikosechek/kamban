import styles from "./KanbanCard.module.scss";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useMemo,
} from "react";
import { useTasksStore } from "@/store";

type KanbanCardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  taskId: number;
  style?: CSSProperties;
  lifted?: boolean;
};

export const KanbanCard = (props: KanbanCardProps) => {
  const { ref, children, taskId, style, lifted = false, ...otherProps } = props;

  const { tasks } = useTasksStore();

  const task = useMemo(
    () => tasks.find((task) => task.id === taskId),
    [taskId, tasks],
  );

  return (
    <div
      ref={ref}
      className={`${styles.card} ${lifted ? styles.card_lifted : ""}`}
      style={style}
      {...otherProps}
    >
      {task ? (
        <>
          <p>{task.title}</p>
          {children}
        </>
      ) : (
        <p>Task with id "{taskId}" not found</p>
      )}
    </div>
  );
};
