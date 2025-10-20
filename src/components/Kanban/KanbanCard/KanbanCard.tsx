import styles from "./KanbanCard.module.scss";
import { type CSSProperties, type ReactNode, type Ref } from "react";

type KanbanCardProps = {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  id: string;
  lifted?: boolean;
};

export const KanbanCard = ({
  ref,
  children,
  id,
  style,
  lifted = false,
}: KanbanCardProps) => {
  return (
    <div
      ref={ref}
      className={`${styles.card} ${lifted ? styles.card_lifted : ""}`}
      style={style}
    >
      <p>{id}</p>
      {children}
    </div>
  );
};
