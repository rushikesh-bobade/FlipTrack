import type { Route } from "./+types/api.inventory.upload-image";
import { getSupabaseServerClient } from "~/utils/supabase.server";

/**
 * POST /api/inventory/upload-image
 *
 * Accepts a multipart/form-data body with an `image` field.
 * Uploads the file to the `inventory-images` Supabase Storage bucket
 * (public reads, authenticated uploads) and returns the public URL.
 *
 * Returns: { ok: true, url: string } | { ok: false, error: string }
 */
export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return Response.json({ ok: false, error: "No image file provided." }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(image.type)) {
    return Response.json(
      { ok: false, error: "Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF." },
      { status: 400 },
    );
  }

  // Validate file size (max 5 MB)
  const MAX_BYTES = 5 * 1024 * 1024;
  if (image.size > MAX_BYTES) {
    return Response.json({ ok: false, error: "Image exceeds the 5 MB size limit." }, { status: 400 });
  }

  const ext = image.name.split(".").pop() ?? "jpg";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("inventory-images")
    .upload(fileName, buffer, {
      contentType: image.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload-image] Supabase storage error:", uploadError);
    return Response.json(
      { ok: false, error: uploadError.message ?? "Upload failed. Please try again." },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("inventory-images").getPublicUrl(fileName);

  return Response.json({ ok: true, url: publicUrl });
}
