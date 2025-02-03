import { create } from "zustand";
import { createClient } from "@/lib/supabase-client";
import { IS_ADMIN_VIEW } from "../utils/constants";

const supabase = createClient();

interface List {
  id: string;
  title: string;
  position: number;
  board_id: string;
}

interface Card {
  id: string;
  content: string;
  description: string;
  list_id: string;
  position: number;
  created_at: string;
  date_due: string | null;
  status: string;
  priority: string;
  board_id: string;
}

interface DeleteConfirmation {
  isOpen: boolean;
  listId: string | null;
  cardCount: number;
}

interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  cards: Card[];
  isAdminView: boolean;
  isEditingBoardTitle: boolean;
  deleteConfirmation: DeleteConfirmation;
  comments: Comment[];
  fetchBoards: () => Promise<void>;
  createBoard: (title: string) => Promise<string | undefined>;
  setCurrentBoard: (boardId: string) => Promise<void>;
  fetchLists: (boardId: string) => Promise<void>;
  fetchCards: (boardId: string) => Promise<void>;
  addList: (title: string, boardId: string) => Promise<void>;
  updateListTitle: (id: string, title: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addCard: (content: string, listId: string) => Promise<void>;
  updateCardContent: (id: string, content: string) => Promise<void>;
  updateCardDescription: (id: string, description: string) => Promise<void>;
  updateCardDueDate: (id: string, dueDate: string | null) => Promise<void>;
  updateCardStatus: (id: string, status: string) => Promise<void>;
  updateCardPriority: (id: string, priority: string) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  updateBoardTitle: (id: string, title: string) => Promise<void>;
  setBoardTitle: (title: string) => void;
  setIsEditingBoardTitle: (isEditing: boolean) => void;
  moveCard: (cardId: string, newListId: string) => Promise<void>;
  openDeleteConfirmation: (listId: string, cardCount: number) => void;
  closeDeleteConfirmation: () => void;
  confirmDeleteList: () => Promise<void>;
  fetchComments: (cardId: string) => Promise<void>;
  addComment: (cardId: string, content: string) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
}

interface Board {
  id: string;
  title: string;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  isAdminView: IS_ADMIN_VIEW,
  isEditingBoardTitle: false,
  deleteConfirmation: {
    isOpen: false,
    listId: null,
    cardCount: 0,
  },
  comments: [],

  fetchBoards: async () => {
    const { data, error } = await supabase
      .from("Projects_Boards")
      .select("*")
      .order("created_at");
    if (error) console.error("Error fetching boards:", error);
    else set({ boards: data || [] });
  },

  createBoard: async (title: string) => {
    const { data, error } = await supabase
      .from("Projects_Boards")
      .insert({ title })
      .select();
    if (error) console.error("Error creating board:", error);
    else {
      set({ boards: [...get().boards, data[0]] });
      return data[0].id;
    }
  },

  setCurrentBoard: async (boardId: string) => {
    const board = get().boards.find((b) => b.id === boardId);
    if (board) {
      set({ currentBoard: board });
      await get().fetchLists(boardId);
      await get().fetchCards(boardId);
    } else {
      const { data: boardData, error: boardError } = await supabase
        .from("Projects_Boards")
        .select("*")
        .eq("id", boardId)
        .single();

      if (boardError) {
        console.error("Error fetching board:", boardError);
        return;
      }

      if (boardData) {
        set({ currentBoard: boardData, boards: [...get().boards, boardData] });
        await get().fetchLists(boardId);
        await get().fetchCards(boardId);
      }
    }
  },

  fetchLists: async (boardId: string) => {
    const { data, error } = await supabase
      .from("Projects_Lists")
      .select("*")
      .eq("board_id", boardId)
      .order("position");
    if (error) console.error("Error fetching lists:", error);
    else set({ lists: data || [] });
  },

  fetchCards: async (boardId: string) => {
    const { data, error } = await supabase
      .from("Projects_Cards")
      .select("*")
      .eq("board_id", boardId)
      .order("position");
    if (error) console.error("Error fetching cards:", error);
    else set({ cards: data || [] });
  },

  addList: async (title: string, boardId: string) => {
    const { data, error } = await supabase
      .from("Projects_Lists")
      .insert({ title, board_id: boardId, position: get().lists.length })
      .select();
    if (error) console.error("Error adding list:", error);
    else set({ lists: [...get().lists, data[0]] });
  },

  updateListTitle: async (id: string, title: string) => {
    const { error } = await supabase
      .from("Projects_Lists")
      .update({ title })
      .eq("id", id);
    if (error) console.error("Error updating list title:", error);
    else {
      const updatedLists = get().lists.map((list) =>
        list.id === id ? { ...list, title } : list
      );
      set({ lists: updatedLists });
    }
  },

  deleteList: async (id: string) => {
    const cardsInList = get().cards.filter((card) => card.list_id === id);

    // Delete all cards in the list
    for (const card of cardsInList) {
      const { error: cardError } = await supabase
        .from("Projects_Cards")
        .delete()
        .eq("id", card.id);
      if (cardError) {
        console.error("Error deleting card:", cardError);
        return;
      }
    }

    // Now delete the list
    const { error } = await supabase
      .from("Projects_Lists")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting list:", error);
    } else {
      const updatedLists = get().lists.filter((list) => list.id !== id);
      const updatedCards = get().cards.filter((card) => card.list_id !== id);
      set({ lists: updatedLists, cards: updatedCards });
    }

