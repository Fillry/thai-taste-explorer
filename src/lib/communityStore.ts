import { useSyncExternalStore } from "react";
import { CommunityReview, mockReviews } from "./mockData";

let reviews: CommunityReview[] = [...mockReviews];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const communityStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get(): CommunityReview[] {
    return reviews;
  },
  add(r: Omit<CommunityReview, "id" | "likes" | "liked" | "createdAt">) {
    const review: CommunityReview = {
      ...r,
      id: `rev_${Date.now()}`,
      likes: 0,
      liked: false,
      createdAt: "Just now",
    };
    reviews = [review, ...reviews];
    emit();
  },
  toggleLike(id: string) {
    reviews = reviews.map((r) =>
      r.id === id ? { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) } : r
    );
    emit();
  },
};

export const useCommunityReviews = () =>
  useSyncExternalStore(communityStore.subscribe, communityStore.get, communityStore.get);
