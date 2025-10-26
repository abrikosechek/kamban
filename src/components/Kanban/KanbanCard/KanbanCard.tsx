import styles from "./KanbanCard.module.scss";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

type KanbanCardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  id: string;
  lifted?: boolean;
};

export const KanbanCard = (props: KanbanCardProps) => {
  const { ref, children, id, style, lifted = false, ...otherProps } = props;

  return (
    <div
      ref={ref}
      className={`${styles.card} ${lifted ? styles.card_lifted : ""}`}
      style={style}
      {...otherProps}
    >
      <p>{id}</p>
      {children}
    </div>
  );
};
