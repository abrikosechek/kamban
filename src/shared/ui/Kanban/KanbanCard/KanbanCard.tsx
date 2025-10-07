import styles from "./KanbanCard.module.scss";
import { type CSSProperties, type ReactNode, type Ref } from "react";

type KanbanCardProps = {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  id: string;
};

export const KanbanCard = ({ ref, children, id, style }: KanbanCardProps) => {
  return (
    <div ref={ref} className={styles.card} style={style}>
      <p>{id}</p>
      {children}
    </div>
  );
};
