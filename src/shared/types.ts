export type ActiveItem =
  | {
      type: "card";
      cardId: number;
      columnId: string;
    }
  | {
      type: "column";
      columnId: string;
    };

export type OverItem =
  | {
      type: "card";
      cardId: number;
      columnId: string;
    }
  | {
      type: "column";
      columnId: string;
    };

export type Task = {
  id: number;
  title: string;
};
