import styles from "./KanbanColumnHeader.module.scss";
import type { HTMLAttributes, Ref } from "react";

type KanbanColumnHeaderProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
  id?: string;
};

export const KanbanColumnHeader = (props: KanbanColumnHeaderProps) => {
  const { ref, id, ...otherProps } = props;

  return (
    <div ref={ref} className={styles["header"]} {...otherProps}>
      <p className={styles["header__title"]}>{id}</p>
    </div>
  );
};
