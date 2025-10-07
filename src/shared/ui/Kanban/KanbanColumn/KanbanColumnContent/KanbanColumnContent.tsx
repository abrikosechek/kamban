import styles from "./KanbanColumnContent.module.scss";
import type { ReactNode, Ref } from "react";

type KanbanColumnHeaderProps = {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
};

export const KanbanColumnContent = ({
  children,
  ref,
}: KanbanColumnHeaderProps) => {
  return (
    <div ref={ref} className={styles["content"]}>
      {children}
    </div>
  );
};