    // Close the confirmation modal
    get().closeDeleteConfirmation();
  },

  addCard: async (content: string, listId: string) => {
    const newCard = {
      content,
      list_id: listId,
      position: get().cards.filter((card) => card.list_id === listId).length,
      created_at: new Date().toISOString(),
      status: "ready",
      priority: "regular",
      board_id: get().currentBoard?.id!,
      description: "",
    };
    const { data, error } = await supabase
      .from("Projects_Cards")
      .insert(newCard)
      .select();
    if (error) {
      console.error("Error adding card:", error);
    } else {
      set({ cards: [...get().cards, data[0]] });
    }
  },

  updateCardContent: async (id: string, content: string) => {
    const { error } = await supabase
      .from("Projects_Cards")
      .update({ content })
      .eq("id", id);
    if (error) console.error("Error updating card content:", error);
    else {
      const updatedCards = get().cards.map((card) =>
        card.id === id ? { ...card, content } : card
      );
      set({ cards: updatedCards });
    }
  },

  updateCardDescription: async (id: string, description: string) => {
    const { error } = await supabase
      .from("Projects_Cards")
      .update({ description })
      .eq("id", id);
    if (error) console.error("Error updating card description:", error);
    else {
      const updatedCards = get().cards.map((card) =>
        card.id === id ? { ...card, description } : card
      );
      set({ cards: updatedCards });
    }
  },

  updateCardDueDate: async (id: string, dueDate: string | null) => {
    const { error } = await supabase
      .from("Projects_Cards")
      .update({ date_due: dueDate })
      .eq("id", id);
    if (error) console.error("Error updating card due date:", error);
    else {
      const updatedCards = get().cards.map((card) =>
        card.id === id ? { ...card, date_due: dueDate } : card
      );
      set({ cards: updatedCards });
    }
  },

  updateCardStatus: async (id: string, status: string) => {
    const { error } = await supabase
      .from("Projects_Cards")
      .update({ status })
      .eq("id", id);
    if (error) console.error("Error updating card status:", error);
    else {
      const updatedCards = get().cards.map((card) =>
        card.id === id ? { ...card, status } : card
      );
      set({ cards: updatedCards });
    }
  },

  updateCardPriority: async (id: string, priority: string) => {
    const { error } = await supabase
      .from("Projects_Cards")
      .update({ priority })
      .eq("id", id);
    if (error) console.error("Error updating card priority:", error);
    else {
      const updatedCards = get().cards.map((card) =>
        card.id === id ? { ...card, priority } : card
      );
      set({ cards: updatedCards });
    }
  },

  deleteCard: async (id: string) => {
    const { error } = await supabase.rpc("delete_card_with_comments", {
      target_card_id: id,
    });

    if (error) {
      console.error("Error deleting card and comments:", error);
    } else {
      const updatedCards = get().cards.filter((card) => card.id !== id);
      set({ cards: updatedCards });
    }
  },

  updateBoardTitle: async (id: string, title: string) => {
    const { error } = await supabase
      .from("Projects_Boards")
      .update({ title })
      .eq("id", id);
    if (error) console.error("Error updating board title:", error);
    else {
      const updatedBoards = get().boards.map((board) =>
        board.id === id ? { ...board, title } : board
      );
      set({
        boards: updatedBoards,
        currentBoard: { ...get().currentBoard!, title },
      });
    }
  },
  setBoardTitle: (title: string) => set({ boardTitle: title }),
  setIsEditingBoardTitle: (isEditing: boolean) =>
    set({ isEditingBoardTitle: isEditing }),
  moveCard: async (cardId: string, newListId: string) => {
    const { error } = await supabase
      .from("Projects_Cards")
      .update({ list_id: newListId })
      .eq("id", cardId);
    if (error) console.error("Error moving card:", error);
    else {
      const updatedCards = get().cards.map((card) =>
        card.id === cardId ? { ...card, list_id: newListId } : card
      );
      set({ cards: updatedCards });
    }
  },
  openDeleteConfirmation: (listId: string, cardCount: number) => {
    set({ deleteConfirmation: { isOpen: true, listId, cardCount } });
  },
  closeDeleteConfirmation: () => {
    set({ deleteConfirmation: { isOpen: false, listId: null, cardCount: 0 } });
  },
  confirmDeleteList: async () => {
    const { listId } = get().deleteConfirmation;
    if (listId) {
      await get().deleteList(listId);
    }
  },
  fetchComments: async (cardId: string) => {
    const { data, error } = await supabase
      .from("Projects_Comments")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching comments:", error);
    else set({ comments: data || [] });
  },

  addComment: async (cardId: string, content: string) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log("[addComment] User data:", userData);
    if (userError) {
      console.error("Error getting user:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("Projects_Comments")
      .insert({
        card_id: cardId,
        content,
        user_id: userData.user?.id,
      })
      .select();
    if (error) {
      console.error("Error adding comment:", error);
    } else {
      set({ comments: [data[0], ...get().comments] });
    }
  },

  updateComment: async (id: string, content: string) => {
    const { error } = await supabase
      .from("Projects_Comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) console.error("Error updating comment:", error);
    else {
      const updatedComments = get().comments.map((comment) =>
        comment.id === id
          ? { ...comment, content, updated_at: new Date().toISOString() }
          : comment
      );
      set({ comments: updatedComments });
    }
  },

  deleteComment: async (id: string) => {
    const { error } = await supabase
      .from("Projects_Comments")
      .delete()
      .eq("id", id);

    if (error) console.error("[deleteComment] Error deleting comment:", error);
    else {
      console.log("[deleteComment] Deleted comment:", id);
      const updatedComments = get().comments.filter(
        (comment) => comment.id !== id
      );

      set({ comments: updatedComments });
    }
  },
}));
