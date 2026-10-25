"use client";

import { useState } from "react";
import { updateReviewStatusAction, deleteReviewAction, replyToReviewAction } from "@/lib/actions/review.actions";

export function ReviewAdminActions({ reviewId, status }: { reviewId: string, status: string }) {
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStatus = async (newStatus: "PUBLISHED" | "PENDING") => {
    setLoading(true);
    await updateReviewStatusAction(reviewId, newStatus);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this review permanently?")) return;
    setLoading(true);
    await deleteReviewAction(reviewId);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("message", replyText);
    await replyToReviewAction(reviewId, fd);
    setReplyText("");
    setLoading(false);
  };

  return (
    <div className="w-full md:w-72 flex flex-col gap-3">
      <button 
        onClick={() => handleStatus(status === "PUBLISHED" ? "PENDING" : "PUBLISHED")}
        disabled={loading}
        className={`btn w-full ${status === "PUBLISHED" ? "btn-outline-light" : "btn-primary"}`}
      >
        {loading ? "Updating..." : status === "PUBLISHED" ? "Unpublish" : "Approve & Publish"}
      </button>
      
      <form onSubmit={handleReply} className="flex gap-2">
        <input 
          value={replyText} 
          onChange={e => setReplyText(e.target.value)} 
          placeholder="Write a reply..." 
          className="input" 
          required 
        />
        <button type="submit" disabled={loading} className="btn btn-primary">Send</button>
      </form>
      
      <button onClick={handleDelete} disabled={loading} className="btn text-danger hover:bg-danger/10 w-full">
        Delete Review
      </button>
    </div>
  );
}