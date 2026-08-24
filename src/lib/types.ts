export type Profession =
  | "ricercatore"
  | "medico"
  | "artista"
  | "pittore"
  | "arte_e_benessere"
  | "farmacista"
  | "altro";

export const PROFESSIONS: { value: Profession; label: string; blurb: string }[] = [
  { value: "ricercatore", label: "Ricerca", blurb: "Studi, dati, pubblicazioni" },
  { value: "medico", label: "Medicina", blurb: "Clinica e divulgazione" },
  { value: "artista", label: "Arte", blurb: "Opere e processo creativo" },
  { value: "pittore", label: "Pittura", blurb: "Tele, tecnica, materia" },
  { value: "arte_e_benessere", label: "Arte e benessere", blurb: "Corpo, mente, pratica" },
  { value: "farmacista", label: "Farmacia", blurb: "Preparazioni e consulenza" },
  { value: "altro", label: "Altro", blurb: "Percorsi trasversali" },
];

export function professionLabel(value?: string | null) {
  return PROFESSIONS.find((p) => p.value === value)?.label ?? "Altro";
}

export type PostStatus = "pending" | "approved" | "rejected";
export type MediaType = "image" | "video" | "gif";

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  profession: Profession | null;
  birth_date: string | null;
  phone: string | null;
  public_email: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  city: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_admin: boolean;
  post_count: number;
  follower_count: number;
  following_count: number;
  created_at: string;
};

export type PostMedia = {
  id: string;
  post_id: string;
  url: string;
  media_type: MediaType;
  position: number;
};

export type Post = {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  category: string | null;
  status: PostStatus;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  author: Pick<
    Profile,
    "id" | "username" | "full_name" | "avatar_url" | "profession"
  > | null;
  media: PostMedia[];
};

export type CommentWithAuthor = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};

export type NotificationType =
  | "post_approved"
  | "post_rejected"
  | "like"
  | "comment"
  | "repost"
  | "follow";

export type AppNotification = {
  id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  post_id: string | null;
  actor: Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "profession"> | null;
  post: { id: string; title: string | null } | null;
};
