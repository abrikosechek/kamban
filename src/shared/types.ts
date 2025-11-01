export type ActiveItem =
  | {
      type: "card";
      cardId: string;
      columnId: string;
    }
  | {
      type: "column";
      columnId: string;
    };

export type OverItem =
  | {
      type: "card";
      cardId: string;
      columnId: string;
    }
  | {
      type: "column";
      columnId: string;
    };
