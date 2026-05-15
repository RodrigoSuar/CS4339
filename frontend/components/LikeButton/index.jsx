import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import './styles.css';
import api from "../../lib/api";

async function toggleLike(photoId) {
  const res = await api.post(`/photos/${photoId}/like`);
  return res.data;
}

export default function LikeButton({
  photoId,
  currentUserId,
  photoLikes = [],
}) {
  const queryClient = useQueryClient();
  const likeCount = photoLikes.length;
  const isLiked = currentUserId && photoLikes.includes(currentUserId);

  const mutation = useMutation({
    mutationFn: () => toggleLike(photoId),

    onSuccess: () => {
      // Invalidate the photos query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },

    onError: (error) => {
      console.error("Failed to toggle like:", error);
    },
  });

  return (
    <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className={`like-button ${mutation.isPending ? "pending" : ""}`}
        >
        <span>{isLiked ? "❤️" : "🤍"}</span>
        <span>{likeCount}</span>
    </button>
  );
}