import styles from "./KanbanColumn.module.scss";
import { type ReactNode } from "react";

type KanbanColumnProps = {
  children?: ReactNode;
  id: string;
  border?: boolean;
};

export const KanbanColumn = ({
  children,
  border = false,
}: KanbanColumnProps) => {
  return (
    <div className={`${styles.column} ${border ? styles.column_lifted : ""}`}>
      {children}
    </div>
  );
};
