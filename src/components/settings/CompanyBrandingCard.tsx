"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function CompanyBrandingCard({
  initialCompanyName,
  initialLogoUrl,
}: {
  initialCompanyName: string | null;
  initialLogoUrl: string | null;
}) {
  const [companyName, setCompanyName] = useState(initialCompanyName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setUploading(false);
      return;
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const filePath = `logos/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(filePath);
    const newLogoUrl = urlData.publicUrl;

    // Save to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ logo_url: newLogoUrl })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to save logo: " + updateError.message);
    } else {
      setLogoUrl(newLogoUrl);
      toast.success("Logo uploaded");
    }

    setUploading(false);
  }

  async function saveCompanyName() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ company_name: companyName.trim() || null })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Company name saved");
    }
  }

  async function removeLogo() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ logo_url: null })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      setLogoUrl("");
      toast.success("Logo removed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Your company name and logo appear on the public booking page that customers see.
        </p>

        {/* Company name */}
        <div className="space-y-2">
          <Label>Company Name</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Osaka Castle Walks"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Button size="sm" onClick={saveCompanyName} disabled={saving}>
              {saving ? "..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Shown as the header on your booking page. Leave blank to show &quot;TourSync&quot;.
          </p>
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label>Logo</Label>
          {logoUrl && (
            <div className="flex items-center gap-3">
              <Image
                src={logoUrl}
                alt="Company logo"
                width={64}
                height={64}
                className="rounded border"
              />
              <Button variant="ghost" size="sm" className="text-destructive" onClick={removeLogo}>
                Remove
              </Button>
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: square image, under 2MB. Shows next to your company name.
          </p>
        </div>

        {/* Preview */}
        {(companyName || logoUrl) && (
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-center gap-2 font-bold">
              {logoUrl ? (
                <Image src={logoUrl} alt="" width={28} height={28} className="rounded" />
              ) : null}
              {companyName || "TourSync"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
