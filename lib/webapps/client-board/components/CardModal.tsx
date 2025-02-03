import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBoardStore } from "../store/boardStore";
import { EditableField } from "./EditableField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isValid, parseISO } from "date-fns";
import { IS_ADMIN_VIEW } from "../utils/constants";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CardModalProps {
  card: {
    id: string;
    content: string;
    description: string;
    list_id: string;
    created_at: string;
    date_due: string | null;
    status: string;
    priority: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const {
    updateCardContent,
    updateCardDescription,
    updateCardDueDate,
    updateCardStatus,
    updateCardPriority,
    moveCard,
    deleteCard,
    lists,
    currentBoard,
    comments,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  } = useBoardStore();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const statuses = [
    "Ready",
    "In Progress",
    "In QA Review",
    "In Client Review",
    "Complete",
    "Blocked",
    "Backlog",
    "To Do",
    "Done",
  ];

  const priorities = [
    "Regular",
    "Bug",
    "Urgent",
    "Fix that shit rn",
    "Low",
    "Medium",
    "High",
    "Critical",
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date set";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "PPP") : "Invalid date";
  };

  const handleMoveCard = (newListId: string) => {
    moveCard(card.id, newListId);
  };

  const handleDeleteCard = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCard = () => {
    deleteCard(card.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  const user = useUser();

  useEffect(() => {
    fetchComments(card.id);
  }, [card.id, fetchComments]);

  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const handleAddComment = async (content: string) => {
    await addComment(card.id, content);
  };

  const handleUpdateComment = async (id: string, content: string) => {
    await updateComment(id, content);
  };

  const handleDeleteComment = async (id: string) => {
    console.log("[CardModal] Deleting comment", id);
    await deleteComment(id);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <div className="flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 p-4">
              {/* Title Section */}
              <section>
                <DialogHeader>
                  <DialogTitle>
                    <EditableField
                      initialValue={card.content}
                      onSave={(newContent) =>
                        updateCardContent(card.id, newContent)
                      }
                      isEditable={IS_ADMIN_VIEW}
                      inputComponent={Input}
                      className="font-bold text-xl"
                    />
                  </DialogTitle>
                </DialogHeader>
              </section>

              {/* Description Section */}
              <section>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <EditableField
                  initialValue={card.description}
                  onSave={(newDescription) =>
                    updateCardDescription(card.id, newDescription)
                  }
                  isEditable={IS_ADMIN_VIEW}
                  inputComponent={Textarea}
                  className="min-h-[100px] w-full"
                />
              </section>

              {/* Metadata Grid */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                {/* Dates Column */}
                <div id="date-created">
                  <h3 className="text-sm font-medium mb-2">Date Created</h3>
                  {IS_ADMIN_VIEW ? (
                    <Input
                      type="date"
                      value={
                        card.date_due
                          ? format(parseISO(card.created_at), "yyyy-MM-dd")
                          : ""
                      }
                      disabled
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {formatDate(card.created_at)}
                    </p>
                  )}
                </div>
                <div id="date-due">
                  <h3 className="text-sm font-medium mb-2">Due Date</h3>
                  {IS_ADMIN_VIEW ? (
                    <Input
                      type="date"
                      value={
                        card.date_due
                          ? format(parseISO(card.date_due), "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) =>
                        updateCardDueDate(card.id, e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {formatDate(card.date_due)}
                    </p>
                  )}
                </div>

                {/* Status and Priority Column */}
                <div className="space-y-4">
                  <div id="status">
                    <h3 className="text-sm font-medium mb-2">Status</h3>
                    {IS_ADMIN_VIEW ? (
                      <Select
                        onValueChange={(value) =>
                          updateCardStatus(card.id, value)
                        }
                        defaultValue={card.status}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem
                              key={status}
                              value={status.toLowerCase()}
                            >
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-500">{card.status}</p>
                    )}
                  </div>
                  <div id="priority">
                    <h3 className="text-sm font-medium mb-2">Priority</h3>
                    {IS_ADMIN_VIEW ? (
                      <Select
                        onValueChange={(value) =>
                          updateCardPriority(card.id, value)
                        }
                        defaultValue={card.priority}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem
                              key={priority}
                              value={priority.toLowerCase()}
                            >
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-500">{card.priority}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Card IDs */}
              <section id="card-ids" className="text-xs text-gray-400">
                <p>Card ID: {card.id}</p>
                <p>List ID: {card.list_id}</p>
              </section>

              {/* Danger Zone - Full Width */}
              {IS_ADMIN_VIEW && (
                <section className="col-span-full">
                  <Collapsible className="border rounded-md">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Additional Fields
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {/* Admin Actions Column - without delete button */}

                      <div className="space-y-4">
                        <div id="move-to-list">
                          <h3 className="text-sm font-medium mb-2">
                            Move to List
                          </h3>
                          <Select
                            onValueChange={handleMoveCard}
                            defaultValue={card.list_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select list" />
                            </SelectTrigger>
                            <SelectContent>
                              {lists
                                .filter(
                                  (list) => list.board_id === currentBoard?.id
                                )
                                .map((list) => (
                                  <SelectItem key={list.id} value={list.id}>
                                    {list.title}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-4">
                        <p className="text-sm text-gray-500">
                          Once you delete a card, there is no going back. Please
                          be certain.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteCard}
                          className="w-full"
                        >
                          Delete Card
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </section>
              )}

              {/* Comments Section */}
              <section className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Comments</h3>
                <div
                  ref={commentsContainerRef}
                  className="space-y-4 max-h-[300px] overflow-y-auto"
                >
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-2 bg-gray-50 p-2 rounded-lg"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.user_id}`}
                        />
                        <AvatarFallback>
                          {comment.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                          <span>
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                          {(IS_ADMIN_VIEW || user?.id === comment.user_id) && (
                            <div className="space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newContent = prompt(
                                    "Edit comment:",
                                    comment.content
                                  );
                                  if (newContent)
                                    handleUpdateComment(comment.id, newContent);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem(
                      "comment"
                    ) as HTMLInputElement;
                    if (input.value.trim()) {
                      await handleAddComment(input.value.trim());
                      input.value = "";
                      if (commentsContainerRef.current) {
                        commentsContainerRef.current.scrollTop = 0;
                      }
                    }
                  }}
                  className="mt-4"
                >
                  <Input
                    name="comment"
                    placeholder="Add a comment..."
                    className="mb-2"
                  />
                  <Button type="submit">Add Comment</Button>
                </form>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <p>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCard}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
