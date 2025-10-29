import styles from "./KanbanColumn.module.scss";
import { type HTMLAttributes, type ReactNode, type Ref } from "react";

type KanbanColumnProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  border?: boolean;
};

export const KanbanColumn = (props: KanbanColumnProps) => {
  const { ref, children, border = false, ...otherProps } = props;

  return (
    <div ref={ref} className={`${styles.column} ${border ? styles.column_lifted : ""}`} {...otherProps}>
      {children}
    </div>
  );
};
