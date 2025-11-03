import { create } from "zustand/react";
import type { Task } from "@/shared/types.ts";

type State = {
  tasks: Task[];
};

type Store = State;

export const useTasksStore = create<Store>()(() => ({
  tasks: [
    {
      id: 1,
      title: "Eat soup",
    },
    {
      id: 2,
      title: "Write a book",
    },
    {
      id: 3,
      title: "asd1",
    },
    {
      id: 4,
      title: "asd2",
    },
    {
      id: 5,
      title: "asd3",
    },
    {
      id: 6,
      title: "Cook",
    },
    {
      id: 7,
      title: "Cook 1",
    },
    {
      id: 8,
      title: "Cook 2",
    },
  ],
}));
