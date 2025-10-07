import styles from "./KanbanColumnHeader.module.scss";
import type { Ref } from "react";

type KanbanColumnHeaderProps = {
  ref?: Ref<HTMLDivElement>;
  id?: string;
};

export const KanbanColumnHeader = ({ ref, id }: KanbanColumnHeaderProps) => {
  return (
    <div ref={ref} className={styles["header"]}>
      <p className={styles["header__title"]}>{id}</p>
    </div>
  );
};
