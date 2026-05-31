import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  city: string;
  likes: number;
  dislikes: number;
  commentedon: string;
}
const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  // const fetchedComments = [
  //   {
  //     _id: "1",
  //     videoid: videoId,
  //     userid: "1",
  //     commentbody: "Great video! Really enjoyed watching this.",
  //     usercommented: "John Doe",
  //     commentedon: new Date(Date.now() - 3600000).toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videoid: videoId,
  //     userid: "2",
  //     commentbody: "Thanks for sharing this amazing content!",
  //     usercommented: "Jane Smith",
  //     commentedon: new Date(Date.now() - 7200000).toISOString(),
  //   },
  // ];
  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div>Loading history...</div>;
  }
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post(
        "/comment/postcomment",
        {
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name,
          city: user.city,
        }
      );
      // if (res.data.comment) {
      //   const newCommentObj: Comment = {
      //     _id: Date.now().toString(),
      //     videoid: videoId,
      //     userid: user._id,
      //     commentbody: newComment,
      //     usercommented: user.name || "Anonymous",
      //     city: user.city || "",
      //     likes: 0,
      //     dislikes: 0,
      //     commentedon: new Date().toISOString(),
      //   };
      //   setComments([newCommentObj, ...comments]);
      // }

      if (res.data.comment) {

        setComments(prev => [
          res.data.comment,
          ...prev,
        ]);
      }
      setNewComment("");
    }
    catch (error: any) {

      alert(
        error?.response?.data?.message
        || "Failed to add comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res =
        await axiosInstance.post(
          `/comment/like/${commentId}`,
          {
            userId: user._id,
          }
        );
      setComments(
        prev =>
          prev.map(c => c._id === commentId ? { ...c, likes: res.data.likes, } : c
          )
      );

    } catch (error: any) {

      alert(
        error?.response?.data?.message
        || "Action failed"
      );
    }
  };

  const handleDislike = async (commentId: string) => {
    try {
      const res = await axiosInstance.post(
        `/comment/dislike/${commentId}`,
        {
          userId: user._id,
        }
      );
      if (res.data.deleted) {

        setComments(prev => prev.filter(c => c._id !== commentId));
        return;
      }

      setComments(prev =>
        prev.map(c => c._id === commentId ? { ...c, dislikes: res.data.dislikes, } : c
        )
      );

    } catch (error: any) {

      alert(
        error?.response?.data?.message
        || "Action failed"
      );
    }
  };

  const handleTranslate = async (commentId: string, text: string) => {

    try {
      console.log("Translate clicked");
      const res = await axiosInstance.post(
        "/comment/translate",
        {
          text,
          targetLanguage: selectedLanguage,
        }
      );

      console.log("Translation Response:", res.data);

      setTranslatedComments(
        prev => ({
          ...prev,
          [commentId]:
            res.data.translatedText,
        })
      );

    } catch (error) {
      console.log(error);
      alert(
        "Translation failed"
      );
    }
  };


  return (
    <div id="comments-section">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

        {user && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e: any) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setNewComment("")}
                  disabled={!newComment.trim()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.usercommented}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      • {comment.city}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(comment.commentedon))} ago
                    </span>
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={handleUpdateComment}
                          disabled={!editText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{comment.commentbody}</p>

                      <div className="flex flex-wrap gap-4 mt-2">

                        <button
                          onClick={() =>
                            handleLike(comment._id)
                          }
                        >
                          👍 {comment.likes}
                        </button>

                        <button
                          onClick={() =>
                            handleDislike(comment._id)
                          }
                        >
                          👎 {comment.dislikes}
                        </button>

                      </div>

                      <div className="mt-2">

                        <select
                          value={selectedLanguage}
                          onChange={(e) =>
                            setSelectedLanguage(
                              e.target.value
                            )
                          }
                          className=" border rounded px-2 py-1 text-sm bg-background text-foreground border-border " >
                          <option value="en" className=" bg-background text-foreground" >
                            English
                          </option>

                          <option value="hi" className="bg-background text-foreground">
                            Hindi
                          </option>

                          <option value="fr" className="bg-background text-foreground">
                            French
                          </option>

                          <option value="es" className="bg-background text-foreground">
                            Spanish
                          </option>

                          <option value="de" className="bg-background text-foreground">
                            German
                          </option>
                        </select>

                        <button
                          className="ml-2 text-blue-500"
                          onClick={() =>
                            handleTranslate(
                              comment._id,
                              comment.commentbody
                            )
                          }
                        >
                          Translate
                        </button>

                      </div>

                      {translatedComments[
                        comment._id
                      ] && (

                          <div className=" mt-2 text-sm italic text-muted-foreground " >
                            Translated:{" "}
                            {
                              translatedComments[
                              comment._id
                              ]
                            }
                          </div>
                        )}
                      {comment.userid === user?._id && (
                        <div className="flex gap-2 mt-2 text-sm text-gray-500">
                          <button onClick={() => handleEdit(comment)}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(comment._id)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
