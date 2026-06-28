"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Save, Upload, FileText, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ScopeEditorProps {
  projectId: string;
  initialText?: string;
  onSaved?: (contentText: string) => void;
}

type Tab = "manual" | "upload";

export function ScopeEditor({ projectId, initialText = "", onSaved }: ScopeEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const charCount = text.length;
  const maxChars = 50000;

  async function handleSaveText() {
    if (text.trim().length < 10) {
      toast.error("Please enter at least 10 characters for your scope.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/scope`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentText: text, sourceType: "manual" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to save scope.");
        return;
      }
      setSaved(true);
      toast.success("Scope saved.");
      onSaved?.(text);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch(`/api/projects/${projectId}/scope/upload`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "Could not read this file.");
        return;
      }
      const extracted: string = json.scope.contentText;
      setText(extracted);
      setActiveTab("manual");
      setUploadFile(null);
      setSaved(true);
      toast.success(
        json.truncated
          ? "Scope extracted and saved (truncated to 50,000 characters)."
          : "Scope extracted and saved."
      );
      onSaved?.(extracted);
    } catch {
      setUploadError("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds 10 MB limit.");
      return;
    }
    setUploadFile(file);
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-slate-200">
        {(["manual", "upload"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab === "manual" ? "Type manually" : "Upload document"}
          </button>
        ))}
      </div>

      {/* Manual tab */}
      {activeTab === "manual" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Describe everything included in this project: features, deliverables, pages,
            integrations, and anything explicitly excluded.
          </p>
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, maxChars));
              setSaved(false);
            }}
            rows={12}
            placeholder="Example: This project includes a 5-page marketing website with a homepage, about page, services page, contact form, and blog. It does NOT include e-commerce functionality, user authentication, CMS setup beyond initial configuration, or SEO keyword research..."
            className="font-mono text-sm leading-relaxed resize-y"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${charCount > maxChars * 0.9 ? "text-amber-600" : "text-slate-400"}`}
            >
              {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
            </span>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
              <Button onClick={handleSaveText} loading={isSaving} size="sm">
                <Save className="w-4 h-4 mr-1.5" />
                Save Scope
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload tab */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Upload a PDF or DOCX file. We&apos;ll extract the text and use it as your scope.
            Max 10 MB.
          </p>

          <div
            className="border-2 border-dashed border-slate-200 rounded-lg p-10 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Click to choose a file
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF or DOCX · Max 10 MB</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {uploadFile && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{uploadFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setUploadFile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}

          <Button
            onClick={handleUpload}
            loading={isUploading}
            disabled={!uploadFile}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Upload and Extract Text
          </Button>
        </div>
      )}
    </div>
  );
}
