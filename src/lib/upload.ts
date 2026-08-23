"use client";

import { createClient } from "@/lib/supabase/client";

export const MAX_IMAGE_MB = 12;
export const MAX_VIDEO_MB = 90;

export type UploadResult = { url: string; path: string };

function extensionOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/")[1] ?? "bin";
}

export function validateFile(file: File): string | null {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) return `"${file.name}": formato non supportato.`;

  const limit = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  if (file.size > limit * 1024 * 1024) {
    return `"${file.name}" supera il limite di ${limit} MB.`;
  }
  return null;
}

/** Carica un file nella cartella personale dell'utente dentro l'archivio "media". */
export async function uploadFile(
  file: File,
  userId: string,
  folder = "post"
): Promise<UploadResult> {
  const supabase = createClient();
  const ext = extensionOf(file);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const path = `${userId}/${folder}/${name}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, path };
}
